/* =========================================================
   FINRISE ASSET
   SUPABASE AUTHENTICATION
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const goRegister = document.getElementById("goRegister");
    const goLogin = document.getElementById("goLogin");
    const referralCode = new URLSearchParams(window.location.search).get("ref")?.trim() || "";

    /* =========================================================
       FORM SWITCHING
    ========================================================= */

    const showLogin = () => {
        if (loginForm) loginForm.style.display = "block";
        if (registerForm) registerForm.style.display = "none";

        loginBtn?.classList.add("active");
        registerBtn?.classList.remove("active");
    };

    const showRegister = () => {
        if (loginForm) loginForm.style.display = "none";
        if (registerForm) registerForm.style.display = "block";

        registerBtn?.classList.add("active");
        loginBtn?.classList.remove("active");
    };

    loginBtn?.addEventListener("click", showLogin);
    registerBtn?.addEventListener("click", showRegister);
    goRegister?.addEventListener("click", showRegister);
    goLogin?.addEventListener("click", showLogin);

    /* =========================================================
       PASSWORD VISIBILITY
    ========================================================= */

    function togglePassword(toggleId, inputId) {
        const toggle = document.getElementById(toggleId);
        const input = document.getElementById(inputId);

        toggle?.addEventListener("click", () => {
            if (!input) return;

            input.type =
                input.type === "password"
                    ? "text"
                    : "password";

            const icon = toggle.querySelector("i");

            icon?.classList.toggle("fa-eye");
            icon?.classList.toggle("fa-eye-slash");
        });
    }

    togglePassword("toggle3", "loginPassword");
    togglePassword("toggle1", "password");
    togglePassword("toggle2", "confirmPassword");

    /* =========================================================
       CONNECT TO SUPABASE
    ========================================================= */

    try {
        await getSupabase();
    } catch (error) {
        console.error("Supabase initialization error:", error);

        alert(
            "Unable to connect to the authentication service. Please check your internet connection."
        );

        return;
    }

    const client = await getSupabase();

    /* =========================================================
       VALIDATE EXISTING AUTH SESSION
       
       IMPORTANT:
       Do NOT trust getSession() alone here.

       Supabase can have a persisted browser session even when
       the corresponding Auth user has already been deleted.

       The old code did:

           getSession()
           ↓
           user exists locally
           ↓
           dashboard
           ↓
           getUser() fails
           ↓
           login
           ↓
           old session still exists
           ↓
           dashboard
           ↓
           LOOP

       We now validate the persisted session with getUser()
       before allowing the redirect to dashboard.
    ========================================================= */

    try {
        const { session, error: sessionError } = await getSession();

        if (sessionError) {
            console.warn(
                "Unable to read existing authentication session:",
                sessionError
            );

            /*
             * Clear anything that may have been left behind.
             */
            try {
                await client.auth.signOut();
            } catch (clearError) {
                console.warn(
                    "Unable to clear authentication session:",
                    clearError
                );
            }
        } else if (session?.user) {

            /*
             * A locally persisted session exists.

             * Before redirecting, verify that the user still
             * exists on Supabase Auth.
             */
            const {
                user,
                error: userError
            } = await getCurrentUser();

            if (user && !userError) {

                /*
                 * The session is valid and the Auth user still
                 * exists. It is safe to enter the dashboard.
                 */
                window.location.href = "dashboard.html";
                return;
            }

            /*
             * The persisted session is stale or invalid.
             *
             * This is what prevents:
             *
             * login → dashboard → login → dashboard
             *
             * after an Auth user has been deleted.
             */
            console.warn(
                "Stored authentication session is no longer valid. Clearing it."
            );

            try {
                await client.auth.signOut();
            } catch (clearError) {
                console.warn(
                    "Unable to clear stale authentication session:",
                    clearError
                );
            }
        }

    } catch (error) {
        console.error(
            "Authentication session validation error:",
            error
        );

        /*
         * If anything goes wrong while validating the stored
         * session, clear it so the login page can start cleanly.
         */
        try {
            await client.auth.signOut();
        } catch (clearError) {
            console.warn(
                "Unable to clear authentication session:",
                clearError
            );
        }
    }

    /* =========================================================
       LOGIN
    ========================================================= */

    loginForm?.addEventListener("submit", async event => {
        event.preventDefault();

        const email =
            document
                .getElementById("loginEmail")
                ?.value
                .trim()
                .toLowerCase();

        const password =
            document
                .getElementById("loginPassword")
                ?.value || "";

        const button =
            loginForm.querySelector(
                "button[type='submit']"
            );

        if (!email || !password) {
            return;
        }

        const originalText = button?.textContent;

        if (button) {
            button.disabled = true;
            button.textContent = "Logging in...";
        }

        try {
            /*
             * Real Supabase Auth login.
             */
            const { error } =
                await client.auth.signInWithPassword({
                    email,
                    password
                });

            if (error) {
                throw error;
            }

            /*
             * Login succeeded.
             */
            window.location.href = "dashboard.html";

        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            alert(
                error.message ||
                "Login failed. Please check your email and password."
            );

        } finally {
            if (button) {
                button.disabled = false;
                button.textContent =
                    originalText || "Login";
            }
        }
    });

    /* =========================================================
       REGISTRATION
    ========================================================= */

    registerForm?.addEventListener("submit", async event => {
        event.preventDefault();

        const fullname =
            document
                .getElementById("fullname")
                ?.value
                .trim();

        const username =
            document
                .getElementById("username")
                ?.value
                .trim();

        const email =
            document
                .getElementById("email")
                ?.value
                .trim()
                .toLowerCase();

        const phone =
            document
                .getElementById("phone")
                ?.value
                .trim();

        const country =
            document
                .getElementById("country")
                ?.value;

        const password =
            document
                .getElementById("password")
                ?.value || "";

        const confirmPassword =
            document
                .getElementById("confirmPassword")
                ?.value || "";

        const terms =
            document.getElementById("terms");

        const button =
            registerForm.querySelector(
                "button[type='submit']"
            );

        /* =====================================================
           REGISTRATION VALIDATION
        ===================================================== */

        if (!fullname || fullname.length < 3) {
            return alert("Enter your full name.");
        }

        if (!username || username.length < 3) {
            return alert(
                "Username must be at least 3 characters."
            );
        }

        if (
            !email ||
            !/^\S+@\S+\.\S+$/.test(email)
        ) {
            return alert(
                "Enter a valid email address."
            );
        }

        if (!phone || phone.length < 7) {
            return alert(
                "Enter a valid phone number."
            );
        }

        if (!country) {
            return alert(
                "Select your country."
            );
        }

        if (password.length < 8) {
            return alert(
                "Password must contain at least 8 characters."
            );
        }

        if (
            !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(
                password
            )
        ) {
            return alert(
                "Password must contain an uppercase letter, lowercase letter and number."
            );
        }

        if (password !== confirmPassword) {
            return alert(
                "Passwords do not match."
            );
        }

        if (!terms?.checked) {
            return alert(
                "Accept the Terms & Conditions."
            );
        }

        /* =====================================================
           REGISTRATION BUTTON STATE
        ===================================================== */

        const originalText = button?.textContent;

        if (button) {
            button.disabled = true;
            button.textContent =
                "Creating account...";
        }

        /* =====================================================
           CREATE SUPABASE AUTH ACCOUNT
        ===================================================== */

        try {
            const {
                data,
                error
            } = await client.auth.signUp({
                email,
                password,

                options: {
                    emailRedirectTo:
                        `${window.location.origin}/verify.html`,

                    data: {
                        full_name: fullname,
                        username,
                        phone,
                        country,
                        referral_code:
                            referralCode || null
                    }
                }
            });

            if (error) {
                throw error;
            }

            /* =================================================
               IF SUPABASE RETURNS A SESSION
            ================================================= */

            if (data.session) {
                window.location.href =
                    "dashboard.html";

                return;
            }

            /* =================================================
               EMAIL VERIFICATION REQUIRED
            ================================================= */

            alert(
                "Account created successfully. Please check your email to verify your account, then login."
            );

            showLogin();

            const loginEmail =
                document.getElementById(
                    "loginEmail"
                );

            if (loginEmail) {
                loginEmail.value = email;
            }

        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            alert(
                error.message ||
                "Registration failed. Please try again."
            );

        } finally {
            if (button) {
                button.disabled = false;
                button.textContent =
                    originalText || "Register";
            }
        }
    });

    /* =========================================================
       INITIAL FORM
    ========================================================= */

    if (referralCode) {
        showRegister();
    } else {
        showLogin();
    }
});
