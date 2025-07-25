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

// 🎯 **Dynamic Chat Header Icons (Play, Edit, Delete)**
document.querySelectorAll(".chat-controls .control-btn").forEach((btn, index) => {
    btn.addEventListener("click", () => {
        if (index === 0) {
            console.log("▶️ Play action triggered");
            alert("Playing last response...");
        } else if (index === 1) {
            console.log("✏️ Edit action triggered");
            chatInput.focus(); // Move cursor to input box
            chatInput.select(); // Highlight existing text for easy editing
        } else if (index === 2) {
            console.log("🗑 Delete action triggered");
            if (confirm("Are you sure you want to delete this prompt?")) {
                chatMessages.innerHTML = ""; // Clear chat
            }
        }
    });
});

// 🎯 **Make Navbar Buttons Navigate Smoothly**
document.querySelectorAll("nav ul li a").forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        const sectionId = link.getAttribute("href").substring(1);
        const section = document.getElementById(sectionId);
        
        if (section) {
            section.scrollIntoView({ behavior: "smooth" }); // Smooth scrolling to the section
        }
    });
});

// 📨 **Send Message Function**
async function sendMessage(text, isUser = true) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', isUser ? 'user' : 'bot');
    messageDiv.innerHTML = `
        <div class="avatar">${isUser ? 'U' : `🤖`}</div>
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


// 🎯 **Handle Sending Messages**
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

        if (data.aiResponse) {
            sendMessage(data.aiResponse, false); 
            saveToHistory(message, data.aiResponse);
        } else {
            sendMessage("⚠️ Error: No response received.", false);
        }
    } catch (error) {
        console.error("❌ Error communicating with backend:", error);
        sendMessage("⚠️ Server error. Please try again.", false);
    }
});

// 📝 **Save Chat History**
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

// 🏗 **Load Chat History on Page Load**
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

// 📜 **Click on History Item to Reload Chat**
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

    // ❌ **Delete Chat History**
    if (e.target.classList.contains("delete-history")) {
        let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
        chatHistory = chatHistory.filter(chat => chat.userPrompt !== e.target.previousElementSibling.textContent);
        localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
        e.target.parentElement.remove();
    }
});

// 🔄 **New Chat Button - Clear Chat**
newChatBtn.addEventListener('click', () => {
    chatMessages.innerHTML = "";
    chatInput.value = "";
});

// 🎯 **Category Selector**
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// 📝 **Prompt Actions (Copy, Edit, Save)**
document.addEventListener('click', (e) => {
    if (e.target.closest('.action-btn')) {
        const action = e.target.closest('.action-btn').textContent.toLowerCase();
        const promptBox = e.target.closest('.prompt-box');

        switch(action) {
            case 'copy':
                navigator.clipboard.writeText(promptBox.textContent.trim());
                alert("✅ Prompt copied!");
                break;
            case 'edit':
                promptBox.contentEditable = true;
                promptBox.focus();
                break;
            case 'save':
                promptBox.contentEditable = false;
                alert("✅ Prompt saved!");
                break;
        }
    }
});

// ⌨ **Enter Key for Chat**
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
    }
});
