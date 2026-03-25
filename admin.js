document.addEventListener("DOMContentLoaded", function () {
    // Handle Admin Registration
    const registerForm = document.getElementById("adminRegisterForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            const response = await fetch("/admin/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            alert(data.message);
            if (data.success) {
                window.location.href = "admin_login.html";
            }
        });
    }

    // Handle Admin Login
    const loginForm = document.getElementById("adminLoginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            const response = await fetch("/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            alert(data.message);
            if (data.success) {
                window.location.href = "admin_dashboard.html";
            }
        });
    }
});
