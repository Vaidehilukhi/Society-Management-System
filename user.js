async function fetchUsers() {
    try {
        const response = await fetch("http://localhost:3000/users");
        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error("Error: Data is not an array", data);
            return;
        }

        const tableBody = document.getElementById("usersList");
        if (!tableBody) {
            console.error("Element with ID 'usersList' not found!");
            return;
        }

        tableBody.innerHTML = ""; // Clear previous data

        data.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td id="status-${user.id}">${user.status}</td>
                <td>
                    <button onclick="updateStatus(${user.id}, 'active')">Active</button>
                    <button onclick="updateStatus(${user.id}, 'inactive')">Inactive</button>
                    <button onclick="deleteUser(${user.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

// Function to update user status (Active/Inactive)
async function updateStatus(userId, status) {
    try {
        const response = await fetch(`http://localhost:3000/users/${userId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });

        const result = await response.json();
        alert(result.message);
        document.getElementById(`status-${userId}`).innerText = status; // Update UI
    } catch (error) {
        console.error("Error updating status:", error);
    }
}

// Function to delete user
async function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
        const response = await fetch(`http://localhost:3000/users/${userId}`, {
            method: "DELETE"
        });

        const result = await response.json();
        alert(result.message);
        fetchUsers(); // Refresh the list
    } catch (error) {
        console.error("Error deleting user:", error);
    }
}

// Fetch users on page load
document.addEventListener("DOMContentLoaded", fetchUsers);
