// backend/middleware/roleMiddleware.js

/**
 * GENERAL ADMIN: Allows both Company Admin and Super Admin.
 * Use this for routes that both need to see (like viewing logs).
 */
exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: "Administrative access required" });
    }
    next();
};

/**
 * STRICT SUPER ADMIN: Only for system management (Companies/Admins).
 * Used for /api/super/* routes.
 */
exports.isSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'superadmin') {
        return next();
    }
    return res.status(403).json({ message: "Access Denied: Super Admin privileges required." });
};

/**
 * STRICT COMPANY ADMIN: Only for operational management (Users/Documents).
 * Use this for /api/admin/* routes to prevent Super Admins from seeing company data.
 */
exports.isStrictCompanyAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin')) {
        return next();
    }
    return res.status(403).json({ message: "Access Denied: Only Company Admins can perform operational tasks." });
};