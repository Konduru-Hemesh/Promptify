const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors({
    origin: "*",  // Allows all origins
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type"
}));

// Route to save a prompt
app.post("/save-prompt", (req, res) => {
    const { user_prompt, ai_response } = req.body;

    if (!user_prompt || !ai_response) {
        return res.status(400).json({ error: "Both prompt and response are required." });
    }

    const sql = "INSERT INTO prompts (user_prompt, ai_response) VALUES (?, ?)";
    db.query(sql, [user_prompt, ai_response], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Prompt saved successfully!", id: result.insertId });
    });
});

// Route to retrieve all prompts
app.get("/get-prompts", (req, res) => {
    const sql = "SELECT * FROM prompts ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Route to generate AI response using Gemini API
app.post("/generate-prompt", async (req, res) => {
    const { user_prompt } = req.body;

    if (!user_prompt) {
        return res.status(400).json({ error: "Prompt is required." });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

        console.log("🔹 Sending request to Gemini API...");
        console.log("🔑 Using API Key:", apiKey);

        const response = await axios.post(
            apiUrl,
            {
                contents: [{ role: "user", parts: [{ text: user_prompt }] }]
            },
            { headers: { "Content-Type": "application/json" } }
        );

        console.log("🔹 API Response:", JSON.stringify(response.data, null, 2));

        if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
            return res.status(500).json({ error: "Invalid API response from Gemini AI." });
        }

        // ✅ Extract AI response correctly
        const aiResponse = response.data.candidates[0]?.content?.parts?.[0]?.text || "No response generated.";

        // ✅ Save to MySQL database and send response only once
        const sql = "INSERT INTO prompts (user_prompt, ai_response) VALUES (?, ?)";
        db.query(sql, [user_prompt, aiResponse], (err) => {
            if (err) {
                console.error("❌ MySQL Error:", err.message);
                return res.status(500).json({ error: "Failed to save prompt in database." });
            }
            res.json({ message: "Prompt generated and saved!", aiResponse }); // ✅ Only sending once
        });

    } catch (error) {
        console.error("❌ Gemini API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to generate AI response." });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
