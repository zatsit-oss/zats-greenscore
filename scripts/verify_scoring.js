
const fs = require('fs');
const xlsx = require('xlsx');

const excelFile = '48_CAT_Sustainable_API_GreenScore_V1-2.xlsx';
const jsonFile = 'src/data/surveyQuestions.json';

try {
    // Read JSON
    const jsonData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    const jsonMap = new Map();
    jsonData.forEach(item => {
        jsonMap.set(item.id, item);
    });

    // Read Excel
    const workbook = xlsx.readFile(excelFile);
    const sheetName = workbook.SheetNames[0]; // Assuming first sheet
    const sheet = workbook.Sheets[sheetName];
    const excelData = xlsx.utils.sheet_to_json(sheet);

    console.log('--- Comparison Report ---');
    console.log(`Excel Rows: ${excelData.length}`);
    console.log(`JSON Items: ${jsonData.length}`);

    // Inspect first row to find column names if needed
    if (excelData.length > 0) {
        console.log('Excel Columns:', Object.keys(excelData[0]));
    }

    let inconsistencies = [];

    excelData.forEach(row => {
        // Determine mapping. Assuming 'ID' column exists or similar.
        // I'll try to guess key names based on common patterns if exact match fails.
        let id = row['ID'] || row['Id'] || row['id'];

        if (!id) return; // Skip rows without ID

        const jsonItem = jsonMap.get(id);

        if (!jsonItem) {
            inconsistencies.push(`[MISSING IN JSON] ${id}: Present in Excel but not in JSON.`);
        } else {
            // Compare Points
            // Excel column for points: 'Points', 'Score', 'Weight'?
            let validPoints = row['Points'] || row['Score'] || row['Weight'] || 0;

            if (jsonItem.points != validPoints) {
                inconsistencies.push(`[POINTS MISMATCH] ${id}: Excel=${validPoints}, JS=${jsonItem.points}`);
            }
        }
    });

    // Check for items in JSON but not in Excel
    const excelIds = new Set(excelData.map(r => r['ID'] || r['Id'] || r['id']));
    jsonData.forEach(item => {
        if (!excelIds.has(item.id)) {
            // inconsistencies.push(`[MISSING IN EXCEL] ${item.id}: Present in JSON but not in Excel.`);
            // Checking if it's strictly required to report this. User asked to verify if scores in app are good.
        }
    });

    if (inconsistencies.length === 0) {
        console.log('SUCCESS: No discrepancies found between Excel and JSON scores.');
    } else {
        console.log('FOUND DISCREPANCIES:');
        inconsistencies.forEach(msg => console.log(msg));
    }

} catch (error) {
    console.error('Error:', error.message);
}
