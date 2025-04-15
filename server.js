require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const path = require('path');
const { OpenAIAPI } = require('./openai');
const { embedAllDocuments } = require('./embedDocuments');
const { ChatOpenAI } = require('@langchain/openai');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta GPT general (por si quieres usarla independiente)
app.post('/getChatbotResponse', async (req, res) => {
    const { userMessage } = req.body;

    if (!userMessage) {
        return res.status(400).json({ chatbotResponse: '❗ Message is required.' });
    }

    try {
        const chatbotResponse = await OpenAIAPI.generateResponse(userMessage);
        res.json({ chatbotResponse });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ chatbotResponse: '❌ Internal server error.' });
    }
});

// Ruta inteligente con documentos
app.post('/askDocs', async (req, res) => {
    const { userMessage } = req.body;

    if (!userMessage) {
        return res.status(400).json({ chatbotResponse: '❗ Message is required.' });
    }

    try {
        console.log('📂 Procesando documentos...');

        const vectorStore = await embedAllDocuments();
        const resultsWithScore = await vectorStore.similaritySearchWithScore(userMessage, 10);

        // Mostrar puntuaciones en consola
        console.log('\n📊 Scores obtenidos:');
        resultsWithScore.forEach(([doc, score], i) => {
            console.log(`Fragmento ${i + 1} - Score: ${score.toFixed(3)}`);
        });

        const filteredResults = resultsWithScore.filter(([doc, score]) => score < 0.35);

        // Si no hay fragmentos relevantes, usar GPT general (fallback)
        if (filteredResults.length === 0) {
            console.log('⚠️ Sin contexto relevante. Activando fallback con GPT-4 general...');

            const fallback = new ChatOpenAI({
                temperature: 0.7,
                modelName: 'gpt-4o',
                openAIApiKey: process.env.OPENAI_API_KEY
            });

            const response = await fallback.call([
                {
                    role: 'system',
                    content: 'Eres el asistente virtual de Mar y Aire. Eres experto en comercio exterior colombiano. Responde con claridad, precisión y profesionalismo.'
                },
                {
                    role: 'user',
                    content: userMessage
                }
            ]);

            return res.json({ chatbotResponse: response.content });
        }

        // Si hay fragmentos útiles, usar el contexto
        const filtered = filteredResults.map(([doc]) => doc);
        const context = filtered.map(doc => doc.pageContent).join('\n---\n');

        const chat = new ChatOpenAI({
            temperature: 0.7,
            modelName: 'gpt-4',
            openAIApiKey: process.env.OPENAI_API_KEY
        });

        const response = await chat.call([
            {
                role: 'system',
                content: `Eres el asistente virtual de Mar y Aire, experto en comercio exterior colombiano. Cuando se te proporcione contexto legal extraído de documentos, úsalo si es útil para responder mejor la pregunta. Si el contexto no ayuda, puedes usar tu conocimiento general sin decir que el documento no contiene información.`
            },
            {
                role: 'user',
                content: `Contexto:\n${context}\n\nPregunta:\n${userMessage}`
            }
        ]);

        res.json({ chatbotResponse: response.content });

    } catch (err) {
        console.error('❌ Error al responder con documentos:', err);
        res.status(500).json({ chatbotResponse: '❌ Error procesando la pregunta con documentos.' });
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
});
