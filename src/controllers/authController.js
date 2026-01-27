const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { get } = require('../utils/helper');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, data: "Email and Password are required." });
        }

        // Check DB for admin
        const user = await get("SELECT * FROM users WHERE email = ?", [email]);

        if (!user) {
            return res.status(401).json({ success: false, data: "Invalid credentials." });
        }

        // Check Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, data: "Invalid credentials." });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(200).json({
            success: true,
            data: {
                token: token,
                user: { id: user.id, username: user.username }
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, data: err.message });
    }
};

module.exports = { login };