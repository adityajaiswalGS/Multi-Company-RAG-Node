// backend/controllers/superController.js
const { Company, User } = require('../models');
const bcrypt = require('bcrypt');

// [cite: 5] POST /api/super/companies - Create a new company
exports.createCompany = async (req, res) => {
    try {
        const { name } = req.body;

        // 1. Check if a company with this exact name already exists
        const existingCompany = await Company.findOne({ where: { name } });
        
        if (existingCompany) {
            // Return 409 (Conflict) specifically for duplicates
            return res.status(409).json({ message: "Company name already exists" });
        }

        // 2. If unique, create the new company
        const company = await Company.create({ name });
        res.status(201).json(company);

    } catch (err) {
        console.error("Create Company Error:", err);
        // Fallback for other errors (database connection, etc.)
        res.status(500).json({ message: "Internal server error" });
    }
};

// GET /api/super/companies - Fetch all companies
exports.getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.findAll({
            // Optional: Include user count or admin details
            attributes: ['id', 'name', 'createdAt']
        });
        res.status(200).json(companies);
    } catch (err) {
        res.status(500).json({ message: "Error fetching companies" });
    }
};

// [cite: 6] POST /api/super/admins - Create a primary admin for a company
exports.createCompanyAdmin = async (req, res) => {
    try {
        const { email, password, full_name, company_id } = req.body;
        
        // Ensure the company exists
        const company = await Company.findByPk(company_id);
        if (!company) return res.status(404).json({ message: "Company not found" });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const admin = await User.create({
            email,
            password: hashedPassword,
            full_name,
            role: 'admin', // 
            company_id
        });

        res.status(201).json({ message: "Company Admin created successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error creating company admin" });
    }
};