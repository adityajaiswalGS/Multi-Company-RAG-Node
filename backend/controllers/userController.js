// backend/controllers/userController.js
const { User } = require('../models');
const bcrypt = require('bcrypt');

/**
 * GET /api/admin/users
 * Lists all users belonging to the authenticated admin's company
 */
exports.getCompanyUsers = async (req, res) => {
    try {
        // Multi-tenant isolation: filter by the company_id attached in authMiddleware
        const users = await User.findAll({
            where: { company_id: req.user.company_id },
            attributes: { exclude: ['password'] }, // Security: never send passwords
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
};

/**
 * POST /api/admin/users
 * Admin creates a new user under their specific company
 */
exports.createUser = async (req, res) => {
    try {
        const { email, password, full_name, role } = req.body;
        const adminCompanyId = req.user.company_id;

        // 1. Check for Internal Conflict (Same Company)
        const internalUser = await User.findOne({ where: { email, company_id: adminCompanyId } });
        if (internalUser) {
            return res.status(400).json({ message: "User already exists in your company." });
        }

        // 2. Check for External Conflict (Different Company)
        const globalUser = await User.findOne({ where: { email } });
        if (globalUser) {
            return res.status(409).json({ 
                message: "This email is registered with another organization. Please use a different email or contact support." 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            email,
            password: hashedPassword,
            full_name,
            role: role || 'user',
            company_id: adminCompanyId
        });

        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * DELETE /api/admin/users/:id
 * Revokes access for a specific user within the admin's company
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const adminCompanyId = req.user.company_id;

        // Ensure the user to be deleted belongs to the admin's company
        const user = await User.findOne({ 
            where: { id, company_id: adminCompanyId } 
        });
        
        if (!user) {
            return res.status(404).json({ message: "User not found in your company" });
        }

        // Prevent admins from deleting other admins via this route
        if (user.role === 'admin' || user.role === 'superadmin') {
            return res.status(403).json({ message: "Unauthorized: Cannot delete administrative roles" });
        }

        await user.destroy();
        res.json({ message: "User access revoked successfully" });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ message: "Delete operation failed" });
    }
};