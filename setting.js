/* =========================================================
   FINRISE ASSET
   SETTINGS LOGIC
   Supabase/Auth is the source of truth.
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    const settingsSection = document.getElementById("settings");
    if (!settingsSection) return;

    const $ = id => document.getElementById(id);

    const settingsNavItems = settingsSection.querySelectorAll(".settings-nav-item");
    const settingsPanels = settingsSection.querySelectorAll(".settings-panel");

    settingsNavItems.forEach(item => {
        item.addEventListener("click", () => {
            const target = item.dataset.settings;
            if (!target) return;

            settingsNavItems.forEach(nav => nav.classList.remove("active"));
            settingsPanels.forEach(panel => panel.classList.remove("active"));

            item.classList.add("active");
            $(target)?.classList.add("active");
        });
    });

    let authUser = null;
    let profile = {};

    const getNameParts = fullName => {
        const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
        return {
            firstName: parts[0] || "",
            lastName: parts.slice(1).join(" ")
        };
    };

    const getFullName = () => {
        const first = $("settingsFirstName")?.value.trim() || "";
        const last = $("settingsLastName")?.value.trim() || "";
        return `${first} ${last}`.trim();
    };

    function showSettingsMessage(message, type = "success") {
        document.querySelector(".settings-toast")?.remove();

        const toast = document.createElement("div");
        toast.className = "settings-toast";
        toast.dataset.type = type;

        const icon = document.createElement("i");
        icon.className = type === "success"
            ? "fas fa-check-circle"
            : "fas fa-exclamation-circle";

        const text = document.createElement("span");
        text.textContent = message;

        toast.append(icon, text);
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add("hide"), 2700);
        setTimeout(() => toast.remove(), 3100);
    }

    function applyTheme(theme) {
        const mode = theme || "system";

        if (mode === "light") {
            document.body.classList.add("light-theme");
            return;
        }

        if (mode === "dark") {
            document.body.classList.remove("light-theme");
            return;
        }

        document.body.classList.toggle(
            "light-theme",
            window.matchMedia("(prefers-color-scheme: light)").matches
        );
    }

    function getStoredPreferences() {
        const metadata = authUser?.user_metadata || {};
        const preferences = metadata.finrise_settings || {};

        return {
            theme: preferences.theme || "system",
            language: "en",
            currency: "NGN",
            notifications: {
                transactions: preferences.notifications?.transactions !== false,
                deposits: preferences.notifications?.deposits !== false,
                withdrawals: preferences.notifications?.withdrawals !== false,
                investments: preferences.notifications?.investments !== false,
                promotions: preferences.notifications?.promotions !== false
            }
        };
    }

    async function savePreferences(patch) {
        const client = await getSupabase();
        const current = getStoredPreferences();

        const next = {
            theme: patch.theme ?? current.theme,
            language: patch.language ?? current.language,
            currency: patch.currency ?? current.currency,
            notifications: {
                ...current.notifications,
                ...(patch.notifications || {})
            }
        };

        const { data, error } = await client.auth.updateUser({
            data: {
                finrise_settings: next
            }
        });

        if (error) throw error;

        authUser = data?.user || authUser;
        document.documentElement.lang = "en";
        applyTheme(next.theme);
        return next;
    }

    function renderUser() {
        const fullName = profile.full_name || authUser?.user_metadata?.full_name || authUser?.email || "User Account";
        const parts = getNameParts(fullName);
        const email = authUser?.email || "";

        if ($("settingsFirstName")) $("settingsFirstName").value = parts.firstName;
        if ($("settingsLastName")) $("settingsLastName").value = parts.lastName;
        if ($("settingsEmail")) $("settingsEmail").value = email;
        if ($("settingsPhone")) $("settingsPhone").value = profile.phone || authUser?.user_metadata?.phone || "";
        if ($("settingsCountry")) $("settingsCountry").value = profile.country || authUser?.user_metadata?.country || "";

        if ($("settingsUserName")) $("settingsUserName").textContent = fullName;
        if ($("settingsUserEmail")) $("settingsUserEmail").textContent = email;
        if ($("settingsAvatar")) $("settingsAvatar").textContent = fullName.charAt(0).toUpperCase();

        if ($("userName")) $("userName").textContent = fullName;
        if ($("welcome")) $("welcome").textContent = `Welcome, ${fullName}`;
        if ($("profilePageName")) $("profilePageName").textContent = fullName;
        if ($("profilePhone")) $("profilePhone").value = profile.phone || "";
    }

    function renderPreferences() {
        const preferences = getStoredPreferences();

        if ($("twoFactorToggle")) {
            $("twoFactorToggle").checked = false;
            $("twoFactorToggle").disabled = true;
            $("twoFactorToggle").title = "Two-factor authentication requires backend 2FA configuration.";
        }

        const map = {
            transactionNotification: preferences.notifications.transactions,
            depositNotification: preferences.notifications.deposits,
            withdrawalNotification: preferences.notifications.withdrawals,
            investmentNotification: preferences.notifications.investments,
            promoNotification: preferences.notifications.promotions
        };

        Object.entries(map).forEach(([id, value]) => {
            if ($(id)) $(id).checked = Boolean(value);
        });

        if ($("themeSelect")) $("themeSelect").value = preferences.theme;

        if ($("languageSelect")) {
            $("languageSelect").value = "en";
            $("languageSelect").disabled = true;
            $("languageSelect").title = "English is currently the supported Finrise language.";
        }

        if ($("currencySelect")) {
            $("currencySelect").value = "NGN";
            $("currencySelect").disabled = true;
            $("currencySelect").title = "NGN is the supported Finrise wallet currency.";
        }
        document.documentElement.lang = "en";
        applyTheme(preferences.theme);
    }

    async function loadSettingsFromSupabase() {
        const { user, error: userError } = await getCurrentUser();

        if (userError || !user) {
            window.location.href = "logIn_Page.html";
            return;
        }

        authUser = user;

        const { profile: loadedProfile, error: profileError } = await getCurrentProfile();
        if (profileError) console.error("Profile load error:", profileError);

        profile = loadedProfile || {};
        renderUser();
        renderPreferences();
    }

    window.saveGeneralSettings = async function () {
        const firstName = $("settingsFirstName")?.value.trim() || "";
        const lastName = $("settingsLastName")?.value.trim() || "";
        const phone = $("settingsPhone")?.value.trim() || "";
        const country = $("settingsCountry")?.value.trim() || "";
        const fullName = `${firstName} ${lastName}`.trim();

        if (!fullName) {
            alert("Please enter your name.");
            $("settingsFirstName")?.focus();
            return;
        }

        try {
            const result = await updateProfile({
                full_name: fullName,
                phone: phone || null,
                country: country || null
            });

            if (result.error) throw result.error;

            profile = result.data || {
                ...profile,
                full_name: fullName,
                phone: phone || null,
                country: country || null
            };

            if (authUser) {
                const client = await getSupabase();
                const metadataResult = await client.auth.updateUser({
                    data: {
                        full_name: fullName,
                        phone: phone || null,
                        country: country || null
                    }
                });

                if (!metadataResult.error && metadataResult.data?.user) {
                    authUser = metadataResult.data.user;
                }
            }

            renderUser();
            showSettingsMessage("Your account information has been saved.");
        } catch (error) {
            console.error("Settings update failed:", error);
            showSettingsMessage(error.message || "Unable to save your settings.", "error");
        }
    };

    const passwordModal = $("passwordModal");

    window.openPasswordModal = function () {
        if (!passwordModal) return;
        passwordModal.classList.add("active");
        setTimeout(() => $("currentPassword")?.focus(), 100);
    };

    window.closePasswordModal = function () {
        passwordModal?.classList.remove("active");
    };

    passwordModal?.addEventListener("click", event => {
        if (event.target === passwordModal) window.closePasswordModal();
    });

    window.changePassword = async function () {
        const currentPassword = $("currentPassword")?.value || "";
        const newPassword = $("newPassword")?.value || "";
        const confirmPassword = $("confirmPassword")?.value || "";

        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("Please fill in all password fields.");
            return;
        }

        if (newPassword.length < 8) {
            alert("Your new password must contain at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("New passwords do not match.");
            return;
        }

        if (!authUser?.email) {
            alert("Your authenticated email could not be found.");
            return;
        }

        try {
            const client = await getSupabase();

            // Re-authenticate with the current password first.
            const { error: verifyError } = await client.auth.signInWithPassword({
                email: authUser.email,
                password: currentPassword
            });

            if (verifyError) throw new Error("Current password is incorrect.");

            const { error: updateError } = await client.auth.updateUser({
                password: newPassword
            });

            if (updateError) throw updateError;

            ["currentPassword", "newPassword", "confirmPassword"].forEach(id => {
                if ($(id)) $(id).value = "";
            });

            window.closePasswordModal();
            showSettingsMessage("Password changed successfully.");
        } catch (error) {
            console.error("Password change failed:", error);
            alert(error.message || "Unable to change your password.");
        }
    };

    window.changeDashboardTheme = function () {
        const value = $("themeSelect")?.value || "system";
        const previous = getStoredPreferences().theme;
        applyTheme(value);
        savePreferences({ theme: value })
            .then(() => showSettingsMessage("Theme preference saved."))
            .catch(error => {
                applyTheme(previous);
                if ($("themeSelect")) $("themeSelect").value = previous;
                console.error(error);
                showSettingsMessage(error.message || "Unable to save theme preference.", "error");
            });
    };

    window.toggleTwoFactor = function () {
        const toggle = $("twoFactorToggle");
        if (toggle) toggle.checked = false;
        alert("Two-factor authentication is not enabled on the current Finrise backend yet.");
    };

    window.saveNotificationSettings = async function () {
        const notifications = {
            transactions: Boolean($("transactionNotification")?.checked),
            deposits: Boolean($("depositNotification")?.checked),
            withdrawals: Boolean($("withdrawalNotification")?.checked),
            investments: Boolean($("investmentNotification")?.checked),
            promotions: Boolean($("promoNotification")?.checked)
        };

        try {
            await savePreferences({ notifications });
            showSettingsMessage("Notification preferences saved.");
        } catch (error) {
            console.error("Notification settings save failed:", error);
            showSettingsMessage(error.message || "Unable to save notification preferences.", "error");
        }
    };

    const notificationMap = {
        transactionNotification: "transactions",
        depositNotification: "deposits",
        withdrawalNotification: "withdrawals",
        investmentNotification: "investments",
        promoNotification: "promotions"
    };

    Object.entries(notificationMap).forEach(([id, key]) => {
        $(id)?.addEventListener("change", async event => {
            try {
                await savePreferences({
                    notifications: { [key]: event.target.checked }
                });
                showSettingsMessage("Notification preference saved.");
            } catch (error) {
                event.target.checked = !event.target.checked;
                console.error(error);
                showSettingsMessage(error.message || "Unable to save notification preference.", "error");
            }
        });
    });

    $("languageSelect")?.addEventListener("change", async event => {
        event.target.value = "en";
        try {
            await savePreferences({ language: "en" });
            document.documentElement.lang = "en";
            showSettingsMessage("English is the available Finrise language.");
        } catch (error) {
            console.error(error);
            showSettingsMessage(error.message || "Unable to save language preference.", "error");
        }
    });

    $("currencySelect")?.addEventListener("change", async event => {
        event.target.value = "NGN";
        try {
            await savePreferences({ currency: "NGN" });
            showSettingsMessage("NGN is the supported Finrise wallet currency.");
            document.dispatchEvent(new CustomEvent("finrise:currency-changed", {
                detail: { currency: "NGN" }
            }));
        } catch (error) {
            console.error(error);
            showSettingsMessage(error.message || "Unable to save currency preference.", "error");
        }
    });

    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const onSystemThemeChange = () => {
        if (getStoredPreferences().theme === "system") applyTheme("system");
    };

    if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", onSystemThemeChange);
    } else if (mediaQuery.addListener) {
        mediaQuery.addListener(onSystemThemeChange);
    }

    window.logoutUser = async function () {
        const shouldLogout = window.FinriseNotify
            ? await window.FinriseNotify.confirm({
                title: "Log out",
                message: "Are you sure you want to logout?",
                confirmText: "Log out",
                cancelText: "Stay",
                danger: true
            })
            : window.confirm("Are you sure you want to logout?");
        if (!shouldLogout) return;

        try {
            const { error } = await signOut();
            if (error) throw error;
            window.location.href = "logIn_Page.html";
        } catch (error) {
            console.error("Logout error:", error);
            alert(error.message || "Unable to logout. Please try again.");
        }
    };

    try {
        await getSupabase();
        await loadSettingsFromSupabase();
    } catch (error) {
        console.error("Unable to initialize settings:", error);
        showSettingsMessage(error.message || "Unable to load settings.", "error");
    }
});
