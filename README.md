
Efficient prompt Generator (Promptify)

🌟 AI Prompt Optimizer
📌 Project Overview
Promptify is a web-based tool designed to help users create *efficient AI prompts. It takes user input, structures it, and refines the prompt using *Google Gemini API, ensuring high-quality responses.

🚀 Features
✔ Generate optimized AI prompts using Gemini API
✔ Save and retrieve prompt history from MySQL database
✔ Interactive UI with chat-based prompt generation
✔ Dark mode toggle for better usability
✔ Persistent chat history stored in local storage
✔ REST API backend using Node.js and Express

project-root/ │-- 📂 backend/ # Express.js server (Node.js & MySQL) │ ├── server.js # Main backend server │ ├── db.js # Database connection setup │ ├── .env # API keys & database credentials │ ├── package.json # Backend dependencies │ │-- 📂 frontend/ # Frontend UI (HTML, CSS, JavaScript) │ ├── hello3.html # Main UI page │ ├── script.js # Frontend logic & API calls │ ├── style.css # UI styling and layout

🛠️ Technologies Used
🔹 Frontend: HTML, CSS, JavaScript
🔹 Backend: Node.js, Express.js
🔹 Database: MySQL (for prompt storage)
🔹 AI Integration: Google Gemini API
🔹 Storage: Local Storage for chat history

🔧 Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/your-username/hackathon_codeCrafters.git
cd hackathon_codeCrafters

2️⃣ Backend Setup:
cd backend
npm install       # Install dependencies
cp .env.example .env  # Create a .env file and add API keys & DB credentials
node server.js    # Start the backend

3️⃣ Frontend Setup
Simply open frontend/hello3.html in your browser.
Alternatively, use a local server (e.g., Live Server in VS Code).


🔸 More AI Models – Expand support beyond Gemini API
🔸 User Authentication – Allow users to save prompts to their accounts
🔸 Export & Share – Enable users to download and share prompt results
🔸 Advanced Prompt Customization – Add more control over AI-generated output

🤝 Contributors
🔹 Konduru Hemesh (CB.SC.U4CSE23724)
🔹 Rithvik Mukka (CB.SC.U4CSE23731)

