require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { extractTextFromPDF, splitTextIntoChunks } = require('./documentProcessor');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { FaissStore } = require('@langchain/community/vectorstores/faiss');
const { Document } = require('langchain/document');

const VECTOR_DIR = path.join(__dirname, 'vectorstore');

async function embedAllDocuments() {
    // FORZAR REGENERACIÓN: elimina cualquier archivo anterior
    const faissIndexPath = path.join(VECTOR_DIR, 'faiss.index');

if (!fs.existsSync(faissIndexPath)) {
    console.log('🧹 No se encontró faiss.index. Generando embeddings...');
} else {
    console.log('📥 Cargando embeddings desde disco...');
    return await FaissStore.load(VECTOR_DIR, new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }));
}


    const documentsDir = path.join(__dirname, 'documents');
    const files = fs.readdirSync(documentsDir).filter(file => file.endsWith('.pdf'));

    const docs = [];

    for (const file of files) {
        const filePath = path.join(documentsDir, file);
        console.log(`📄 Procesando: ${file}`);

        const rawText = await extractTextFromPDF(filePath);
        const chunks = splitTextIntoChunks(rawText, 800, 300);
        console.log(`📄 ${file} → ${chunks.length} fragmentos`);

        const docObjects = chunks.map((chunk, index) => new Document({
            pageContent: chunk,
            metadata: { source: file, chunk: index }
        }));

        docs.push(...docObjects);
    }

    console.log(`🧠 Total fragmentos para embed: ${docs.length}`);

    // Crear embeddings y guardarlos en disco
    const vectorStore = await FaissStore.fromDocuments(
        docs,
        new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY })
    );

    await vectorStore.save(VECTOR_DIR);
    console.log('✅ Embeddings generados y guardados en disco.');

    return vectorStore;
}

module.exports = { embedAllDocuments };
