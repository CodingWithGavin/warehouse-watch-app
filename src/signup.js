// signup.js

// Configure Amplify (only once per page)
Amplify.configure(window.awsconfig);

document.getElementById('signupForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const { user } = await Auth.signUp({
            username,
            password,
            attributes: {
                email,
            }
        });
        alert('Sign-up successful! Please check your email to confirm.');
        console.log(user);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Sign-up error', error);
        alert('Sign-up failed: ' + error.message);
    }
});
