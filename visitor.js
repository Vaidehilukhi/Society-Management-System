document.addEventListener("DOMContentLoaded", function () {
    const visitorForm = document.getElementById("visitorForm");
    const userSelect = document.getElementById("user_select");

    // ✅ Fetch users and populate dropdown
    async function fetchUsers() {
        const response = await fetch("/get-users");
        const users = await response.json();
        
        userSelect.innerHTML = '<option value="">Select a user</option>'; // Reset dropdown
        users.forEach(user => {
            const option = document.createElement("option");
            option.value = user.id;
            option.textContent = `${user.name} (ID: ${user.id})`;
            userSelect.appendChild(option);
        });
    }

    fetchUsers(); // Load users on page load

    // ✅ Handle visitor form submission
    visitorForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const userId = userSelect.value;
        const name = document.getElementById("visitor_name").value;
        const email = document.getElementById("visitor_email").value;
        const message = document.getElementById("visitor_message").value;

        console.log("Submitting Data:", { userId, name, email, message });

        const response = await fetch("/submit-visitor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, name, email, message }),
        });

        const data = await response.json();
        console.log("Server Response:", data);
        
        // ✅ Display success message
        document.getElementById("visitor_message_display").innerText = data.message;

        // ✅ Reset the form fields after successful submission
        visitorForm.reset();
    });
});


