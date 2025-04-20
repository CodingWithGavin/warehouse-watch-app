// Our authentication files from cognito userpool using the information from our config file 
const userPool = new AmazonCognitoIdentity.CognitoUserPool(cognitoConfig);

// This function is used by our login page to login users to their accounts
function login(event) {
  //This helps stop the page from automatically reloading itself
  event.preventDefault();

  //gets our users input
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  //creates a cognito identity for authentication with the information passed in 
  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username: username,
    Password: password,
  });

  const userData = {
    Username: username,
    Pool: userPool,
  };
  
  //creates a cognito user element from the userdata passed in
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function(result) {
      // Using this to get our tokens after login
      const accessToken = result.getAccessToken().getJwtToken();
      const idToken = result.getIdToken().getJwtToken();
      const refreshToken = result.getRefreshToken().getToken();

      // Store things in the session
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("idToken", idToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("username", username); 

      //used for troubleshooting to ensure we have our accesstokens and user info
      console.log("Access Token:", localStorage.getItem("accessToken"));
      console.log("Username: ", localStorage.getItem("username")); 
      alert('Login Successful');
      window.location.href = "inventory.html";
    },
    //sends out our error messages 
    onFailure: function(err) {
      alert(err.message || JSON.stringify(err));
    }
  });
}

//Logout
function logout() {
  // Clear all auth data
  localStorage.removeItem("accessToken");
  localStorage.removeItem("idToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("username");

  // Redirect to login page
  window.location.href = "index.html";
}

//Check if logged in#
function isLoggedIn() {
  const token = localStorage.getItem("accessToken");
  return token !== null;
}

// SIGN UP
function signUp(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const attributeList = [
    new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: 'email',
      Value: email,
    })
  ];

  userPool.signUp(username, password, attributeList, null, function(err, result) {
    if (err) {
      alert(err.message || JSON.stringify(err));
      return;
    }
    alert('Sign-up successful. Please verify your email.');
    // ✅ Save email (username) to localStorage
    localStorage.setItem("username", username);

    // ✅ Redirect to verify email page
    window.location.href = "verify-email.html";
  });
}

// FORGOT PASSWORD
function forgotPassword(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;

  const userData = {
    Username: username,
    Pool: userPool,
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.forgotPassword({
    onSuccess: function(data) {
      alert('Password reset request successful. Check your email.');
      localStorage.setItem("resetUser", username);
      window.location.href = 'reset-password.html';
    },
    onFailure: function(err) {
      alert(err.message || JSON.stringify(err));
    }
  });
}

// Verify Page
function verifyEmail(event) {
  event.preventDefault();

  const verificationCode = document.getElementById('verificationCode').value;
  const username = localStorage.getItem("username"); // Get saved email

  if (!username) {
    alert("No email found. Please sign up again.");
    return;
  }

  const userData = {
    Username: username,
    Pool: userPool,
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.confirmRegistration(verificationCode, true, function(err, result) {
    if (err) {
      alert(err.message || JSON.stringify(err));
      return;
    }
    alert('Email verification successful!');
    localStorage.removeItem("username"); 
    window.location.href = 'index.html'; 
  });
}

//Reset Page
function resetPassword(event) {
  event.preventDefault();

  const verificationCode = document.getElementById('verificationCode').value;
  const newPassword = document.getElementById('newPassword').value;
  const username = localStorage.getItem("resetUser");

  if (!username) {
    alert("No user found for reset. Please start over.");
    return;
  }

  const userData = {
    Username: username,
    Pool: userPool,
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.confirmPassword(verificationCode, newPassword, {
    onSuccess: function () {
      alert('Password reset successful! You can now log in.');
      window.location.href = 'index.html'; // Back to login
    },
    onFailure: function (err) {
      alert(err.message || JSON.stringify(err));
    }
  });
}

//Personlise The Title 
 
document.addEventListener("DOMContentLoaded", function () {
  const username = localStorage.getItem("username");
  document.getElementById('navbarTitle').innerText = `Warehouse App - Welcome ${username}`;
});