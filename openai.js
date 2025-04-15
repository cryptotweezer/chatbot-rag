const { OpenAIAPIKey } = require('./config');
const fetch = require('node-fetch'); // asegúrate de tener node-fetch instalado

class OpenAIAPI {
    static async generateResponse(userMessage) {
        const apiKey = OpenAIAPIKey;
        const endpoint = 'https://api.openai.com/v1/chat/completions';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o', // modelo más potente
                    messages: [
                        {
                            role: 'system',
                            content: 'Eres el asistente virtual de Mar y Aire, una empresa especializada en comercio exterior colombiano. Tu trabajo es responder como un experto en esta materia, usando un lenguaje profesional, claro y útil.'
                        },
                        {
                            role: 'user',
                            content: userMessage
                        }
                    ],                    
                    max_tokens: 500,
                    temperature: 0.7
                }),
            });

            const responseData = await response.json();
            console.log('Response from OpenAI API:', responseData);

            if (responseData.choices && responseData.choices.length > 0) {
                return responseData.choices[0].message.content.trim();
            } else {
                return '⚠️ No response from GPT model.';
            }
        } catch (error) {
            console.error('Error contacting OpenAI:', error);
            return '❌ There was an error contacting the AI service.';
        }
    }
}

module.exports = { OpenAIAPI };
