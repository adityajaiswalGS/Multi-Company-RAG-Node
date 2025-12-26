// backend/controllers/docController.js
const { Document } = require('../models');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../utils/s3Config');
const axios = require('axios'); // You may need to npm install axios

exports.uploadDocument = async (req, res) => {
    try {
        const { company_id } = req.user; // Coming from our Auth Middleware (we'll make this next)
        const file = req.file;

        if (!file) return res.status(400).json({ message: "No file uploaded" });

        // 1. Prepare S3 Key (Path: company_id/filename)
        const s3Key = `${company_id}/${Date.now()}-${file.originalname}`;

        // 2. Upload to AWS S3
        const uploadParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        await s3Client.send(new PutObjectCommand(uploadParams));
        const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

        // 3. Save Metadata to PostgreSQL via Sequelize
        const newDoc = await Document.create({
            file_name: file.originalname,
            file_url: fileUrl,
            status: 'processing',
            company_id: company_id
        });

        // 4. Trigger n8n Webhook for Processing (Chunking/Embedding)
        // We send the doc_id and company_id so n8n can update the status later
        try {
            await axios.post(process.env.N8N_DOCUMENT_WEBHOOK, {
                document_id: newDoc.id,
                company_id: company_id,
                file_url: fileUrl,
                file_name: file.originalname
            });
        } catch (n8nError) {
            console.error("n8n Webhook failed, but file is saved:", n8nError.message);
        }

        res.status(201).json({ message: "Document uploaded and processing started", document: newDoc });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: "Upload failed" });
    }
};