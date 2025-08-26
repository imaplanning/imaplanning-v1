document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN ---
    const BACKEND_URL = 'https://imaplanning-v1-43541563769.northamerica-south1.run/chat';
    const CALENDLY_URL = 'https://calendly.com/imaplanning';

    // --- ELEMENTOS DEL DOM ---
    const contactFormContainer = document.getElementById('contact-form-container');
    const chatInputArea = document.querySelector('.chat-input-area');
    const submitContactButton = document.getElementById('submit-contact-button');
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const modal = document.getElementById('privacy-modal');
    const privacyLink = document.getElementById('privacy-link');
    const footerPrivacyLink = document.getElementById('footer-privacy-link');
    const closeModalButton = document.querySelector('.close-button');
    const privacyCheckbox = document.getElementById('privacy-check');
    
    let conversationHistory = [];

    // --- LÓGICA DE CONSENTIMIENTO Y ARRANQUE ---
    privacyCheckbox.addEventListener('change', () => {
        const isChecked = privacyCheckbox.checked;
        userInput.disabled = !isChecked;
        sendButton.disabled = !isChecked;
        if (isChecked && conversationHistory.length === 0) {
            sendMessageToAI("Hola");
        }
    });

    // --- LÓGICA DEL MODAL DE PRIVACIDAD ---
    function openModal() { modal.style.display = 'block'; }
    function closeModal() { modal.style.display = 'none'; }
    
    privacyLink.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    footerPrivacyLink.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    closeModalButton.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => { if (event.target == modal) closeModal(); });

    // --- LÓGICA DEL CHAT Y CAPTURA DE LEAD ---
    async function sendMessageToAI(messageText) {
        if (messageText.trim() === '') return;
        
        addMessage(messageText, 'user');
        conversationHistory.push({role: 'user', parts: [{text: messageText}]});
        userInput.value = '';
        showTypingIndicator();

        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ history: conversationHistory }),
            });
            removeTypingIndicator();
            if (!response.ok) throw new Error('Respuesta no exitosa del servidor.');
            const data = await response.json();
            addMessage(data.reply, 'ai');
            conversationHistory.push({role: 'model', parts: [{text: data.reply}]});

            if (data.reply.includes("déjanos tus datos")) {
                chatInputArea.style.display = 'none';
                contactFormContainer.style.display = 'block';
            }
        } catch (error) {
            removeTypingIndicator();
            console.error('Error al contactar a la IA:', error);
            addMessage('Lo siento, hubo un problema de conexión. Por favor, inténtalo de nuevo.', 'ai');
        }
    }
    
    submitContactButton.addEventListener('click', () => {
        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        if(name && email) {
            // Aquí se enviaría la info a Google Sheets
            console.log(`Lead capturado: Nombre=${name}, Email=${email}`);
            contactFormContainer.innerHTML = `<p>¡Gracias! Tus datos han sido guardados. Ahora puedes agendar tu sesión.</p><a href="${CALENDLY_URL}" target="_blank" class="calendly-button">Agendar Ahora</a>`;
        }
    });

    function handleSendMessage() { sendMessageToAI(userInput.value); }
    sendButton.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') handleSendMessage(); });

    function addMessage(message, sender) { /* ... (código completo abajo) ... */ }
    function showTypingIndicator() { /* ... (código completo abajo) ... */ }
    function removeTypingIndicator() { /* ... (código completo abajo) ... */ }
});

// --- FUNCIONES AUXILIARES COMPLETAS ---
function addMessage(message, sender) {
    const chatWindow = document.getElementById('chat-window');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    const pElement = document.createElement('p');
    pElement.textContent = message;
    messageElement.appendChild(pElement);
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
function showTypingIndicator() {
    const chatWindow = document.getElementById('chat-window');
    const typingElement = document.createElement('div');
    typingElement.id = 'typing-indicator';
    typingElement.classList.add('message', 'ai-message');
    typingElement.innerHTML = '<p><span class="dot"></span><span class="dot"></span><span class="dot"></span></p>';
    chatWindow.appendChild(typingElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
function removeTypingIndicator() {
    const chatWindow = document.getElementById('chat-window');
    const typingElement = document.getElementById('typing-indicator');
    if (typingElement) chatWindow.removeChild(typingElement);

}

