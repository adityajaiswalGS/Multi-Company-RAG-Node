// backend/controllers/chatController.js
const axios = require('axios');

exports.queryRag = async (req, res) => {
    try {
        const { question, selected_doc_ids } = req.body;
        const { company_id } = req.user;

        // 1. Call n8n
        const n8nResponse = await axios.post(process.env.N8N_CHAT_WEBHOOK, {
            question,
            company_id,
            selected_doc_ids
        });

        // 2. CLEAN THE RESPONSE (The Fix)
        // If n8n returns { "output": "Hello" }, we extract just "Hello"
        let answerText = n8nResponse.data;

        if (typeof answerText === 'object' && answerText !== null) {
            answerText = answerText.output || answerText.text || JSON.stringify(answerText);
        }

        // 3. Send clean text to frontend
        res.json({ answer: answerText });

    } catch (error) {
        console.error("Chat Error:", error.message);
        // Send a friendly error message instead of crashing
        res.json({ answer: "I'm having trouble connecting to the AI right now. Please try again." });
    }
};