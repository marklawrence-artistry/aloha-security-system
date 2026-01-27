const API_URL = '/api';

// Helper: Get Token
function getToken() {
    return localStorage.getItem('admin_token');
}

// Helper: Check Auth & Redirect
function checkAuth() {
    if (!getToken()) {
        window.location.href = 'login.html';
    }
}

// 1. LOGIN
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = e.target.querySelector('button');

    btn.innerText = 'Logging in...';
    
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const result = await res.json();

        if (result.success) {
            localStorage.setItem('admin_token', result.data.token);
            localStorage.setItem('admin_user', JSON.stringify(result.data.user));
            window.location.href = 'admin-dashboard.html';
        } else {
            alert(result.data);
            btn.innerText = 'Sign In';
        }
    } catch (err) {
        alert('Login failed');
        btn.innerText = 'Sign In';
    }
}

// 2. LOAD APPLICANTS TABLE
async function loadApplicants() {
    const token = getToken();
    const tbody = document.getElementById('applicants-body');

    try {
        const res = await fetch(`${API_URL}/applicants`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();

        if (result.success) {
            const applicants = result.data;
            // Update Dashboard Counters if elements exist
            if(document.getElementById('total-apps')) document.getElementById('total-apps').innerText = applicants.length;
            if(document.getElementById('pending-apps')) document.getElementById('pending-apps').innerText = applicants.filter(a => a.status === 'Pending').length;

            if (tbody) {
                tbody.innerHTML = applicants.map(app => `
                    <tr>
                        <td>#${String(app.id).padStart(4, '0')}</td>
                        <td>
                            <strong>${app.first_name} ${app.last_name}</strong><br>
                            <span style="font-size:0.8em; color:#888">${app.email}</span>
                        </td>
                        <td>${app.position_applied}</td>
                        <td>${app.contact_num}</td>
                        <td><span class="badge badge-${app.status.toLowerCase().replace(' ', '-')}">${app.status}</span></td>
                        <td>
                            <a href="applicant-details.html?id=${app.id}" class="btn btn-sm btn-outline-custom">View</a>
                        </td>
                    </tr>
                `).join('');
            }
        }
    } catch (err) {
        console.error(err);
    }
}

// 3. LOAD APPLICANT DETAILS
async function loadApplicantDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const token = getToken();

    if (!id) return;

    try {
        const res = await fetch(`${API_URL}/status?id=${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();

        if (result.success) {
            const app = result.data;
            
            // Header Data
            document.getElementById('app-name').innerText = `${app.first_name} ${app.last_name}`;
            document.getElementById('app-position').innerText = app.position_applied || 'No Position';
            document.getElementById('app-status').innerText = app.status;
            document.getElementById('app-status').className = `badge badge-${app.status.toLowerCase().replace(' ', '-')}`;

            // Personal Info (The clean grid layout)
            const infoContainer = document.getElementById('personal-info');
            infoContainer.innerHTML = `
                <div class="info-group">
                    <label class="info-label">Email Address</label>
                    <div class="info-value">${app.email}</div>
                </div>
                <div class="info-group">
                    <label class="info-label">Mobile Number</label>
                    <div class="info-value">${app.contact_num}</div>
                </div>
                <div class="info-group">
                    <label class="info-label">Date of Birth</label>
                    <div class="info-value">${app.birthdate}</div>
                </div>
                <div class="info-group">
                    <label class="info-label">Gender</label>
                    <div class="info-value">${app.gender}</div>
                </div>
                <div class="info-group" style="grid-column: span 2;">
                    <label class="info-label">Home Address</label>
                    <div class="info-value">${app.address}</div>
                </div>
            `;
            
            // Experience Info
             const jobContainer = document.getElementById('job-info');
             jobContainer.innerHTML = `
                <div class="info-group">
                    <label class="info-label">Applied Position</label>
                    <div class="info-value">${app.position_applied}</div>
                </div>
                <div class="info-group">
                    <label class="info-label">Years of Experience</label>
                    <div class="info-value">${app.years_experience} Years</div>
                </div>
                <div class="info-group" style="grid-column: span 2;">
                    <label class="info-label">Previous Employer</label>
                    <div class="info-value">${app.previous_employer || 'N/A'}</div>
                </div>
            `;

            // Images
            document.getElementById('resume-link').href = app.resume_path;
            document.getElementById('id-img').src = app.id_image_path;
            
            setupActionButtons(app.id);
        }
    } catch (err) {
        console.error(err);
    }
}

function setupActionButtons(id) {
    const token = getToken();
    const update = async (status) => {
        if(!confirm(`Are you sure you want to mark this applicant as ${status}?`)) return;
        
        const res = await fetch(`${API_URL}/applicants/${id}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status })
        });
        
        if(res.ok) {
            alert('Status Updated');
            location.reload();
        }
    };

    document.getElementById('btn-hire').onclick = () => update('Hired');
    document.getElementById('btn-interview').onclick = () => update('For Interview');
    document.getElementById('btn-reject').onclick = () => update('Rejected');
}

// LOGOUT
function logout() {
    localStorage.removeItem('admin_token');
    window.location.href = 'login.html';
}

// INITIALIZER
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('login-form')) {
        document.getElementById('login-form').addEventListener('submit', handleLogin);
    } else {
        checkAuth(); // Protect pages
        if (document.getElementById('logout-btn')) document.getElementById('logout-btn').addEventListener('click', logout);
        
        if (document.getElementById('applicants-body')) loadApplicants();
        if (document.getElementById('app-name')) loadApplicantDetails();
    }
});