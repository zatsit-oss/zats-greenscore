
const fs = require('fs');
const xlsx = require('xlsx');

const excelFile = '48_CAT_Sustainable_API_GreenScore_V1-2.xlsx';
const jsonFile = 'src/data/surveyQuestions.json';

try {
    // Read JSON
    const jsonData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    const jsonMap = new Map();
    jsonData.forEach(item => {
        jsonMap.set(item.id.trim(), item);
    });

    // Read Excel
    if (!fs.existsSync(excelFile)) {
        throw new Error(`Excel file not found: ${excelFile}`);
    }
    const workbook = xlsx.readFile(excelFile);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Read as array of arrays
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    console.log('--- Comparison Report ---');

    let headerRowIndex = -1;
    let idColIndex = -1;
    let pointsColIndex = -1;

    // Find header row ("RuleID")
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const foundIdIndex = row.findIndex(cell => cell && typeof cell === 'string' && cell.toLowerCase() === 'ruleid'); // Exact match 'RuleID' based on dump

        if (foundIdIndex !== -1) {
            headerRowIndex = i;
            idColIndex = foundIdIndex;
            console.log(`Found main header "RuleID" at Row ${i} (Index ${i}), Column ${idColIndex}`);

            // Look for "Points" in the NEXT row
            if (i + 1 < rows.length) {
                const subHeaderRow = rows[i + 1];
                pointsColIndex = subHeaderRow.findIndex(cell => cell && typeof cell === 'string' && cell.toLowerCase() === 'points');
                if (pointsColIndex !== -1) {
                    console.log(`Found sub-header "Points" at Row ${i + 1}, Column ${pointsColIndex}`);
                }
            }

            // Fallback: If "Points" not found in next row, check current row (just in case) or look for "Score Evaluation"
            if (pointsColIndex === -1) {
                // Try "Score Evaluation" in main header row as fallback proxy
                pointsColIndex = row.findIndex(cell => cell && typeof cell === 'string' && cell.toLowerCase().includes('score evaluation'));
                if (pointsColIndex !== -1) {
                    console.log(`Using "Score Evaluation" column context at Index ${pointsColIndex}`);
                }
            }
            break;
        }
    }

    if (idColIndex === -1) {
        throw new Error('Could not find "RuleID" column.');
    }
    if (pointsColIndex === -1) {
        console.warn('WARNING: Could not find "Points" column. Defaults to index 6 based on manual inspection.');
        pointsColIndex = 6;
    }

    let inconsistencies = [];
    let checkedCount = 0;

    // Data starts 2 rows after RuleID header (RuleID row, Subheader row, Data)
    // i.e., Row 3 is RuleID, Row 4 is Points, Row 5 is Data. width diff 2.
    const startRow = headerRowIndex + 2;

    for (let i = startRow; i < rows.length; i++) {
        const row = rows[i];
        if (!row) continue;

        const id = row[idColIndex];
        // Skip empty IDs
        if (!id || typeof id !== 'string') continue;

        const cleanId = id.trim();
        // Validate ID format ARxx, DExx
        if (!/^[A-Z]{2}\d{2}$/.test(cleanId)) continue;

        const jsonItem = jsonMap.get(cleanId);

        if (!jsonItem) {
            inconsistencies.push(`[MISSING IN APP] ${cleanId}: Present in Excel but not in App (JSON).`);
        } else {
            checkedCount++;
            const excelPointsFn = row[pointsColIndex];
            const cleanExcelPoints = parseInt(excelPointsFn, 10);

            if (isNaN(cleanExcelPoints)) {
                // Only report if it's supposed to be a number.
                // inconsistencies.push(`[INVALID POINTS] ${cleanId}: "${excelPointsFn}"`);
            } else {
                // Exact match check
                if (jsonItem.points !== cleanExcelPoints) {
                    inconsistencies.push(`[SCORE MISMATCH] ${cleanId}: Excel=${cleanExcelPoints}, App=${jsonItem.points}`);
                } else {
                    // Matches
                }
            }

            // Verify special formula descriptions if possible? (US06, US07)
            // For now just points.
        }
    }

    console.log(`Checked ${checkedCount} items.`);

    if (inconsistencies.length === 0) {
        console.log('✅ SUCCESS: All scores match perfectly.');
    } else {
        console.log('❌ DISCREPANCIES FOUND:');
        inconsistencies.forEach(msg => console.log(msg));
    }

} catch (error) {
    console.error('Error:', error.message);
}
