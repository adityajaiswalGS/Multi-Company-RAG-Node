// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(403).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch the latest user data from DB to ensure role/company_id are correct
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // Attach the full user object (including role and company_id)
        req.user = user; 
        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};