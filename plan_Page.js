
/* =========================================================
   MOBILE NAVIGATION
========================================================= */

const menuBtn = document.getElementById("menuBtn");
const closeBtn = document.getElementById("closeBtn");

const mobileSidebar =
    document.getElementById("mobileSidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");


/* OPEN MENU */

menuBtn.addEventListener("click", () => {

    mobileSidebar.classList.add("active");

    sidebarOverlay.classList.add("active");

    document.body.style.overflow = "hidden";

});


/* CLOSE MENU */

function closeSidebar() {

    mobileSidebar.classList.remove("active");

    sidebarOverlay.classList.remove("active");

    document.body.style.overflow = "";

}


closeBtn.addEventListener(
    "click",
    closeSidebar
);


sidebarOverlay.addEventListener(
    "click",
    closeSidebar
);


/* CLOSE AFTER CLICKING LINK */

document
    .querySelectorAll(".mobile-nav a")
    .forEach(link => {

        link.addEventListener(
            "click",
            closeSidebar
        );

    });


/* CLOSE WITH ESC */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {
            closeSidebar();
        }

    }
);


