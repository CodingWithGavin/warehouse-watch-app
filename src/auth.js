import awsExports from './aws-exports.js';

Amplify.configure(awsExports);

document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    console.log("Login clicked!", username, password);

    try {
      const user = await Auth.signIn(username, password);
      alert('Login successful!');
      console.log(user);
      window.location.href = 'inventory.html';
    } catch (error) {
      console.error('Login failed', error);
      alert('Login failed: ' + error.message);
    }
  });
  