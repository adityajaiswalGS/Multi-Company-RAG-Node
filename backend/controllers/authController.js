// backend/controllers/authController.js
const { User, Company } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email and include Company details
        const user = await User.findOne({ 
            where: { email },
            include: [{ model: Company }] // This uses the association we defined in the models
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Compare the provided password with the hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 3. Generate a JWT Token containing user identity and role
        // This token will be sent in the header of future requests
        const token = jwt.sign(
            { 
                id: user.id, 
                role: user.role, 
                company_id: user.company_id 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        // 4. Send back the token and user info (excluding the password)
        res.status(200).json({
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                role: user.role,
                company_name: user.Company ? user.Company.name : null,
                company_id: user.company_id
            }
        });
// const isMatch = await bcrypt.compare(password, user.password);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};