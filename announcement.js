document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("announcementForm");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const message = document.getElementById("message").value;

        const response = await fetch("/announcement", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        alert(data.message);

        // Clear the form after successful submission
        form.reset();
    });
});
