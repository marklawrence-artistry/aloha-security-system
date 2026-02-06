// ================================================
// FILE: src/controllers/auditController.js
// ================================================
const { all, get } = require('../utils/helper');

const getLogs = async (req, res) => {
    try {
        const { page = 1, limit = 15, search = '' } = req.query; // <-- Add search
        const offset = (page - 1) * limit;
        const searchTerm = `%${search}%`; // <-- Create search term

        // --- MODIFIED QUERY ---
        const query = `
            SELECT 
                al.id, 
                al.action, 
                al.details, 
                al.ip_address,
                al.timestamp,
                u.username as admin_username
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            WHERE (al.details LIKE ? OR u.username LIKE ?)  -- Search clause
            ORDER BY al.timestamp DESC
            LIMIT ? OFFSET ?
        `;

        const logs = await all(query, [searchTerm, searchTerm, limit, offset]); // <-- Add params
        
        // --- MODIFIED COUNT QUERY ---
        const countResult = await get(
            `SELECT COUNT(*) as count 
             FROM audit_logs al
             LEFT JOIN users u ON al.user_id = u.id
             WHERE (al.details LIKE ? OR u.username LIKE ?)`, 
            [searchTerm, searchTerm] // <-- Add params
        );
        
        const total_records = countResult.count;
        const total_pages = Math.ceil(total_records / limit);

        res.status(200).json({
            success: true,
            data: logs,
            pagination: {
                current_page: parseInt(page),
                total_pages,
                total_records
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, data: err.message });
    }
};

module.exports = { getLogs };