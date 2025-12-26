// backend/controllers/userController.js
const { User } = require('../models');
const bcrypt = require('bcrypt');

// GET /api/admin/users - Lists all users for the admin's company
exports.getCompanyUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            where: { company_id: req.user.company_id },
            attributes: { exclude: ['password'] } // Security: never send passwords
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const adminCompanyId = req.user.company_id;

        const user = await User.findOne({ where: { id, company_id: adminCompanyId } });
        
        if (!user) return res.status(404).json({ message: "User not found in your company" });
        if (user.role === 'admin') return res.status(403).json({ message: "Cannot delete an admin" });

        await user.destroy();
        res.json({ message: "User access revoked" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
};

// POST /api/admin/users - Admin creates a new user
exports.createUser = async (req, res) => {
    try {
        const { email, password, full_name, role } = req.body;
        const adminCompanyId = req.user.company_id;

        // 1. Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // 2. Hash the new user's password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create user linked to the same company as the admin
        const newUser = await User.create({
            email,
            password: hashedPassword,
            full_name,
            role: role || 'user',
            company_id: adminCompanyId
        });

        res.status(201).json({ message: "User created successfully", userId: newUser.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};