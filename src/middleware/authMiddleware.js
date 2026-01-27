const jwt = require('jsonwebtoken');
const JWT_SECRET = 'aloha_super_secret_key_2026'; // In production, put this in .env

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // Check if header exists "Bearer <token>"
    if (!authHeader) {
        return res.status(403).json({ success: false, data: "No token provided. Access Denied." });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ success: false, data: "Malformed token." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, data: "Invalid or expired token." });
    }
};

module.exports = { verifyToken, JWT_SECRET };