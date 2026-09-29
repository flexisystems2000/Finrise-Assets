
/* =========================================================
   FINRISE ASSET
   LOGIN & REGISTER JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       BUTTONS & FORMS
    ===================================================== */

    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    const goRegister = document.getElementById("goRegister");
    const goLogin = document.getElementById("goLogin");


    /* =====================================================
       REGISTER INPUTS
    ===================================================== */

    const fullname = document.getElementById("fullname");
    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const country = document.getElementById("country");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const terms = document.getElementById("terms");


    /* =====================================================
       LOGIN INPUTS
    ===================================================== */

    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");


    /* =====================================================
       SHOW LOGIN FORM
    ===================================================== */

    function showLogin() {

        loginForm.style.display = "block";
        registerForm.style.display = "none";

        loginBtn.classList.add("active");
        registerBtn.classList.remove("active");
    }


    /* =====================================================
       SHOW REGISTER FORM
    ===================================================== */

    function showRegister() {

        loginForm.style.display = "none";
        registerForm.style.display = "block";

        registerBtn.classList.add("active");
        loginBtn.classList.remove("active");
    }


    /* =====================================================
       BUTTON EVENTS
    ===================================================== */

    loginBtn.addEventListener("click", showLogin);

    registerBtn.addEventListener("click", showRegister);

    goRegister.addEventListener("click", showRegister);

    goLogin.addEventListener("click", showLogin);


    /* =====================================================
       PASSWORD TOGGLE FUNCTION
    ===================================================== */

    function passwordToggle(toggleId, inputId) {

        const toggle = document.getElementById(toggleId);
        const input = document.getElementById(inputId);

        if (!toggle || !input) return;

        toggle.addEventListener("click", () => {

            if (input.type === "password") {

                input.type = "text";

                toggle.innerHTML =
                    '<i class="fa fa-eye-slash"></i>';

            } else {

                input.type = "password";

                toggle.innerHTML =
                    '<i class="fa fa-eye"></i>';
            }

        });
    }


    passwordToggle("toggle1", "password");
    passwordToggle("toggle2", "confirmPassword");
    passwordToggle("toggle3", "loginPassword");


    /* =====================================================
       ERROR MESSAGE
    ===================================================== */

    function showError(input, message) {

        const inputBox = input.closest(".inputBox");

        if (!inputBox) return;

        const small = inputBox.querySelector("small");

        if (small) {
            small.textContent = message;
            small.style.color = "red";
        }

        input.style.borderColor = "red";
    }


    /* =====================================================
       CLEAR ERROR
    ===================================================== */

    function clearError(input) {

        const inputBox = input.closest(".inputBox");

        if (!inputBox) return;

        const small = inputBox.querySelector("small");

        if (small) {
            small.textContent = "";
        }

        input.style.borderColor = "";
    }


    /* =====================================================
       REGISTER
    ===================================================== */

    registerForm.addEventListener("submit", (event) => {

        event.preventDefault();


        /* ---------------------------------------------
           CLEAR PREVIOUS ERRORS
        --------------------------------------------- */

        clearError(fullname);
        clearError(username);
        clearError(email);
        clearError(phone);
        clearError(country);
        clearError(password);
        clearError(confirmPassword);


        const fullNameValue = fullname.value.trim();
        const usernameValue = username.value.trim();
        const emailValue = email.value.trim().toLowerCase();
        const phoneValue = phone.value.trim();
        const countryValue = country.value;
        const passwordValue = password.value;
        const confirmPasswordValue = confirmPassword.value;


        /* ---------------------------------------------
           VALIDATION
        --------------------------------------------- */

        if (fullNameValue.length < 2) {

            showError(
                fullname,
                "Please enter your full name."
            );

            return;
        }


        if (usernameValue.length < 3) {

            showError(
                username,
                "Username must be at least 3 characters."
            );

            return;
        }


        if (phoneValue.length < 7) {

            showError(
                phone,
                "Please enter a valid phone number."
            );

            return;
        }


        if (!countryValue) {

            showError(
                country,
                "Please select your country."
            );

            return;
        }


        if (passwordValue.length < 6) {

            showError(
                password,
                "Password must be at least 6 characters."
            );

            return;
        }


        if (passwordValue !== confirmPasswordValue) {

            showError(
                confirmPassword,
                "Passwords do not match."
            );

            return;
        }


        if (!terms.checked) {

            alert(
                "Please agree to the Terms & Conditions."
            );

            return;
        }


        /* ---------------------------------------------
           CHECK EXISTING USER
        --------------------------------------------- */

        const existingUser =
            localStorage.getItem("user");

        if (existingUser) {

            try {

                const user = JSON.parse(existingUser);

                if (
                    user.email &&
                    user.email.toLowerCase() === emailValue
                ) {

                    showError(
                        email,
                        "This email is already registered."
                    );

                    return;
                }

                if (
                    user.username &&
                    user.username.toLowerCase() ===
                    usernameValue.toLowerCase()
                ) {

                    showError(
                        username,
                        "This username is already taken."
                    );

                    return;
                }

            } catch (error) {

                console.error(
                    "Error reading existing user:",
                    error
                );
            }
        }


        /* ---------------------------------------------
           CREATE USER
        --------------------------------------------- */

        const user = {

            fullname: fullNameValue,

            username: usernameValue,

            email: emailValue,

            phone: phoneValue,

            country: countryValue,

            password: passwordValue
        };


        /* ---------------------------------------------
           SAVE USER
        --------------------------------------------- */

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );


        /* ---------------------------------------------
           CREATE DEFAULT ACCOUNT VALUES
        --------------------------------------------- */

        if (
            localStorage.getItem("finriseBalance") === null
        ) {

            localStorage.setItem(
                "finriseBalance",
                "0"
            );
        }


        if (
            localStorage.getItem("finriseTotalDeposit") === null
        ) {

            localStorage.setItem(
                "finriseTotalDeposit",
                "0"
            );
        }


        if (
            localStorage.getItem("finriseTotalEarning") === null
        ) {

            localStorage.setItem(
                "finriseTotalEarning",
                "0"
            );
        }


        if (
            localStorage.getItem("finriseReferralBonus") === null
        ) {

            localStorage.setItem(
                "finriseReferralBonus",
                "0"
            );
        }


        /* ---------------------------------------------
           REGISTERED BUT NOT LOGGED IN YET
        --------------------------------------------- */

        localStorage.removeItem("loggedIn");


        alert(
            "Account created successfully. Please login."
        );


        /* ---------------------------------------------
           GO TO LOGIN
        --------------------------------------------- */

        showLogin();

        loginEmail.value = emailValue;

        loginPassword.value = "";

    });


    /* =====================================================
       LOGIN
    ===================================================== */

    loginForm.addEventListener("submit", (event) => {

        event.preventDefault();


        const enteredEmail =
            loginEmail.value.trim().toLowerCase();

        const enteredPassword =
            loginPassword.value;


        /* ---------------------------------------------
           GET REGISTERED USER
        --------------------------------------------- */

        const savedUser =
            localStorage.getItem("user");


        if (!savedUser) {

            alert(
                "No account found. Please register first."
            );

            showRegister();

            return;
        }


        let user;


        try {

            user = JSON.parse(savedUser);

        } catch (error) {

            console.error(
                "Unable to read saved user:",
                error
            );

            alert(
                "There was a problem with your account. Please register again."
            );

            return;
        }


        /* ---------------------------------------------
           CHECK EMAIL
        --------------------------------------------- */

        if (
            !user.email ||
            user.email.toLowerCase() !== enteredEmail
        ) {

            alert(
                "Incorrect email address."
            );

            return;
        }


        /* ---------------------------------------------
           CHECK PASSWORD
        --------------------------------------------- */

        if (
            !user.password ||
            user.password !== enteredPassword
        ) {

            alert(
                "Incorrect password."
            );

            return;
        }


        /* =================================================
           IMPORTANT LOGIN SESSION
           
           YOUR DASHBOARD CHECKS:
           
           localStorage.getItem("loggedIn") !== "true"
           
           Therefore we MUST save:
           
           "loggedIn" = "true"
        ================================================= */

        localStorage.setItem(
            "loggedIn",
            "true"
        );


        /* ---------------------------------------------
           SAVE CURRENT USER
        --------------------------------------------- */

        localStorage.setItem(
            "currentUser",
            JSON.stringify(user)
        );


        /* ---------------------------------------------
           MAKE SURE ACCOUNT VALUES EXIST
        --------------------------------------------- */

        if (
            localStorage.getItem("finriseBalance") === null
        ) {

            localStorage.setItem(
                "finriseBalance",
                "0"
            );
        }


        if (
            localStorage.getItem("finriseTotalDeposit") === null
        ) {

            localStorage.setItem(
                "finriseTotalDeposit",
                "0"
            );
        }


        if (
            localStorage.getItem("finriseTotalEarning") === null
        ) {

            localStorage.setItem(
                "finriseTotalEarning",
                "0"
            );
        }


        if (
            localStorage.getItem("finriseReferralBonus") === null
        ) {

            localStorage.setItem(
                "finriseReferralBonus",
                "0"
            );
        }


        /* ---------------------------------------------
           REDIRECT TO DASHBOARD
        --------------------------------------------- */

        window.location.href = "dashboard.html";

    });


    /* =====================================================
       INITIAL FORM
    ===================================================== */

    showLogin();

});



/* =====================================================
   PAGE NAVIGATION
===================================================== */

const navItems = document.querySelectorAll(
    ".sidebar .nav-item[data-page]"
);

const pageSections = document.querySelectorAll(
    ".page-section"
);


/* =====================================================
   SHOW PAGE
===================================================== */

function showPage(pageName) {

    if (!pageName) {
        console.warn("No page name provided.");
        return;
    }

    console.log("Trying to open:", pageName);

    let pageFound = false;


    /* HIDE / SHOW SECTIONS */

    pageSections.forEach(section => {

        if (section.id === pageName) {

            section.classList.add("active");

            pageFound = true;

        } else {

            section.classList.remove("active");

        }

    });


    /* UPDATE SIDEBAR ACTIVE ITEM */

    navItems.forEach(item => {

        if (item.dataset.page === pageName) {

            item.classList.add("active");

        } else {

            item.classList.remove("active");

        }

    });


/* =====================================================
   MOBILE SIDEBAR
===================================================== */

const sidebar = document.querySelector(".sidebar");

if (sidebar && window.innerWidth <= 900) {
    sidebar.classList.remove("show");
}


/* =====================================================
   PAGE FOUND CHECK
===================================================== */

if (!pageFound) {
    console.error(
        `No page section found with id="${pageName}"`
    );
}

return pageFound;
}


/* =====================================================
   NAVIGATION CLICK
===================================================== */

navItems.forEach(item => {

    item.addEventListener("click", function (event) {

        event.preventDefault();

        const pageName = this.dataset.page;

        console.log(
            "Navigation clicked:",
            pageName
        );

        showPage(pageName);

    });

});


/* =====================================================
   INITIAL PAGE
===================================================== */

showPage("dashboard");


document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       SIDEBAR & MENU BUTTON
    ===================================================== */

    const sidebar = document.querySelector(".sidebar");
    const menuBtn = document.querySelector(".menu-btn");

    console.log("Sidebar:", sidebar);
    console.log("Menu button:", menuBtn);


    /* =====================================================
       MOBILE SIDEBAR
    ===================================================== */

    if (menuBtn && sidebar) {

        menuBtn.addEventListener("click", (event) => {

            event.preventDefault();

            sidebar.classList.toggle("show");

            console.log(
                "Sidebar:",
                sidebar.classList.contains("show")
                    ? "OPEN"
                    : "CLOSED"
            );

        });

    } else {

        console.error(
            "Sidebar or menu button was not found."
        );

    }


    /* =====================================================
       NAVIGATION
    ===================================================== */

    const navItems = document.querySelectorAll(
        ".sidebar .nav-item[data-page]"
    );

    const pageSections = document.querySelectorAll(
        ".page-section"
    );


    function showPage(pageName) {

        if (!pageName) return;


        pageSections.forEach(section => {

            section.classList.toggle(
                "active",
                section.id === pageName
            );

        });


        navItems.forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.page === pageName
            );

        });


        /* Close sidebar after selecting a page */

        if (
            sidebar &&
            window.innerWidth <= 900
        ) {

            sidebar.classList.remove("show");

        }

    }


    navItems.forEach(item => {

        item.addEventListener("click", (event) => {

            event.preventDefault();

            showPage(
                item.dataset.page
            );

        });

    });


    showPage("dashboard");

});