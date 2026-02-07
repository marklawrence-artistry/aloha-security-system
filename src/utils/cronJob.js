// ================================================
// FILE: src/utils/cronJob.js
// ================================================
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { db } = require('../database');

// Use the same logic again to know where the files are stored
const UPLOAD_PATH = process.env.VOLUME_PATH || path.join(__dirname, '../../public/uploads');

const startCronJob = () => {
    // This cron job runs every 3 hours as you configured it.
    cron.schedule('0 0 */3 * *', () => { 
        console.log('Running cron job: Deleting old rejected applications...');
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
        
        db.all("SELECT id, resume_path, id_image_path FROM applicants WHERE status = 'Rejected' AND created_at < ?", [threeDaysAgo], (err, rows) => {
            if (err) {
                console.error("Cron job error fetching applicants:", err);
                return;
            }

            if (rows.length > 0) {
                 console.log(`Found ${rows.length} rejected applications to delete.`);
            }

            rows.forEach(applicant => {
                const deleteFile = (urlPath) => {
                    if (!urlPath) return;
                    const filename = urlPath.split('/').pop();
                    // Construct the full path to the file inside the volume
                    const filePath = path.join(UPLOAD_PATH, filename);
                    
                    fs.unlink(filePath, (err) => {
                        // It's okay if the file doesn't exist (ENOENT), but log other errors.
                        if (err && err.code !== 'ENOENT') {
                            console.error(`Cron job error deleting file ${filePath}:`, err);
                        }
                    });
                };

                deleteFile(applicant.resume_path);
                deleteFile(applicant.id_image_path);

                db.run("DELETE FROM applicants WHERE id = ?", [applicant.id]);
            });
        });
    });
};

module.exports = startCronJob;