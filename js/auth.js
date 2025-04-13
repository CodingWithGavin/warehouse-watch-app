document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    console.log("Login clicked!", username, password);
  
    // TODO: Replace this with Cognito login logic
  });
  