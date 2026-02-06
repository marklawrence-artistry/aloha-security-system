// ================================================
// FILE: src/server.js
// ================================================
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./database.js');
const startCronJob = require('./utils/cronJob.js');

const app = express();
const PORT = process.env.PORT || 3000;

const UPLOAD_PATH = process.env.VOLUME_PATH || path.join(__dirname, '../public/uploads');

const applicantRoutes = require('./routes/applicants.js');
const branchRoutes = require('./routes/branches.js');
const deploymentRoutes = require('./routes/deployments.js');
const auditRoutes = require('./routes/audit.js');

app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(UPLOAD_PATH)); 

app.use(cors());

app.use('/api', applicantRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/deployments', deploymentRoutes);
app.use('/api/audit', auditRoutes);

initDB();
startCronJob();

app.listen(PORT, () => {
    console.log(`Aloha Security System listening at http://localhost:${PORT}`);
    console.log(`Uploads will be served from: ${UPLOAD_PATH}`); // Helpful log
});