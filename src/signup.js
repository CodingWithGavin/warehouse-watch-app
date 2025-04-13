import { Amplify } from 'aws-amplify';
import { Auth } from 'aws-amplify';
import awsExports from './aws-exports.js';

Amplify.configure(awsExports);

document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const email = document.getElementById('email').value;

  try {
    await Auth.signUp({
      username,
      password,
      attributes: { email }
    });

    alert('Sign up successful! Please check your email for confirmation code.');
    // Redirect to login or confirmation screen
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Signup failed', error);
    alert('Signup failed: ' + error.message);
  }
});
