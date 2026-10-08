/* =========================================================
   FINRISE ASSET
   STANDALONE REGISTRATION
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("registerForm");
    if (!form) return;

    try {
        const { session } = await getSession();
        if (session?.user) {
            window.location.href = "dashboard.html";
            return;
        }
    } catch (error) {
        console.error(error);
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const get = id => document.getElementById(id);
        const fullname = get("fullname")?.value.trim();
        const username = get("username")?.value.trim();
        const email = get("email")?.value.trim().toLowerCase();
        const phone = get("phone")?.value.trim();
        const country = get("country")?.value;
        const referralCode = new URLSearchParams(window.location.search).get("ref")?.trim() || "";
        const password = get("password")?.value || "";
        const confirmPassword = get("confirmPassword")?.value || "";
        const terms = get("terms");
        const button = form.querySelector("button[type='submit']");

        if (!fullname || fullname.length < 3) return alert("Enter your full name.");
        if (!username || username.length < 3) return alert("Username must be at least 3 characters.");
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) return alert("Enter a valid email address.");
        if (!phone || phone.length < 7) return alert("Enter a valid phone number.");
        if (!country) return alert("Select your country.");
        if (password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return alert("Use at least 8 characters with uppercase, lowercase and number.");
        if (password !== confirmPassword) return alert("Passwords do not match.");
        if (!terms?.checked) return alert("Accept the Terms & Conditions.");

        const oldText = button?.textContent;
        if (button) {
            button.disabled = true;
            button.textContent = "Creating account...";
        }

        try {
            const client = await getSupabase();
            const { data, error } = await client.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/verify.html`,
                    data: {
                        full_name: fullname,
                        username,
                        phone,
                        country,
                        referral_code: referralCode || null
                    }
                }
            });

            if (error) throw error;

            if (data.session) {
                window.location.href = "dashboard.html";
                return;
            }

            alert("Account created successfully. Please verify your email before logging in.");
            window.location.href = "logIn_Page.html";
        } catch (error) {
            console.error(error);
            alert(error.message || "Registration failed.");
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = oldText || "Register";
            }
        }
    });
});
