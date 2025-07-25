// Mobile Navigation
const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
const nav = document.querySelector('nav');

mobileNavToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
    document.body.classList.toggle('nav-active');
});

// Theme Toggle
const themeToggle = document.querySelector('.theme-toggle');
const htmlElement = document.documentElement;

themeToggle.addEventListener('click', () => {
    htmlElement.classList.toggle('dark-theme');
    localStorage.setItem('theme', htmlElement.classList.contains('dark-theme') ? 'dark' : 'light');
});

// Set initial theme
if (localStorage.getItem('theme') === 'dark') {
    htmlElement.classList.add('dark-theme');
}

// Chat Functionality
const chatInput = document.querySelector('.chat-input');
const sendBtn = document.querySelector('.send-btn');
const chatMessages = document.querySelector('.chat-messages');
const newChatBtn = document.querySelector('.new-chat-btn');
const historyItems = document.querySelector('.history-items');

// Typing Indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'bot', 'typing');
    typingDiv.innerHTML = `<div class="avatar">🤖</div><div class="message-content">...</div>`;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingDiv;
}

// Send Message
async function sendMessage(text, isUser = true) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', isUser ? 'user' : 'bot');
    messageDiv.innerHTML = `<div class="avatar">${isUser ? 'U' : '🤖'}</div><div class="message-content">${text}</div>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendBtn.addEventListener('click', async () => {
    const message = chatInput.value.trim();
    if (!message) return;

    sendMessage(message);
    chatInput.value = '';

    const typingIndicator = showTypingIndicator();
    try {
        const response = await fetch("http://localhost:5000/generate-prompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_prompt: message }),
        });

        const data = await response.json();
        typingIndicator.remove();

        if (data.optimizedPrompt) {
            sendMessage(`🔹 Optimized Prompt:\n${data.optimizedPrompt}`, false);
            saveToHistory(message, data.optimizedPrompt);
        } else {
            sendMessage("⚠️ Error: No optimized prompt received.", false);
        }
    } catch (error) {
        console.error("❌ Server Error:", error);
        sendMessage("⚠️ Server error. Please try again.", false);
    }
});

// Save Chat History
function saveToHistory(userPrompt, aiResponse) {
    let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    chatHistory.unshift({ userPrompt, aiResponse });
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

loadChatHistory();

// Smooth Scrolling
document.querySelectorAll("nav ul li a").forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        document.getElementById(link.getAttribute("href").substring(1)).scrollIntoView({ behavior: "smooth" });
    });
});
