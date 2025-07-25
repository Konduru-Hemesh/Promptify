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

// Send Message Function
async function sendMessage(text, isUser = true) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', isUser ? 'user' : 'bot');
    messageDiv.innerHTML = `
        <div class="avatar">${isUser ? 'U' : `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
            </svg>
        `}</div>
        <div>
            <div class="message-content">${text}</div>
            <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

// Send Button Click Event
sendBtn.addEventListener('click', async () => {
    const message = chatInput.value.trim();
    if (!message) return;
    
    sendMessage(message);
    chatInput.value = '';

    try {
        const response = await fetch("http://localhost:5000/generate-prompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_prompt: message }),
        });

        const data = await response.json();
        if (data.aiResponse) {
            sendMessage(data.aiResponse, false); 
            saveToHistory(message, data.aiResponse); // ✅ Save to history
        } else {
            sendMessage("⚠️ Error: No response received.", false);
        }
    } catch (error) {
        console.error("❌ Error communicating with backend:", error);
        sendMessage("⚠️ Server error. Please try again.", false);
    }
});

// Save Chat History Locally
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

// Load Chat History on Page Load
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

loadChatHistory(); // ✅ Load history when page loads

// Click on History Item to Reload Chat
// Click on History Item to Reload Chat
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("history-text")) {
        let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
        
        // Find the clicked chat in history
        let selectedChat = chatHistory.find(chat => chat.userPrompt === e.target.textContent);
        
        if (selectedChat) {
            // Clear current chat messages
            chatMessages.innerHTML = ""; 
            
            // Display old conversation
            sendMessage(selectedChat.userPrompt); // User message
            sendMessage(selectedChat.aiResponse, false); // AI response
        }
    }

    // Delete Chat History
    if (e.target.classList.contains("delete-history")) {
        let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
        
        // Remove the selected history item
        chatHistory = chatHistory.filter(chat => chat.userPrompt !== e.target.previousElementSibling.textContent);
        
        // Save updated history
        localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
        
        // Remove from UI
        e.target.parentElement.remove();
    }
});


// New Chat Button - Clear Chat
newChatBtn.addEventListener('click', () => {
    chatMessages.innerHTML = "";
    chatInput.value = "";
});

// Category Selector
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Prompt Actions (Copy, Edit, Save)
document.addEventListener('click', (e) => {
    if (e.target.closest('.action-btn')) {
        const action = e.target.closest('.action-btn').textContent.toLowerCase();
        const promptBox = e.target.closest('.prompt-box');
        
        switch(action) {
            case 'copy':
                navigator.clipboard.writeText(promptBox.textContent.trim());
                break;
            case 'edit':
                promptBox.contentEditable = true;
                promptBox.focus();
                break;
            case 'save':
                promptBox.contentEditable = false;
                break;
        }
    }
});

// Enter Key for Chat
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
    }
});
