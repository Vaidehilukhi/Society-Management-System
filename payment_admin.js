document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("http://localhost:3000/payments");
        const payments = await response.json();

        const tableBody = document.getElementById("paymentTableBody");
        tableBody.innerHTML = "";
       
        payments.forEach((payments) => {
            const row = `<tr>
                <td>${payments.id}</td>
                <td>${payments.user_id}</td>
                <td>${payments.amount}</td>
                <td>${payments.payment_method}</td>
                <td>${payments.created_at}</td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Error fetching payments:", error);
    }
});
document.addEventListener("DOMContentLoaded", async function () {
    const tableBody = document.getElementById("visitorTable");

    if (!tableBody) {
        console.error("Error: visitorTable element not found!");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/visitors");
        const visitors = await response.json();

        if (!Array.isArray(visitors)) {
            throw new Error("Invalid data format: Expected an array");
        }

        visitors.forEach(visitor => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${visitor.id}</td>
                <td>${visitor.name}</td>
                <td>${visitor.email}</td>
                <td>${visitor.message}</td>
                <td>${visitor.user_id}</td>
                <td>${new Date(visitor.visit_date).toLocaleString()}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching visitors:", error);
    }
});