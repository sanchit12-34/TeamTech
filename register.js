

// Get the registration form
const registerForm = document.getElementById("registerForm");

// Run this code only if the form exists
if (registerForm) {

    registerForm.addEventListener("submit", function (event) {

        // Prevent page refresh
        event.preventDefault();

        // Get form values
        const name = document.getElementById("name").value.trim();

        const email = document.getElementById("email").value.trim();

        const password = document.getElementById("password").value;

        const confirmPassword = document.getElementById("confirmPassword").value;

        // Check if passwords match
        if (password !== confirmPassword) {

            alert("Passwords do not match!");

            return;

        }

        // Get existing users from localStorage
        let users = JSON.parse(localStorage.getItem("users")) || [];

        // Check if email already exists
        const existingUser = users.find(function (user) {

            return user.email === email;

        });

        if (existingUser) {

            alert("Email already registered!");

            return;

        }

        // Create a new user object
        const user = {

            id: Date.now(),

            name: name,

            email: email,

            password: password

        };

        // Add new user to the array
        users.push(user);

        // Save updated array to localStorage
        localStorage.setItem("users", JSON.stringify(users));

        // Success message
        alert("Registration Successful!");

        // Clear the form
        registerForm.reset();

        // Redirect to login page
        window.location.href = "login.html";

    });

}