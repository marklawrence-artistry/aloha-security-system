// ================================================
// FILE: public/js/main.js
// ================================================
import * as api from './api.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM ELEMENTS ---
    const checkStatusBtns = document.querySelectorAll('.check-status-action');
    const appForm = document.querySelector('#multi-step-form');
    
    // --- LANDING PAGE LOGIC ---
    if(checkStatusBtns.length > 0) {
        checkStatusBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const email = prompt("Enter your email address to check status:");
                if (email) {
                    try {
                        const data = await api.checkApplicationStatus(email);
                        alert(`Hi ${data.first_name}, your application status is: ${data.status}`);
                    } catch (err) {
                        alert(`Error: ${err.message}`);
                    }
                }
            });
        });
    }

    // --- APPLICATION FORM LOGIC ---
    if(appForm) {
        const preSubmitBtn = document.getElementById('btn-pre-submit');
        const modal = document.getElementById('privacy-modal');
        const finalSubmitBtn = document.getElementById('btn-final-submit');
        const closeModalBtn = document.getElementById('btn-modal-close');

        // 1. Initial "Proceed" Click
        preSubmitBtn.addEventListener('click', () => {
            // Check Consent Checkboxes
            const consentTruth = document.getElementById('consent_truth').checked;
            const consentBg = document.getElementById('consent_bg_check').checked;
            const consentDrug = document.getElementById('consent_drug_test').checked;

            if(!consentTruth || !consentBg || !consentDrug) {
                alert("Please acknowledge all consent declarations (checkboxes) to proceed.");
                // Highlight the missing ones visually
                document.querySelectorAll('.consent-section input[type="checkbox"]:not(:checked)').forEach(el => {
                    el.style.outline = "2px solid red";
                    setTimeout(() => el.style.outline = "none", 2000);
                });
                return;
            }

            // Show Modal
            modal.classList.add('active');
        });

        // 2. "Review Again" Click (Close Modal)
        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // 3. Close on background click
        modal.addEventListener('click', (e) => {
            if(e.target === modal) modal.classList.remove('active');
        });

        // 4. FINAL "Accept & Submit" Click
        finalSubmitBtn.addEventListener('click', async () => {
            // UI State: Loading
            finalSubmitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
            finalSubmitBtn.disabled = true;
            closeModalBtn.disabled = true;

            const formData = new FormData(appForm);

            try {
                // Submit to API
                const result = await api.submitApplication(formData);
                
                // Success State
                modal.classList.remove('active'); // Hide modal
                localStorage.removeItem('aloha_application_draft'); // Clear draft
                alert(`Application Submitted! Your ID is: ${result.applicant_id}`);
                window.location.href = `status-result.html?email=${encodeURIComponent(formData.get('email'))}`;

            } catch (err) {
                console.error(err);
                alert(`Error: ${err.message}`);
                
                // Reset Button State on Error
                finalSubmitBtn.innerHTML = 'Accept & Submit Application';
                finalSubmitBtn.disabled = false;
                closeModalBtn.disabled = false;
                modal.classList.remove('active'); // Optional: hide modal on error to let them fix stuff
            }
        });
    }

    // 1. Create the banner element
    const offlineBanner = document.createElement('div');
    offlineBanner.id = 'offline-alert';
    offlineBanner.style.cssText = `
        position: fixed; bottom: 0; left: 0; width: 100%;
        background-color: #dc2626; color: white; text-align: center;
        padding: 12px; font-weight: 700; z-index: 9999;
        transform: translateY(100%); transition: transform 0.3s ease;
        box-shadow: 0 -4px 10px rgba(0,0,0,0.2);
    `;
    offlineBanner.innerHTML = '<i class="bi bi-wifi-off"></i> No Internet Connection. Check your network.';
    document.body.appendChild(offlineBanner);

    // 2. Define toggle function
    const updateOnlineStatus = () => {
        if (!navigator.onLine) {
            offlineBanner.style.transform = 'translateY(0)'; // Show
        } else {
            offlineBanner.style.transform = 'translateY(100%)'; // Hide
            // Optional: Show brief "Back Online" green message then hide
        }
    };

    // 3. Listen for events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // 4. Initial check
    updateOnlineStatus();
});