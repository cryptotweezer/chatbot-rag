const fs = require('fs');
const pdfParse = require('pdf-parse');

/**
 * Extrae el texto completo de un archivo PDF.
 * @param {string} filePath Ruta del archivo PDF
 * @returns {Promise<string>} Texto plano del PDF
 */
async function extractTextFromPDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    
    // Limpieza básica del texto extraído
    let cleanText = pdfData.text;
    cleanText = cleanText.replace(/\r\n|\n|\r/g, ' '); // quitar saltos de línea
    cleanText = cleanText.replace(/\s+/g, ' ').trim(); // quitar espacios extra

    return cleanText;
}

/**
 * Divide el texto en fragmentos (chunks) para los embeddings.
 * @param {string} text Texto completo extraído del PDF
 * @param {number} chunkSize Cantidad de caracteres por fragmento
 * @param {number} overlap Cuántos caracteres se repiten entre fragmentos (para contexto)
 * @returns {string[]} Arreglo de fragmentos
 */
function splitTextIntoChunks(text, chunkSize = 800, overlap = 300) {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        const chunk = text.slice(start, end).trim();

        if (chunk.length > 20) {
            chunks.push(chunk);
        }

        start += chunkSize - overlap;
    }

    return chunks;
}

module.exports = {
    extractTextFromPDF,
    splitTextIntoChunks
};
