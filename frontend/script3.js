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

// Show Typing Indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'bot', 'typing');
    typingDiv.innerHTML = `
        <div class="avatar">🤖</div>
        <div>
            <div class="message-content">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingDiv;
}

// Send Message
async function sendMessage(text, isUser = true) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', isUser ? 'user' : 'bot');
    messageDiv.innerHTML = `
        <div class="avatar">${isUser ? 'U' : '🤖'}</div>
        <div>
            <div class="message-content">${text}</div>
            <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
    `;
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
        console.error("❌ Error communicating with backend:", error);
        sendMessage("⚠️ Server error. Please try again.", false);
    }
});

// Save Chat History
function saveToHistory(userPrompt, aiResponse) {
    const chatItem = document.createElement("div");
    chatItem.classList.add("history-item");
    chatItem.innerHTML = `
        <span class="history-text">${userPrompt}</span>
        <button class="delete-history">×</button>
    `;
    historyItems.prepend(chatItem);
    let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    chatHistory.unshift({ userPrompt, aiResponse });
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

// Load Chat History
function loadChatHistory() {
    let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    historyItems.innerHTML = "";
    chatHistory.forEach(({ userPrompt }) => {
        const chatItem = document.createElement("div");
        chatItem.classList.add("history-item");
        chatItem.innerHTML = `
            <span class="history-text">${userPrompt}</span>
            <button class="delete-history">×</button>
        `;
        historyItems.appendChild(chatItem);
    });
}
loadChatHistory();

// Restore Chat from History
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("history-text")) {
        let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
        let selectedChat = chatHistory.find(chat => chat.userPrompt === e.target.textContent);
        if (selectedChat) {
            chatMessages.innerHTML = ""; 
            sendMessage(selectedChat.userPrompt);
            sendMessage(selectedChat.aiResponse, false);
        }
    }
    if (e.target.classList.contains("delete-history")) {
        let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
        chatHistory = chatHistory.filter(chat => chat.userPrompt !== e.target.previousElementSibling.textContent);
        localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
        e.target.parentElement.remove();
    }
});

// Smooth Scrolling
document.querySelectorAll("nav ul li a").forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        const sectionId = link.getAttribute("href").substring(1);
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    });
});

// Enter Key for Sending Chat
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
    }
});
