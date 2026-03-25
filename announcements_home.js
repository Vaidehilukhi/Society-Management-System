document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch("/announcements");
    const announcements = await response.json();

    const list = document.getElementById("announcement-list");
    list.innerHTML = ""; // Clear old data

    announcements.forEach(announcement => {
        const li = document.createElement("li");
        li.textContent = announcement.message;
        list.appendChild(li);
    });
});
