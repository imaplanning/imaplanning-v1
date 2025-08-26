document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA DEL SPLASH SCREEN ---
    const splashScreen = document.getElementById('splash-screen');
    const splashLogo = document.getElementById('splash-logo');
    const splashText = document.getElementById('splash-text');

    if (splashScreen) {
        // Secuencia de la animación
        setTimeout(() => {
            if(splashLogo) splashLogo.style.opacity = '0';

            setTimeout(() => {
                if(splashText) splashText.style.opacity = '1';

                setTimeout(() => {
                    splashScreen.classList.add('fade-out');
                }, 2500); 
            }, 500);
        }, 1500);
    }
    
    // --- CONFIGURACIÓN ---
    const BACKEND_URL = '[PEGA AQUÍ TU URL DE CLOUD RUN]/chat';
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
    
    // --- HISTORIAL DE CONVERSACIÓN ---
    let conversationHistory = [];

    // --- LÓGICA DE CONSENTIMIENTO Y ARRANQUE ---
    if (privacyCheckbox) {
        privacyCheckbox.addEventListener('change', () => {
            const isChecked = privacyCheckbox.checked;
            userInput.disabled = !isChecked;
            sendButton.disabled = !isChecked;
            if (isChecked && conversationHistory.length === 0) {
                sendMessageToAI("Hola");
            }
        });
    }

    // --- LÓGICA DEL MODAL DE PRIVACIDAD ---
    function openModal() { if(modal) modal.style.display = 'block'; }
    function closeModal() { if(modal) modal.style.display = 'none'; }
    
    if (privacyLink) privacyLink.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    if (footerPrivacyLink) footerPrivacyLink.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    if (closeModalButton) closeModalButton.addEventListener('click', closeModal);
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
                if(chatInputArea) chatInputArea.style.display = 'none';
                if(contactFormContainer) contactFormContainer.style.display = 'block';
            }
        } catch (error) {
            removeTypingIndicator();
            console.error('Error al contactar a la IA:', error);
            addMessage('Lo siento, hubo un problema de conexión. Por favor, inténtalo de nuevo.', 'ai');
        }
    }
    
    if (submitContactButton) {
        submitContactButton.addEventListener('click', () => {
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            if(name && email) {
                // Aquí se enviarían los datos a Google Sheets
                console.log(`Lead capturado: Nombre=${name}, Email=${email}`);
                if(contactFormContainer) contactFormContainer.innerHTML = `<p>¡Gracias! Tus datos han sido guardados. Ahora puedes agendar tu sesión.</p><a href="${CALENDLY_URL}" target="_blank" class="calendly-button">Agendar Ahora</a>`;
            }
        });
    }

    function handleSendMessage() { sendMessageToAI(userInput.value); }
    if (sendButton) sendButton.addEventListener('click', handleSendMessage);
    if (userInput) userInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') handleSendMessage(); });

    // --- FUNCIONES AUXILIARES DEL CHAT ---
    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        const pElement = document.createElement('p');
        pElement.textContent = message;
        messageElement.appendChild(pElement);
        if (chatWindow) chatWindow.appendChild(messageElement);
        if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
    }
    function showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.id = 'typing-indicator';
        typingElement.classList.add('message', 'ai-message');
        typingElement.innerHTML = '<p><span class="dot"></span><span class="dot"></span><span class="dot"></span></p>';
        if (chatWindow) chatWindow.appendChild(typingElement);
        if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
    }
    function removeTypingIndicator() {
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement && chatWindow) chatWindow.removeChild(typingElement);
    }
});
