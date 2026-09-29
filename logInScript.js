/* =========================================================
   FINRISE ASSET
   SUPABASE LOGIN & REGISTER
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       SUPABASE CONFIGURATION
    ===================================================== */

    const SUPABASE_URL =
        "https://ryvauylmymcvbvvlaceb.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_zF84MIhSPOZ3MXth_LLqDA_yQ4pIvp6";

    /* =====================================================
       LOAD SUPABASE CLIENT
    ===================================================== */

    function loadSupabase() {

        return new Promise((resolve, reject) => {

            if (window.supabase) {
                resolve();
                return;
            }

            const script =
                document.createElement("script");

            script.src =
                "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

            script.onload = resolve;

            script.onerror = () => {
                reject(
                    new Error(
                        "Unable to load Supabase."
                    )
                );
            };

            document.head.appendChild(script);

        });

    }


    try {

        await loadSupabase();

    } catch (error) {

        console.error(
            "Supabase loading error:",
            error
        );

        alert(
            "Unable to connect to the authentication service. Please check your internet connection and try again."
        );

        return;
    }


    /* =====================================================
       CREATE SUPABASE CLIENT
    ===================================================== */

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );


    /* =====================================================
       BUTTONS & FORMS
    ===================================================== */

    const loginBtn =
        document.getElementById("loginBtn");

    const registerBtn =
        document.getElementById("registerBtn");

    const loginForm =
        document.getElementById("loginForm");

    const registerForm =
        document.getElementById("registerForm");

    const goRegister =
        document.getElementById("goRegister");

    const goLogin =
        document.getElementById("goLogin");


    /* =====================================================
       REGISTER INPUTS
    ===================================================== */

    const fullname =
        document.getElementById("fullname");

    const username =
        document.getElementById("username");

    const email =
        document.getElementById("email");

    const phone =
        document.getElementById("phone");

    const country =
        document.getElementById("country");

    const password =
        document.getElementById("password");

    const confirmPassword =
        document.getElementById("confirmPassword");

    const terms =
        document.getElementById("terms");


    /* =====================================================
       LOGIN INPUTS
    ===================================================== */

    const loginEmail =
        document.getElementById("loginEmail");

    const loginPassword =
        document.getElementById("loginPassword");


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

    function passwordToggle(
        toggleId,
        inputId
    ) {

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

                if (
                    input.type ===
                    "password"
                ) {

                    input.type = "text";

                    toggle.innerHTML =
                        '<i class="fa fa-eye-slash"></i>';

                } else {

                    input.type =
                        "password";

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

    function showError(
        input,
        message
    ) {

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

            small.textContent =
                message;

            small.style.color =
                "red";

        }


        input.style.borderColor =
            "red";

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

            small.textContent =
                "";

        }


        input.style.borderColor =
            "";

    }


    /* =====================================================
       CLEAR ALL REGISTER ERRORS
    ===================================================== */

    function clearRegisterErrors() {

        clearError(fullname);
        clearError(username);
        clearError(email);
        clearError(phone);
        clearError(country);
        clearError(password);
        clearError(confirmPassword);

    }


    /* =====================================================
       REGISTER
    ===================================================== */

    registerForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            clearRegisterErrors();


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

            if (
                fullNameValue.length < 2
            ) {

                showError(
                    fullname,
                    "Please enter your full name."
                );

                return;
            }


            if (
                usernameValue.length < 3
            ) {

                showError(
                    username,
                    "Username must be at least 3 characters."
                );

                return;
            }


            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    emailValue
                )
            ) {

                showError(
                    email,
                    "Please enter a valid email address."
                );

                return;
            }


            const phonePattern =
                /^\+?[0-9]{7,15}$/;


            if (
                !phonePattern.test(
                    phoneValue
                )
            ) {

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


            if (
                passwordValue.length < 6
            ) {

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


            if (
                !terms ||
                !terms.checked
            ) {

                alert(
                    "Please agree to the Terms & Conditions."
                );

                return;
            }


            /* ---------------------------------------------
               DISABLE SUBMIT BUTTON
            --------------------------------------------- */

            const submitButton =
                registerForm.querySelector(
                    'button[type="submit"]'
                );


            const originalButtonText =
                submitButton
                    ? submitButton.textContent
                    : "";


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Creating Account...";

            }


            try {

                /* -----------------------------------------
                   CHECK USERNAME FIRST
                ----------------------------------------- */

                const {
                    data: usernameData,
                    error: usernameError
                } =
                    await supabaseClient
                        .from("profiles")
                        .select("id")
                        .eq(
                            "username",
                            usernameValue
                        )
                        .maybeSingle();


                if (usernameError) {

                    console.error(
                        "Username check error:",
                        usernameError
                    );

                    throw usernameError;
                }


                if (usernameData) {

                    showError(
                        username,
                        "This username is already taken."
                    );

                    return;
                }


                /* -----------------------------------------
                   CREATE SUPABASE AUTH ACCOUNT
                ----------------------------------------- */

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth.signUp({

                        email:
                            emailValue,

                        password:
                            passwordValue,

                        options: {

                            data: {

                                full_name:
                                    fullNameValue,

                                username:
                                    usernameValue,

                                phone:
                                    phoneValue,

                                country:
                                    countryValue

                            }

                        }

                    });


                if (error) {

                    console.error(
                        "Registration error:",
                        error
                    );

                    const message =
                        error.message.toLowerCase();


                    if (
                        message.includes(
                            "already registered"
                        ) ||
                        message.includes(
                            "already exists"
                        )
                    ) {

                        showError(
                            email,
                            "This email is already registered."
                        );

                        return;
                    }


                    throw error;
                }


                if (!data || !data.user) {

                    throw new Error(
                        "Account could not be created."
                    );

                }


                /* -----------------------------------------
                   IMPORTANT
                   
                   When email confirmation is enabled,
                   Supabase normally does NOT create an
                   active session immediately.
                   
                   Therefore profile information will be
                   saved after the user confirms their email
                   and successfully logs in.
                ----------------------------------------- */


                alert(
                    "Account created successfully! Please check your email and confirm your account before logging in."
                );


                /* -----------------------------------------
                   RESET FORM
                ----------------------------------------- */

                registerForm.reset();


                /* -----------------------------------------
                   SHOW LOGIN
                ----------------------------------------- */

                showLogin();


                if (loginEmail) {

                    loginEmail.value =
                        emailValue;

                }


                if (loginPassword) {

                    loginPassword.value =
                        "";

                }


            } catch (error) {

                console.error(
                    "Registration failed:",
                    error
                );


                alert(
                    error.message ||
                    "Registration failed. Please try again."
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        originalButtonText;

                }

            }

        }
    );


    /* =====================================================
       LOGIN
    ===================================================== */

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            clearError(loginEmail);

            clearError(loginPassword);


            const enteredEmail =
                loginEmail.value
                    .trim()
                    .toLowerCase();


            const enteredPassword =
                loginPassword.value;


            /* ---------------------------------------------
               VALIDATE EMAIL
            --------------------------------------------- */

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    enteredEmail
                )
            ) {

                showError(
                    loginEmail,
                    "Please enter a valid email address."
                );

                return;
            }


            if (!enteredPassword) {

                showError(
                    loginPassword,
                    "Please enter your password."
                );

                return;
            }


            /* ---------------------------------------------
               DISABLE LOGIN BUTTON
            --------------------------------------------- */

            const submitButton =
                loginForm.querySelector(
                    'button[type="submit"]'
                );


            const originalButtonText =
                submitButton
                    ? submitButton.textContent
                    : "";


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Logging in...";

            }


            try {

                /* -----------------------------------------
                   SUPABASE LOGIN
                ----------------------------------------- */

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth
                        .signInWithPassword({

                            email:
                                enteredEmail,

                            password:
                                enteredPassword

                        });


                if (error) {

                    console.error(
                        "Login error:",
                        error
                    );


                    const message =
                        error.message
                            .toLowerCase();


                    /* -------------------------------------
                       EMAIL NOT CONFIRMED
                    ------------------------------------- */

                    if (
                        message.includes(
                            "email not confirmed"
                        )
                    ) {

                        alert(
                            "Please confirm your email address before logging in."
                        );

                        return;
                    }


                    /* -------------------------------------
                       INVALID LOGIN
                       
                       Supabase intentionally uses a
                       generic authentication error here.
                    ------------------------------------- */

                    if (
                        message.includes(
                            "invalid login credentials"
                        )
                    ) {

                        alert(
                            "Email or password is incorrect. If you have not registered, please register first."
                        );

                        return;
                    }


                    throw error;
                }


                if (
                    !data ||
                    !data.user
                ) {

                    throw new Error(
                        "Login failed. Please try again."
                    );

                }


                /* -----------------------------------------
                   GET AUTHENTICATED USER
                ----------------------------------------- */

                const user =
                    data.user;


                /* -----------------------------------------
                   GET USER METADATA
                ----------------------------------------- */

                const metadata =
                    user.user_metadata ||
                    {};


                const profileData = {

                    id:
                        user.id,

                    full_name:
                        metadata.full_name ||
                        "",

                    username:
                        metadata.username ||
                        "",

                    phone:
                        metadata.phone ||
                        "",

                    country:
                        metadata.country ||
                        ""

                };


                /* -----------------------------------------
                   SAVE / UPDATE PROFILE
                   
                   This happens after authentication, when
                   the user has an authenticated session.
                ----------------------------------------- */

                const {
                    data: profile,
                    error: profileError
                } =
                    await supabaseClient
                        .from("profiles")
                        .upsert(
                            profileData,
                            {
                                onConflict:
                                    "id"
                            }
                        )
                        .select()
                        .single();


                if (profileError) {

                    console.error(
                        "Profile save error:",
                        profileError
                    );

                    /*
                       Do not block login if the profile
                       operation fails. The Supabase Auth
                       session itself is already valid.
                    */

                }


                /* -----------------------------------------
                   BUILD USER OBJECT FOR EXISTING DASHBOARD
                ----------------------------------------- */

                const currentUser = {

                    id:
                        user.id,

                    fullname:
                        profile?.full_name ||
                        metadata.full_name ||
                        "",

                    username:
                        profile?.username ||
                        metadata.username ||
                        "",

                    email:
                        user.email ||
                        enteredEmail,

                    phone:
                        profile?.phone ||
                        metadata.phone ||
                        "",

                    country:
                        profile?.country ||
                        metadata.country ||
                        ""

                };


                /* -----------------------------------------
                   EXISTING FINRISE DASHBOARD VALUES
                   
                   These are NOT authentication credentials.
                   They are only retained temporarily because
                   the current dashboard uses them.
                ----------------------------------------- */

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


                /* -----------------------------------------
                   COMPATIBILITY WITH CURRENT DASHBOARD
                   
                   IMPORTANT:
                   These values contain NO PASSWORD.
                ----------------------------------------- */

                localStorage.setItem(
                    "loggedIn",
                    "true"
                );


                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(
                        currentUser
                    )
                );


                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        currentUser
                    )
                );


                /* -----------------------------------------
                   GO TO DASHBOARD
                ----------------------------------------- */

                window.location.href =
                    "dashboard.html";


            } catch (error) {

                console.error(
                    "Login failed:",
                    error
                );


                alert(
                    error.message ||
                    "Login failed. Please try again."
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        originalButtonText;

                }

            }

        }
    );


    /* =====================================================
       CHECK EXISTING SUPABASE SESSION
    ===================================================== */

    try {

        const {
            data
        } =
            await supabaseClient.auth
                .getSession();


        if (
            data &&
            data.session
        ) {

            console.log(
                "Existing Supabase session found."
            );

        }

    } catch (error) {

        console.error(
            "Session check failed:",
            error
        );

    }


    /* =====================================================
       INITIAL FORM
    ===================================================== */

    showLogin();

});
