// backend/controllers/chatController.js
const axios = require('axios');

exports.queryRag = async (req, res) => {
    try {
        const { question, selected_doc_ids } = req.body;
        const { company_id } = req.user;

        // Call n8n RAG Webhook 
        const n8nResponse = await axios.post(process.env.N8N_CHAT_WEBHOOK, {
            question,
            company_id,
            selected_doc_ids
        });

        // n8n should return the generated text
        res.json({ answer: n8nResponse.data });
    } catch (error) {
        console.error("Chat Error:", error.message);
        res.status(500).json({ message: "Error communicating with AI" });
    }
};