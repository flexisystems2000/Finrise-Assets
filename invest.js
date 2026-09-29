const slides2 = document.querySelectorAll(".slide2");
const dots2 = document.querySelectorAll(".dot2");

const next2 = document.querySelector(".next2");
const prev2 = document.querySelector(".prev2");

let current = 0;
let timer;

function showSlide(index) {

    slides2.forEach(slide => slide.classList.remove("active"));
    dots2.forEach(dot => dot.classList.remove("active"));
    slides2[index].classList.add("active");
    dots2[index].classList.add("active");
    current = index;

}

function nextSlide() {

    current++;

    if (current >= slides2.length) {
        current = 0;
    }

    showSlide(current);

}

function prevSlide() {

    current--;

    if (current < 0) {
        current = slides2.length - 1;
    }

    showSlide(current);

}

next2.onclick = () => {

    nextSlide();
    resetTimer();

}

prev2.onclick = () => {

    prevSlide();
    resetTimer();

}

dots2.forEach((dot, index) => {

    dot.onclick = () => {

        showSlide(index);
        resetTimer();

    }

});

function startTimer() {

    timer = setInterval(nextSlide, 5000);

}

function resetTimer() {

    clearInterval(timer);
    startTimer();

}

startTimer();




const slides = document.querySelector(".slides");
const cards = document.querySelectorAll(".testimonial-card");
const dots = document.querySelectorAll(".dot");

let index = 0;

function updateSlider() {

    slides.style.transform =
        `translateX(-${index * 100}%)`;

    dots.forEach(dot =>
        dot.classList.remove("active")
    );

    dots[index].classList.add("active");
}

document.querySelector(".next")
    .addEventListener("click", () => {

        index++;

        if (index >= cards.length) {
            index = 0;
        }

        updateSlider();
    });

document.querySelector(".prev")
    .addEventListener("click", () => {

        index--;

        if (index < 0) {
            index = cards.length - 1;
        }

        updateSlider();
    });

dots.forEach((dot, i) => {

    dot.addEventListener("click", () => {

        index = i;
        updateSlider();

    });

});

setInterval(() => {

    index++;

    if (index >= cards.length) {
        index = 0;
    }

    updateSlider();

}, 5000);




const boxes = document.querySelectorAll(".faq-box");

boxes.forEach(box => {
    box.querySelector(".faq-question").addEventListener("click", () => {

        boxes.forEach(b => {
            if (b !== box) b.classList.remove("active");
        });

        box.classList.toggle("active");
    });
});





const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach(item => {
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {

        faqItems.forEach(faq => {
            if (faq !== item) {
                faq.classList.remove("active");
                faq.querySelector(".faq-answer").style.maxHeight = null;
            }
        });

        item.classList.toggle("active");

        const answer = item.querySelector(".faq-answer");

        if (item.classList.contains("active")) {
            answer.style.maxHeight = answer.scrollHeight + "px";
        } else {
            answer.style.maxHeight = null;
        }
    });
});

document.querySelector(".faq-item.active .faq-answer").style.maxHeight =
    document.querySelector(".faq-item.active .faq-answer").scrollHeight + "px";







// /* =========================
//    SCROLL ANIMATION ENGINE
// ========================= */

// const revealElements = document.querySelectorAll(
//     ".plan-card, .service-card, .goal-card, .feature-box, .step-card, .about-content, .about-image, .title, .section-title, .relation_Holder, .feature_Divs"
// );

// const observer = new IntersectionObserver((entries) => {
//     entries.forEach(entry => {
//         if (entry.isIntersecting) {
//             entry.target.classList.add("show");
//         }
//     });
// }, {
//     threshold: 0.15
// });

// revealElements.forEach(el => {
//     el.classList.add("hidden");
//     observer.observe(el);
// });


// /* =========================
//    STRONG DROP EFFECT (optional upgrade)
// ========================= */

// const dropElements = document.querySelectorAll(".plan-card, .service-card, .goal-card");

// const dropObserver = new IntersectionObserver((entries) => {
//     entries.forEach(entry => {
//         if (entry.isIntersecting) {
//             entry.target.classList.add("show");
//         }
//     });
// }, {
//     threshold: 0.2
// });

// dropElements.forEach(el => {
//     el.classList.add("drop");
//     dropObserver.observe(el);
// });


// /* =========================
//    TYPING ON SCROLL HEADINGS
// ========================= */

// const typingObserver = new IntersectionObserver((entries) => {
//     entries.forEach(entry => {
//         if (entry.isIntersecting) {
//             entry.target.classList.add("typing");
//             typingObserver.unobserve(entry.target);
//         }
//     });
// }, {
//     threshold: 0.5
// });

// document.querySelectorAll(".title, .section-title, h1").forEach(el => {
//     typingObserver.observe(el);
// });



















// const sidebar = document.getElementById("sidebar");
// const openBtn = document.getElementById("openBtn");
// const closeBtnn = document.getElementById("closeBtn");

// // Show Sidebar
// openBtn.addEventListener("click", () => {
//     sidebar.classList.add("active");
// });

// // Hide Sidebar
// closeBtnn.addEventListener("click", () => {
//     sidebar.classList.remove("active");
// });

// // Close when clicking outside
// document.addEventListener("click", (e) => {
//     if (
//         !sidebar.contains(e.target) &&
//         !openBtn.contains(e.target)
//     ) {
//         sidebar.classList.remove("active");
//     }
// });










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


