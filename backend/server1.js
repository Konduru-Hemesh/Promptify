const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");
const axios = require("axios");

const app = express();
app.use(express.json());

// ✅ CORS Fix: Allow Multiple Origins Dynamically
const allowedOrigins = ["http://localhost:5500", "http://127.0.0.1:3000"];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error("❌ CORS ERROR: Not allowed origin →", origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type"
}));

// ✅ Health Check Route
app.get("/health", (req, res) => {
    res.json({ status: "✅ Server is running!" });
});

// ✅ Route to Save a Prompt
app.post("/save-prompt", (req, res) => {
    const { user_prompt, ai_response } = req.body;

    if (!user_prompt || !ai_response) {
        return res.status(400).json({ error: "Both prompt and response are required." });
    }

    const sql = "INSERT INTO prompts (user_prompt, ai_response) VALUES (?, ?)";
    db.query(sql, [user_prompt, ai_response], (err, result) => {
        if (err) {
            console.error("❌ MySQL Error:", err.message);
            return res.status(500).json({ error: "Database error. Failed to save prompt." });
        }
        res.json({ message: "✅ Prompt saved successfully!", id: result.insertId });
    });
});

// ✅ Route to Retrieve All Prompts
app.get("/get-prompts", (req, res) => {
    const sql = "SELECT * FROM prompts ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ MySQL Error:", err.message);
            return res.status(500).json({ error: "Database error. Could not retrieve prompts." });
        }
        res.json(results);
    });
});

// ✅ Route to Generate an Optimized Prompt using Gemini API
app.post("/generate-prompt", async (req, res) => {
    let { user_prompt } = req.body;

    if (!user_prompt || typeof user_prompt !== "string" || user_prompt.trim().length === 0) {
        return res.status(400).json({ error: "A valid prompt is required." });
    }

    user_prompt = user_prompt.trim();

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

        console.log("🔹 Sending request to Gemini API...");

        const response = await axios.post(
            apiUrl,
            {
                contents: [
                    {
                        role: "user",
                        parts: [{ text: `Improve this prompt for better AI response: "${user_prompt}"` }]
                    }
                ]
            },
            { headers: { "Content-Type": "application/json" } }
        );

        console.log("🔹 API Response:", JSON.stringify(response.data, null, 2));

        if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
            return res.status(500).json({ error: "Invalid response from Gemini AI." });
        }

        let optimizedPrompt = response.data.candidates[0]?.content?.parts?.[0]?.text || user_prompt;

        // ✅ Save to MySQL Database
        const sql = "INSERT INTO prompts (user_prompt, ai_response) VALUES (?, ?)";
        db.query(sql, [user_prompt, optimizedPrompt], (err) => {
            if (err) {
                console.error("❌ MySQL Error:", err.message);
                return res.status(500).json({ error: "Failed to save optimized prompt in database." });
            }
            res.json({ message: "✅ Optimized prompt generated!", optimizedPrompt });
        });

    } catch (error) {
        console.error("❌ Gemini API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to generate optimized prompt." });
    }
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
