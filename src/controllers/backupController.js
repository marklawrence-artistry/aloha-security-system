// ================================================
// FILE: src/controllers/backupController.js
// ================================================
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const AdmZip = require('adm-zip');
const { logAction } = require('../utils/auditLogger');

// Config Paths
const DB_PATH = process.env.VOLUME_PATH 
    ? path.join(process.env.VOLUME_PATH, 'aloha_database.db') 
    : path.join(__dirname, '../../aloha_database.db');

const UPLOAD_DIR = process.env.VOLUME_PATH 
    ? process.env.VOLUME_PATH // In production/railway volume root
    : path.join(__dirname, '../../public/uploads');

// 1. CREATE BACKUP (Download ZIP)
const createBackup = async (req, res) => {
    try {
        const date = new Date().toISOString().slice(0,10);
        const filename = `aloha_backup_${date}.zip`;

        res.attachment(filename);

        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.on('error', function(err) {
            res.status(500).send({error: err.message});
        });

        // Pipe zip data to response
        archive.pipe(res);

        // 1. Add Database File
        if (fs.existsSync(DB_PATH)) {
            archive.file(DB_PATH, { name: 'aloha_database.db' });
        }

        // 2. Add Uploads Directory
        if (fs.existsSync(UPLOAD_DIR)) {
            archive.directory(UPLOAD_DIR, 'uploads');
        }

        await archive.finalize();
        
        // We log after sending response headers, usually fine, but strictly logging happens async
        await logAction(req, 'SYSTEM_BACKUP', `Admin downloaded a system backup.`);
        
    } catch (err) {
        console.error(err);
        if (!res.headersSent) res.status(500).json({ success: false, data: "Backup failed." });
    }
};

// 2. RESTORE BACKUP (Upload ZIP)
const restoreBackup = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, data: "No backup file uploaded." });
        }

        const zipPath = req.file.path;
        const zip = new AdmZip(zipPath);

        // Define Root Path (Where package.json is located roughly)
        const projectRoot = path.join(__dirname, '../../');
        const publicRoot = path.join(__dirname, '../../public');

        // Extract Everything
        // This will overwrite 'aloha_database.db' in root and 'uploads' in public
        // Note: In production (Railway), paths might differ.
        // Assuming Standard Structure:
        // /root/aloha_database.db
        // /root/public/uploads/
        
        // We extract to the project root
        zip.extractAllTo(projectRoot, true); 

        // Cleanup the uploaded zip
        fs.unlinkSync(zipPath);

        await logAction(req, 'SYSTEM_RESTORE', `Admin restored system from backup file.`);

        res.status(200).json({ success: true, data: "System restored successfully. Please refresh." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, data: "Restore failed: " + err.message });
    }
};

module.exports = { createBackup, restoreBackup };