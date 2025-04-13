// No import statements
Amplify.configure(window.awsconfig);

document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const user = await Auth.signIn(username, password);
        alert('Login successful!');
        window.location.href = 'inventory.html';
    } catch (error) {
        alert('Login failed: ' + error.message);
        console.error('Login error:', error);
    }
});
