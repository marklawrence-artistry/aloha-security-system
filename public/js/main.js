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
        const nextBtns = document.querySelectorAll('.btn-next');
        const prevBtns = document.querySelectorAll('.btn-prev');
        const stepLabel = document.querySelector('#current-step-label');

        // Next Step Logic
        nextBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const currentStepNum = parseInt(e.target.dataset.step);
                const nextStepNum = currentStepNum + 1;

                // Validation
                const currentDiv = document.querySelector(`#step-${currentStepNum}`);
                const inputs = currentDiv.querySelectorAll('input[required], select[required], textarea[required]');
                let valid = true;

                inputs.forEach(input => {
                    if (!input.value) {
                        valid = false;
                        input.style.borderColor = 'red';
                    } else {
                        input.style.borderColor = '#ccc';
                    }
                });

                if (!valid) {
                    alert("Please fill in all required fields.");
                    return;
                }

                // Switch UI
                changeStep(currentStepNum, nextStepNum);

                // This part is now handled by the inline script in application.html
                // The check for `nextStepNum === 4` is no longer needed here.
            });
        });

        // Previous Step Logic
        prevBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const currentStepNum = parseInt(e.target.dataset.step);
                const prevStepNum = currentStepNum - 1;
                changeStep(currentStepNum, prevStepNum);
            });
        });

        // UI Helper
        function changeStep(from, to) {
            document.querySelector(`#step-${from}`).classList.remove('active-step');
            document.querySelector(`#step-ind-${from}`).classList.remove('active');
            
            document.querySelector(`#step-${to}`).classList.add('active-step');
            document.querySelector(`#step-ind-${to}`).classList.add('active');

            if(stepLabel) stepLabel.innerText = to;
        }

        // --- REMOVED FAULTY FUNCTION ---
        // The populateReviewSection function that caused the error has been deleted.
        // The inline script in application.html handles this correctly.
        // --- END OF REMOVAL ---

        // Form Submit
        appForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = appForm.querySelector('button[type="submit"]');
            
            submitBtn.innerText = "Submitting...";
            submitBtn.disabled = true;

            const formData = new FormData(appForm);

            try {
                const result = await api.submitApplication(formData);
                alert(`Application Submitted! Your ID is: ${result.applicant_id}`);
                
                // --- ADD THIS LINE ---
                localStorage.removeItem('aloha_application_draft'); // Clear saved data on success
                // --- END OF ADDITION ---

                window.location.href = `status-result.html?email=${encodeURIComponent(formData.get('email'))}`;
            } catch (err) {
                console.error(err);
                alert(`Error: ${err.message}`);
                submitBtn.innerText = "Submit Application";
                submitBtn.disabled = false;
            }
        });
    }
});