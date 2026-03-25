document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const name = document.getElementById("registerName").value;
            const email = document.getElementById("registerEmail").value;
            const password = document.getElementById("registerPassword").value;
            const confirmPassword = document.getElementById("registerConfirmPassword").value;
            // Check if passwords match
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

            if (!name || !email || !password) {
                alert("⚠ All fields are required!");
                return;
            }

            const response = await fetch("/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();
            alert(data.message);

            // ✅ Reset form only if registration is successful
            if (data.message.includes("successful")) {
                registerForm.reset();
                window.location.href = "/index.html";
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            if (!email || !password) {
                alert("⚠ All fields are required!");
                return;
            }

            const response = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            alert(data.message);

            // ✅ Redirect to a dashboard if login is successful
            if (data.message.includes("successful")) {
                window.location.href = "/payment"; // Change this to your actual dashboard route
            }
        });
    }
});
