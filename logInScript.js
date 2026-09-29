
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
       SAFETY CHECK
    ===================================================== */

    if (
        !loginBtn ||
        !registerBtn ||
        !loginForm ||
        !registerForm
    ) {
        console.error(
            "Login/Register elements were not found."
        );

        return;
    }


    /* =====================================================
       SHOW LOGIN
    ===================================================== */

    function showLogin() {

        loginForm.style.display = "block";
        registerForm.style.display = "none";

        loginBtn.classList.add("active");
        registerBtn.classList.remove("active");

    }


    /* =====================================================
       SHOW REGISTER
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

    loginBtn.addEventListener(
        "click",
        showLogin
    );


    registerBtn.addEventListener(
        "click",
        showRegister
    );


    if (goRegister) {

        goRegister.addEventListener(
            "click",
            showRegister
        );

    }


    if (goLogin) {

        goLogin.addEventListener(
            "click",
            showLogin
        );

    }


    /* =====================================================
       PASSWORD TOGGLE
    ===================================================== */

    function passwordToggle(toggleId, inputId) {

        const toggle =
            document.getElementById(toggleId);

        const input =
            document.getElementById(inputId);


        if (!toggle || !input) {
            return;
        }


        toggle.addEventListener(
            "click",
            () => {

                if (input.type === "password") {

                    input.type = "text";

                    toggle.innerHTML =
                        '<i class="fa fa-eye-slash"></i>';

                } else {

                    input.type = "password";

                    toggle.innerHTML =
                        '<i class="fa fa-eye"></i>';

                }

            }
        );

    }


    passwordToggle(
        "toggle1",
        "password"
    );


    passwordToggle(
        "toggle2",
        "confirmPassword"
    );


    passwordToggle(
        "toggle3",
        "loginPassword"
    );


    /* =====================================================
       ERROR MESSAGE
    ===================================================== */

    function showError(input, message) {

        if (!input) {
            return;
        }


        const inputBox =
            input.closest(".inputBox");


        if (!inputBox) {
            return;
        }


        const small =
            inputBox.querySelector("small");


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

        if (!input) {
            return;
        }


        const inputBox =
            input.closest(".inputBox");


        if (!inputBox) {
            return;
        }


        const small =
            inputBox.querySelector("small");


        if (small) {

            small.textContent = "";

        }


        input.style.borderColor = "";

    }


    /* =====================================================
       REGISTER
    ===================================================== */

    registerForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            /* ---------------------------------------------
               CLEAR ERRORS
            --------------------------------------------- */

            clearError(fullname);
            clearError(username);
            clearError(email);
            clearError(phone);
            clearError(country);
            clearError(password);
            clearError(confirmPassword);


            /* ---------------------------------------------
               GET VALUES
            --------------------------------------------- */

            const fullNameValue =
                fullname.value.trim();

            const usernameValue =
                username.value.trim();

            const emailValue =
                email.value.trim().toLowerCase();

            const phoneValue =
                phone.value.trim();

            const countryValue =
                country.value;

            const passwordValue =
                password.value;

            const confirmPasswordValue =
                confirmPassword.value;


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


            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!emailPattern.test(emailValue)) {

                showError(
                    email,
                    "Please enter a valid email address."
                );

                return;
            }


            const phonePattern =
                /^\+?[0-9]{7,15}$/;


            if (!phonePattern.test(phoneValue)) {

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


            if (
                passwordValue !==
                confirmPasswordValue
            ) {

                showError(
                    confirmPassword,
                    "Passwords do not match."
                );

                return;
            }


            if (!terms || !terms.checked) {

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

                    const oldUser =
                        JSON.parse(existingUser);


                    if (
                        oldUser.email &&
                        oldUser.email.toLowerCase() ===
                        emailValue
                    ) {

                        showError(
                            email,
                            "This email is already registered."
                        );

                        return;
                    }


                    if (
                        oldUser.username &&
                        oldUser.username.toLowerCase() ===
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
               DEFAULT ACCOUNT VALUES
            --------------------------------------------- */

            if (
                localStorage.getItem(
                    "finriseBalance"
                ) === null
            ) {

                localStorage.setItem(
                    "finriseBalance",
                    "0"
                );

            }


            if (
                localStorage.getItem(
                    "finriseTotalDeposit"
                ) === null
            ) {

                localStorage.setItem(
                    "finriseTotalDeposit",
                    "0"
                );

            }


            if (
                localStorage.getItem(
                    "finriseTotalEarning"
                ) === null
            ) {

                localStorage.setItem(
                    "finriseTotalEarning",
                    "0"
                );

            }


            if (
                localStorage.getItem(
                    "finriseReferralBonus"
                ) === null
            ) {

                localStorage.setItem(
                    "finriseReferralBonus",
                    "0"
                );

            }


            /* ---------------------------------------------
               NOT LOGGED IN YET
            --------------------------------------------- */

            localStorage.removeItem(
                "loggedIn"
            );


            localStorage.removeItem(
                "currentUser"
            );


            /* ---------------------------------------------
               SUCCESS
            --------------------------------------------- */

            alert(
                "Account created successfully. Please login."
            );


            /* ---------------------------------------------
               SHOW LOGIN
            --------------------------------------------- */

            showLogin();


            if (loginEmail) {

                loginEmail.value =
                    emailValue;

            }


            if (loginPassword) {

                loginPassword.value = "";

            }

        }
    );


    /* =====================================================
       LOGIN
    ===================================================== */

    loginForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            const enteredEmail =
                loginEmail.value
                    .trim()
                    .toLowerCase();


            const enteredPassword =
                loginPassword.value;


            /* ---------------------------------------------
               GET USER
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

                user =
                    JSON.parse(savedUser);

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
                user.email.toLowerCase() !==
                enteredEmail
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
                user.password !==
                enteredPassword
            ) {

                alert(
                    "Incorrect password."
                );

                return;
            }


            /* ---------------------------------------------
               LOGIN SUCCESS
            --------------------------------------------- */

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


            /*
               Dashboard currently reads "user",
               so keep it available.
            */

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );


            /* ---------------------------------------------
               ACCOUNT VALUES
            --------------------------------------------- */

            if (
                localStorage.getItem(
                    "finriseBalance"
                ) === null
            ) {

                localStorage.setItem(
                    "finriseBalance",
                    "0"
                );

            }


            if (
                localStorage.getItem(
                    "finriseTotalDeposit"
                ) === null
            ) {

                localStorage.setItem(
                    "finriseTotalDeposit",
                    "0"
                );

            }


            if (
                localStorage.getItem(
                    "finriseTotalEarning"
                ) === null
            ) {

                localStorage.setItem(
                    "finriseTotalEarning",
                    "0"
                );

            }


            if (
                localStorage.getItem(
                    "finriseReferralBonus"
                ) === null
            ) {

                localStorage.setItem(
                    "finriseReferralBonus",
                    "0"
                );

            }


            /* ---------------------------------------------
               GO TO DASHBOARD
            --------------------------------------------- */

            window.location.href =
                "dashboard.html";

        }
    );


    /* =====================================================
       INITIAL FORM
    ===================================================== */

    showLogin();

});