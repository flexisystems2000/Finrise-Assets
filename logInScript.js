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

    const showLogin = () => {
        loginForm.style.display = "block";
        registerForm.style.display = "none";
        loginBtn?.classList.add("active");
        registerBtn?.classList.remove("active");
    };

    const showRegister = () => {
        loginForm.style.display = "none";
        registerForm.style.display = "block";
        registerBtn?.classList.add("active");
        loginBtn?.classList.remove("active");
    };

    loginBtn?.addEventListener("click", showLogin);
    registerBtn?.addEventListener("click", showRegister);
    goRegister?.addEventListener("click", showRegister);
    goLogin?.addEventListener("click", showLogin);

    function togglePassword(toggleId, inputId) {
        const toggle = document.getElementById(toggleId);
        const input = document.getElementById(inputId);
        toggle?.addEventListener("click", () => {
            if (!input) return;
            input.type = input.type === "password" ? "text" : "password";
            const icon = toggle.querySelector("i");
            icon?.classList.toggle("fa-eye");
            icon?.classList.toggle("fa-eye-slash");
        });
    }

    togglePassword("toggle3", "loginPassword");
    togglePassword("toggle1", "password");
    togglePassword("toggle2", "confirmPassword");

    try {
        await getSupabase();
    } catch (error) {
        console.error(error);
        alert("Unable to connect to the authentication service. Please check your internet connection.");
        return;
    }

    const client = await getSupabase();

    const { session } = await getSession();
    if (session?.user) {
        window.location.href = "dashboard.html";
        return;
    }

    loginForm?.addEventListener("submit", async event => {
        event.preventDefault();
        const email = document.getElementById("loginEmail")?.value.trim().toLowerCase();
        const password = document.getElementById("loginPassword")?.value || "";
        const button = loginForm.querySelector("button[type='submit']");

        if (!email || !password) return;

        const originalText = button?.textContent;
        if (button) {
            button.disabled = true;
            button.textContent = "Logging in...";
        }

        try {
            const { error } = await client.auth.signInWithPassword({ email, password });
            if (error) throw error;
            window.location.href = "dashboard.html";
        } catch (error) {
            console.error("Login error:", error);
            alert(error.message || "Login failed. Please check your email and password.");
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = originalText || "Login";
            }
        }
    });

    registerForm?.addEventListener("submit", async event => {
        event.preventDefault();

        const fullname = document.getElementById("fullname")?.value.trim();
        const username = document.getElementById("username")?.value.trim();
        const email = document.getElementById("email")?.value.trim().toLowerCase();
        const phone = document.getElementById("phone")?.value.trim();
        const country = document.getElementById("country")?.value;
        const password = document.getElementById("password")?.value || "";
        const confirmPassword = document.getElementById("confirmPassword")?.value || "";
        const terms = document.getElementById("terms");
        const button = registerForm.querySelector("button[type='submit']");

        if (!fullname || fullname.length < 3) return alert("Enter your full name.");
        if (!username || username.length < 3) return alert("Username must be at least 3 characters.");
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) return alert("Enter a valid email address.");
        if (!phone || phone.length < 7) return alert("Enter a valid phone number.");
        if (!country) return alert("Select your country.");
        if (password.length < 8) return alert("Password must contain at least 8 characters.");
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return alert("Password must contain an uppercase letter, lowercase letter and number.");
        if (password !== confirmPassword) return alert("Passwords do not match.");
        if (!terms?.checked) return alert("Accept the Terms & Conditions.");

        const originalText = button?.textContent;
        if (button) {
            button.disabled = true;
            button.textContent = "Creating account...";
        }

        try {
            const { data, error } = await client.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/verify.html`,
                    data: {
                        full_name: fullname,
                        username,
                        phone,
                        country
                    }
                }
            });

            if (error) throw error;

            if (data.session) {
                window.location.href = "dashboard.html";
                return;
            }

            alert("Account created successfully. Please check your email to verify your account, then login.");
            showLogin();
            document.getElementById("loginEmail").value = email;
        } catch (error) {
            console.error("Registration error:", error);
            alert(error.message || "Registration failed. Please try again.");
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = originalText || "Register";
            }
        }
    });

    showLogin();
});
