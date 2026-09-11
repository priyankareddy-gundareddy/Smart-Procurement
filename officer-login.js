document
    .querySelector('#officer-login-form')
    .addEventListener('submit', async (event) => {

        event.preventDefault();

        const email =
            document.querySelector('#officer-email').value.trim();

        const password =
            document.querySelector('#officer-password').value;

        const message =
            document.querySelector('#officer-login-message');

        try {

            const response = await fetch(
                'http://localhost:8080/api/officers/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Invalid officer credentials');
            }

            const officer = await response.json();

            // Store logged-in officer
            sessionStorage.setItem(
                'smartProcureOfficer',
                JSON.stringify(officer)
            );

            // Go to Officer Dashboard
            window.location.href = 'officer-dashboard.html';

        } catch (error) {

            console.error('Officer login error:', error);

            message.textContent =
                'Invalid email or password.';
        }
    });