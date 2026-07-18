// Get login form
const loginForm = document.getElementById("loginForm");

// Listen for form submission
loginForm.addEventListener("submit", function(event){

    // Prevent page refresh
    event.preventDefault();

    // Get input values
    const email = document.getElementById("loginEmail").value.trim();

    const password = document.getElementById("loginPassword").value;

    // Load users
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Find matching user
    const loggedInUser = users.find(function(user){

        return user.email === email && user.password === password;

    });

    // Check login
    if (!loggedInUser){

        alert("Invalid Email or Password!");

        return;

    }

    // Save current user
    localStorage.setItem("currentUser", JSON.stringify(loggedInUser));

    // Success
    alert("Login Successful!");

    // Go to dashboard
    window.location.href = "dashboard.html";

});