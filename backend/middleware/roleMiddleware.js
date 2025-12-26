exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};

exports.isSuperAdmin = (req, res, next) => {
    // Check if user exists (from authMiddleware) and has the correct role
    if (req.user && req.user.role === 'superadmin') {
        return next();
    }
    return res.status(403).json({ message: "Super Admin access required" });
};