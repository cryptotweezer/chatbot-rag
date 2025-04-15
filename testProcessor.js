const fs = require('fs');
const path = require('path');
const { extractTextFromPDF, splitTextIntoChunks } = require('./documentProcessor');

async function processAllPDFs() {
    const documentsDir = path.join(__dirname, 'documents');
    const files = fs.readdirSync(documentsDir).filter(file => file.endsWith('.pdf'));

    for (const file of files) {
        const filePath = path.join(documentsDir, file);
        console.log(`\n📄 Procesando archivo: ${file}`);

        try {
            const text = await extractTextFromPDF(filePath);
            const chunks = splitTextIntoChunks(text, 1000, 200);

            console.log(`✅ Extraído y dividido. Fragmentos: ${chunks.length}`);
            console.log(`🧩 Primer fragmento:\n${chunks[0].slice(0, 300)}...`);
            console.log(`📄 ${file} → ${chunks.length} fragmentos generados`);


        } catch (err) {
            console.error(`❌ Error al procesar ${file}:`, err.message);
        }
    }
}

processAllPDFs();
