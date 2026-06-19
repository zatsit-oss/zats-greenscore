/**
 * Browser file helpers for downloading and reading text files.
 * Kept DOM-focused and minimal; business logic lives in services.
 */

/**
 * Trigger a client-side download of a text file.
 */
export function downloadTextFile(
    filename: string,
    content: string,
    mimeType = 'application/json'
): void {
    const blob = new Blob([content], {type: mimeType});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

/**
 * Read a File as UTF-8 text.
 */
export function readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsText(file);
    });
}
