// backend/controllers/docController.js
const { Document } = require('../models');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../utils/s3Config');
const axios = require('axios');

// Upload logic (Your existing code)
exports.uploadDocument = async (req, res) => {
    try {
        const { company_id } = req.user; 
        const file = req.file;

        if (!file) return res.status(400).json({ message: "No file uploaded" });

        const s3Key = `${company_id}/${Date.now()}-${file.originalname}`;

        const uploadParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        await s3Client.send(new PutObjectCommand(uploadParams));
        const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

        const newDoc = await Document.create({
            file_name: file.originalname,
            file_url: fileUrl,
            status: 'processing',
            company_id: company_id
        });

        // Trigger n8n Webhook 
        try {
            await axios.post(process.env.N8N_DOCUMENT_WEBHOOK, {
                document_id: newDoc.id,
                company_id: company_id,
                file_url: fileUrl,
                file_name: file.originalname,
                // Passing additional fields from the form if needed
                context: req.body.context || '',
                important: req.body.important || '',
                instructions: req.body.instructions || ''
            });
        } catch (n8nError) {
            console.error("n8n Webhook failed:", n8nError.message);
        }

        res.status(201).json({ message: "Document uploaded and processing started", document: newDoc });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: "Upload failed" });
    }
};

exports.getDocs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Document.findAndCountAll({
            where: { company_id: req.user.company_id },
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset
        });

        res.status(200).json({
            documents: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                itemsPerPage: limit
            }
        });
    } catch (err) {
        console.error("Error fetching docs:", err);
        res.status(500).json({ message: "Failed to fetch documents" });
    }
};


exports.deleteDoc = async (req, res) => {
    try {
        const { id } = req.params;
        const company_id = req.user.company_id;

        // 1. Find the document in DB ensuring it belongs to the admin's company
        const doc = await Document.findOne({ where: { id, company_id } });
        if (!doc) return res.status(404).json({ message: "Document not found" });

        // 2. Extract S3 Key from the URL to delete from AWS
    
        const urlParts = doc.file_url.split('.com/');
        const s3Key = urlParts[1];

        const deleteParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: s3Key,
        };

        // 3. Delete from AWS S3
        await s3Client.send(new DeleteObjectCommand(deleteParams));

        // 4. Delete from Database
        await doc.destroy();

        res.status(200).json({ message: "Document deleted successfully" });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: "Failed to delete document" });
    }
};