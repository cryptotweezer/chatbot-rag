require('dotenv').config();
const { embedAllDocuments } = require('./embedDocuments');
const { ChatOpenAI } = require('@langchain/openai');

async function askQuestion(query) {
    // 1. Generamos o cargamos los embeddings
    const vectorStore = await embedAllDocuments();

    // 2. Buscamos los fragmentos más relevantes
    const results = await vectorStore.similaritySearch(query, 3);

    console.log('\n🔎 Fragments encontrados:\n');
    results.forEach((doc, i) => {
        console.log(`🧩 Fragmento ${i + 1} (source: ${doc.metadata.source})`);
        console.log(doc.pageContent.slice(0, 300) + '...\n');
    });

    // 3. Enviamos esos fragmentos como contexto al modelo
    const chat = new ChatOpenAI({
        temperature: 0.7,
        modelName: 'gpt-4o',
        openAIApiKey: process.env.OPENAI_API_KEY
    });    

    const context = results.map(doc => doc.pageContent).join('\n---\n');

    const response = await chat.call([
        {
            role: 'system',
            content: 'Eres un experto en comercio exterior colombiano. Usa el contexto dado solo si es relevante. Si no lo es, responde con tu conocimiento general.'
        },
        {
            role: 'user',
            content: `Contexto:\n${context}\n\nPregunta:\n${query}`
        }
    ]);

    console.log('\n🤖 Respuesta del chatbot:\n');
    console.log(response.content);
}

// Ejemplo de uso:
askQuestion('¿Cuál es el objeto del Decreto 920 de 2023?');
