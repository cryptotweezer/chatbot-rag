const chatLog = document.getElementById('chat-log');
const userInput = document.getElementById('user-input');

function sendMessage() {
    const message = userInput.value.trim();

    if (message === '') return;

    // Mostrar mensaje del usuario
    displayMessage('user', message);

    // Llamar al backend con documentos
    getChatbotResponseWithDocs(message);

    // Limpiar el input
    userInput.value = '';
}

function displayMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);

    const messageParagraph = document.createElement('p');
    messageParagraph.innerText = message;

    messageElement.appendChild(messageParagraph);
    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight; // scroll automático
}

function getChatbotResponseWithDocs(userMessage) {
    fetch('/askDocs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage }),
    })
    .then(response => response.json())
    .then(data => {
        displayMessage('chatbot', data.chatbotResponse);
    })
    .catch(error => {
        console.error('Error:', error);
        displayMessage('chatbot', '❌ Error connecting to the chatbot.');
    });
}

// Enviar mensaje con tecla Enter
userInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

function resetChat() {
    chatLog.innerHTML = '';
    userInput.value = '';
    displayMessage('chatbot', 'Hola, soy el asistente virtual de Mar y Aire. ¿En qué aspecto del comercio exterior colombiano te puedo ayudar hoy?');
}
