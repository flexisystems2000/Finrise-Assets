const sidebar = document.getElementById("sidebar");
const openBtn = document.getElementById("openBtn");
const closeBtn = document.getElementById("closeBtn");

// Show Sidebar
openBtn.addEventListener("click", () => {
    sidebar.classList.add("active");
});

// Hide Sidebar
closeBtn.addEventListener("click", () => {
    sidebar.classList.remove("active");
});

// Close when clicking outside
document.addEventListener("click", (e) => {
    if (
        !sidebar.contains(e.target) &&
        !openBtn.contains(e.target)
    ) {
        sidebar.classList.remove("active");
    }
});



