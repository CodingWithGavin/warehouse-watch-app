
Amplify.configure(window.awsconfig);
const forgotForm = document.getElementById('forgotPasswordForm');
const confirmForm = document.getElementById('confirmResetForm');

forgotForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;

  try {
    await Auth.forgotPassword(username);
    alert('Verification code sent to your email.');
    forgotForm.classList.add('d-none');
    confirmForm.classList.remove('d-none');
  } catch (error) {
    alert('Error sending code: ' + error.message);
  }
});

confirmForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const code = document.getElementById('code').value;
  const newPassword = document.getElementById('newPassword').value;

  try {
    await Auth.forgotPasswordSubmit(username, code, newPassword);
    alert('Password has been reset. You can now log in.');
    window.location.href = 'index.html';
  } catch (error) {
    alert('Error resetting password: ' + error.message);
  }
});
