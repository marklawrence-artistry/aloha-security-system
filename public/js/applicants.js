const API_URL = '/api/applicants';
let currentPage = 1;
const limit = 10;

function getToken() { return localStorage.getItem('admin_token'); }

async function fetchApplicants() {
    const search = document.getElementById('search-input').value;
    const sort = document.getElementById('sort-select').value;

    try {
        const res = await fetch(`${API_URL}?page=${currentPage}&limit=${limit}&search=${search}&sort=${sort}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const result = await res.json();

        if (result.success) {
            renderTable(result.data.applicants);
            updateKPIs(result.data.stats);
            updatePagination(result.data.pagination);
        }
    } catch (err) {
        console.error(err);
    }
}

function renderTable(data) {
    const tbody = document.getElementById('applicants-body');
    tbody.innerHTML = data.map(app => {
        const date = new Date(app.created_at).toLocaleDateString();
        const badgeClass = `badge-${app.status.toLowerCase().replace(' ', '-')}`;
        return `
            <tr>
                <td>#${String(app.id).padStart(4, '0')}</td>
                <td><strong>${app.first_name} ${app.last_name}</strong></td>
                <td>${app.email}</td>
                <td>${app.gender || '-'}</td>
                <td>${app.position_applied}</td>
                <td><span class="badge ${badgeClass}">${app.status}</span></td>
                <td>${date}</td>
                <td>
                    <a href="applicant-details.html?id=${app.id}" class="btn-action" style="color:#333;"><i class="bi bi-three-dots-vertical"></i></a>
                </td>
            </tr>
        `;
    }).join('');
}

function updateKPIs(stats) {
    document.getElementById('kpi-total').innerText = stats.total;
    document.getElementById('kpi-male').innerText = stats.male;
    document.getElementById('kpi-female').innerText = stats.female;
    document.getElementById('kpi-month').innerText = stats.this_month;
}

function updatePagination(pagination) {
    document.getElementById('page-info').innerText = `Page ${pagination.current_page} of ${pagination.total_pages} (${pagination.total_records} records)`;
    document.getElementById('prev-btn').disabled = pagination.current_page === 1;
    document.getElementById('next-btn').disabled = pagination.current_page >= pagination.total_pages;
}

document.addEventListener('DOMContentLoaded', () => {
    fetchApplicants();
    
    document.getElementById('search-input').addEventListener('input', () => { currentPage = 1; fetchApplicants(); });
    document.getElementById('sort-select').addEventListener('change', fetchApplicants);
    document.getElementById('prev-btn').addEventListener('click', () => { if(currentPage > 1) { currentPage--; fetchApplicants(); } });
    document.getElementById('next-btn').addEventListener('click', () => { currentPage++; fetchApplicants(); });
});