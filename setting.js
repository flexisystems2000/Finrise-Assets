/* =========================================================
   FINRISE ASSET
   SETTINGS LOGIC
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       SETTINGS SECTION
    ===================================================== */

    const settingsSection =
        document.getElementById("settings");

    if (!settingsSection) {
        return;
    }


    /* =====================================================
       SAFE LOCAL STORAGE HELPERS
    ===================================================== */

    function getStorage(key, fallback = null) {

        try {

            const value =
                localStorage.getItem(key);

            return value !== null
                ? value
                : fallback;

        } catch (error) {

            console.error(
                `Unable to read ${key}:`,
                error
            );

            return fallback;
        }
    }


    function setStorage(key, value) {

        try {

            localStorage.setItem(
                key,
                value
            );

            return true;

        } catch (error) {

            console.error(
                `Unable to save ${key}:`,
                error
            );

            return false;
        }
    }


    function getJSON(key, fallback = null) {

        try {

            const value =
                localStorage.getItem(key);

            if (!value) {
                return fallback;
            }

            return JSON.parse(value);

        } catch (error) {

            console.error(
                `Unable to parse ${key}:`,
                error
            );

            return fallback;
        }
    }


    /* =====================================================
       ELEMENT HELPER
    ===================================================== */

    function getElement(id) {
        return document.getElementById(id);
    }


    /* =====================================================
       SETTINGS NAVIGATION
    ===================================================== */

    const settingsNavItems =
        settingsSection.querySelectorAll(
            ".settings-nav-item"
        );

    const settingsPanels =
        settingsSection.querySelectorAll(
            ".settings-panel"
        );


    settingsNavItems.forEach(item => {

        item.addEventListener(
            "click",
            () => {

                const target =
                    item.dataset.settings;

                if (!target) {
                    return;
                }


                /* Remove active from navigation */

                settingsNavItems.forEach(nav => {

                    nav.classList.remove(
                        "active"
                    );

                });


                /* Hide all panels */

                settingsPanels.forEach(panel => {

                    panel.classList.remove(
                        "active"
                    );

                });


                /* Activate selected item */

                item.classList.add(
                    "active"
                );


                /* Show selected panel */

                const targetPanel =
                    getElement(target);

                if (targetPanel) {

                    targetPanel.classList.add(
                        "active"
                    );
                }

            }
        );

    });


    /* =====================================================
       GET USER
    ===================================================== */

    let user =
        getJSON("user", {});


    if (
        !user ||
        typeof user !== "object"
    ) {

        user = {};

    }


    /* =====================================================
       USER NAME COMPATIBILITY
    ===================================================== */

    /*
     * Your Profile JS uses:
     *
     * user.fullname
     *
     * While this Settings page originally expected:
     *
     * user.firstName
     * user.lastName
     *
     * This version supports both.
     */

    function getFirstName() {

        if (user.firstName) {
            return user.firstName;
        }

        if (user.fullname) {

            return user.fullname
                .trim()
                .split(/\s+/)[0] || "";

        }

        return "";
    }


    function getLastName() {

        if (user.lastName) {
            return user.lastName;
        }

        if (user.fullname) {

            const parts =
                user.fullname
                    .trim()
                    .split(/\s+/);

            return parts.length > 1
                ? parts.slice(1).join(" ")
                : "";

        }

        return "";
    }


    function getFullName() {

        const firstName =
            getFirstName();

        const lastName =
            getLastName();


        const combinedName =
            `${firstName} ${lastName}`
                .trim();


        return (
            combinedName ||
            user.fullname ||
            user.name ||
            "User Account"
        );
    }


    /* =====================================================
       LOAD USER SETTINGS
    ===================================================== */

    function loadSettings() {

        const firstName =
            getFirstName();

        const lastName =
            getLastName();

        const fullName =
            getFullName();

        const email =
            user.email ||
            "No email";


        const firstNameInput =
            getElement(
                "settingsFirstName"
            );

        const lastNameInput =
            getElement(
                "settingsLastName"
            );

        const emailInput =
            getElement(
                "settingsEmail"
            );

        const phoneInput =
            getElement(
                "settingsPhone"
            );

        const countryInput =
            getElement(
                "settingsCountry"
            );


        /* ================================================
           FORM VALUES
        ================================================ */

        if (firstNameInput) {

            firstNameInput.value =
                firstName;
        }


        if (lastNameInput) {

            lastNameInput.value =
                lastName;
        }


        if (emailInput) {

            emailInput.value =
                email === "No email"
                    ? ""
                    : email;
        }


        if (phoneInput) {

            phoneInput.value =
                user.phone || "";
        }


        if (countryInput) {

            countryInput.value =
                user.country || "";
        }


        /* ================================================
           USER DISPLAY
        ================================================ */

        const settingsUserName =
            getElement(
                "settingsUserName"
            );

        const settingsUserEmail =
            getElement(
                "settingsUserEmail"
            );

        const settingsAvatar =
            getElement(
                "settingsAvatar"
            );


        if (settingsUserName) {

            settingsUserName.textContent =
                fullName;
        }


        if (settingsUserEmail) {

            settingsUserEmail.textContent =
                email;
        }


        if (settingsAvatar) {

            settingsAvatar.textContent =
                (
                    fullName ||
                    "U"
                )
                .charAt(0)
                .toUpperCase();
        }

    }


    /* =====================================================
       SAVE GENERAL SETTINGS
    ===================================================== */

    window.saveGeneralSettings =
        function () {

            const firstNameInput =
                getElement(
                    "settingsFirstName"
                );

            const lastNameInput =
                getElement(
                    "settingsLastName"
                );

            const phoneInput =
                getElement(
                    "settingsPhone"
                );

            const countryInput =
                getElement(
                    "settingsCountry"
                );


            const firstName =
                firstNameInput
                    ? firstNameInput.value.trim()
                    : "";


            const lastName =
                lastNameInput
                    ? lastNameInput.value.trim()
                    : "";


            const phone =
                phoneInput
                    ? phoneInput.value.trim()
                    : "";


            const country =
                countryInput
                    ? countryInput.value
                    : "";


            /* ==============================================
               VALIDATION
            ============================================== */

            if (!firstName && !lastName) {

                alert(
                    "Please enter your name."
                );

                if (firstNameInput) {
                    firstNameInput.focus();
                }

                return;
            }


            /* ==============================================
               UPDATE USER
            ============================================== */

            user.firstName =
                firstName;

            user.lastName =
                lastName;

            user.phone =
                phone;

            user.country =
                country;


            const fullName =
                `${firstName} ${lastName}`
                    .trim();


            /*
             * Keep fullname synchronized
             * with the Profile page.
             */

            user.fullname =
                fullName;


            /* ==============================================
               SAVE USER
            ============================================== */

            const saved =
                setStorage(
                    "user",
                    JSON.stringify(user)
                );


            if (!saved) {

                showSettingsMessage(
                    "Unable to save your settings."
                );

                return;
            }


            /* ==============================================
               UPDATE SETTINGS DISPLAY
            ============================================== */

            const settingsUserName =
                getElement(
                    "settingsUserName"
                );

            const settingsAvatar =
                getElement(
                    "settingsAvatar"
                );


            if (settingsUserName) {

                settingsUserName.textContent =
                    fullName ||
                    "User Account";
            }


            if (settingsAvatar) {

                settingsAvatar.textContent =
                    (
                        fullName ||
                        "U"
                    )
                    .charAt(0)
                    .toUpperCase();
            }


            /* ==============================================
               UPDATE DASHBOARD
            ============================================== */

            const dashboardName =
                getElement("userName");

            const welcome =
                getElement("welcome");

            if (dashboardName) {

                dashboardName.textContent =
                    fullName ||
                    "User";
            }


            if (welcome) {

                welcome.textContent =
                    `Welcome, ${
                        fullName || "User"
                    }`;
            }


            /* ==============================================
               UPDATE PROFILE PAGE
            ============================================== */

            const profileName =
                getElement(
                    "profilePageName"
                );

            const profilePhone =
                getElement(
                    "profilePhone"
                );


            if (profileName) {

                profileName.textContent =
                    fullName ||
                    "Finrise User";
            }


            if (profilePhone) {

                profilePhone.value =
                    phone;
            }


            showSettingsMessage(
                "Your account information has been saved."
            );
        };


    /* =====================================================
       PASSWORD MODAL
    ===================================================== */

    const passwordModal =
        getElement(
            "passwordModal"
        );


    window.openPasswordModal =
        function () {

            if (!passwordModal) {
                return;
            }

            passwordModal.classList.add(
                "active"
            );

            const currentPassword =
                getElement(
                    "currentPassword"
                );

            if (currentPassword) {

                setTimeout(() => {

                    currentPassword.focus();

                }, 100);
            }

        };


    window.closePasswordModal =
        function () {

            if (!passwordModal) {
                return;
            }

            passwordModal.classList.remove(
                "active"
            );
        };


    /* =====================================================
       CLOSE PASSWORD MODAL OUTSIDE
    ===================================================== */

    if (passwordModal) {

        passwordModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    passwordModal
                ) {

                    window.closePasswordModal();
                }

            }
        );
    }


    /* =====================================================
       CHANGE PASSWORD
    ===================================================== */

    window.changePassword =
        function () {

            const currentPasswordInput =
                getElement(
                    "currentPassword"
                );

            const newPasswordInput =
                getElement(
                    "newPassword"
                );

            const confirmPasswordInput =
                getElement(
                    "confirmPassword"
                );


            const currentPassword =
                currentPasswordInput
                    ? currentPasswordInput.value
                    : "";


            const newPassword =
                newPasswordInput
                    ? newPasswordInput.value
                    : "";


            const confirmPassword =
                confirmPasswordInput
                    ? confirmPasswordInput.value
                    : "";


            /* ==============================================
               VALIDATION
            ============================================== */

            if (
                !currentPassword ||
                !newPassword ||
                !confirmPassword
            ) {

                alert(
                    "Please fill in all password fields."
                );

                return;
            }


            if (
                newPassword.length < 8
            ) {

                alert(
                    "Your new password must contain at least 8 characters."
                );

                return;
            }


            if (
                newPassword !==
                confirmPassword
            ) {

                alert(
                    "New passwords do not match."
                );

                return;
            }


            /*
             * IMPORTANT
             *
             * Password changes should NOT be handled
             * by localStorage in the real application.
             *
             * The PHP backend will:
             *
             * 1. Verify the current password.
             * 2. Validate the new password.
             * 3. Hash the new password.
             * 4. Update MySQL.
             * 5. Return success/failure.
             *
             * Therefore, this frontend does not store
             * the new password.
             */


            alert(
                "Password change will be processed securely by the backend."
            );


            /* Clear fields */

            if (currentPasswordInput) {

                currentPasswordInput.value =
                    "";
            }


            if (newPasswordInput) {

                newPasswordInput.value =
                    "";
            }


            if (confirmPasswordInput) {

                confirmPasswordInput.value =
                    "";
            }


            window.closePasswordModal();
        };


    /* =====================================================
       TWO-FACTOR AUTHENTICATION
    ===================================================== */

    const twoFactorToggle =
        getElement(
            "twoFactorToggle"
        );


    window.toggleTwoFactor =
        function () {

            if (!twoFactorToggle) {
                return;
            }


            const enabled =
                twoFactorToggle.checked;


            setStorage(
                "twoFactorEnabled",
                String(enabled)
            );


            if (enabled) {

                showSettingsMessage(
                    "Two-factor authentication enabled."
                );

            } else {

                showSettingsMessage(
                    "Two-factor authentication disabled."
                );
            }

        };


    /* =====================================================
       NOTIFICATION SETTINGS
    ===================================================== */

    window.saveNotificationSettings =
        function () {

            const transactionNotification =
                getElement(
                    "transactionNotification"
                );

            const depositNotification =
                getElement(
                    "depositNotification"
                );

            const withdrawalNotification =
                getElement(
                    "withdrawalNotification"
                );

            const investmentNotification =
                getElement(
                    "investmentNotification"
                );

            const promoNotification =
                getElement(
                    "promoNotification"
                );


            const notifications = {

                transactions:
                    transactionNotification
                        ? transactionNotification.checked
                        : false,

                deposits:
                    depositNotification
                        ? depositNotification.checked
                        : false,

                withdrawals:
                    withdrawalNotification
                        ? withdrawalNotification.checked
                        : false,

                investments:
                    investmentNotification
                        ? investmentNotification.checked
                        : false,

                promotions:
                    promoNotification
                        ? promoNotification.checked
                        : false
            };


            const saved =
                setStorage(
                    "notificationSettings",
                    JSON.stringify(
                        notifications
                    )
                );


            if (!saved) {

                showSettingsMessage(
                    "Unable to save notification settings."
                );

                return;
            }


            showSettingsMessage(
                "Notification preferences saved."
            );

        };


    /* =====================================================
       DASHBOARD THEME
    ===================================================== */

    window.changeDashboardTheme =
        function () {

            const themeSelect =
                getElement(
                    "themeSelect"
                );


            if (!themeSelect) {
                return;
            }


            const theme =
                themeSelect.value;


            setStorage(
                "dashboardTheme",
                theme
            );


            applyTheme(theme);

        };


    /* =====================================================
       APPLY THEME
    ===================================================== */

    function applyTheme(theme) {

        if (theme === "light") {

            document.body.classList.add(
                "light-theme"
            );

            return;
        }


        if (theme === "dark") {

            document.body.classList.remove(
                "light-theme"
            );

            return;
        }


        /* SYSTEM THEME */

        const prefersLight =
            window.matchMedia(
                "(prefers-color-scheme: light)"
            ).matches;


        document.body.classList.toggle(
            "light-theme",
            prefersLight
        );
    }


    /* =====================================================
       LOAD SAVED SETTINGS
    ===================================================== */

    function loadSavedSettings() {

        /* ================================================
           TWO FACTOR
        ================================================ */

        const savedTwoFactor =
            getStorage(
                "twoFactorEnabled"
            );


        if (twoFactorToggle) {

            twoFactorToggle.checked =
                savedTwoFactor === "true";
        }


        /* ================================================
           NOTIFICATIONS
        ================================================ */

        const savedNotifications =
            getJSON(
                "notificationSettings",
                null
            );


        if (savedNotifications) {

            const transactionNotification =
                getElement(
                    "transactionNotification"
                );

            const depositNotification =
                getElement(
                    "depositNotification"
                );

            const withdrawalNotification =
                getElement(
                    "withdrawalNotification"
                );

            const investmentNotification =
                getElement(
                    "investmentNotification"
                );

            const promoNotification =
                getElement(
                    "promoNotification"
                );


            if (transactionNotification) {

                transactionNotification.checked =
                    Boolean(
                        savedNotifications.transactions
                    );
            }


            if (depositNotification) {

                depositNotification.checked =
                    Boolean(
                        savedNotifications.deposits
                    );
            }


            if (withdrawalNotification) {

                withdrawalNotification.checked =
                    Boolean(
                        savedNotifications.withdrawals
                    );
            }


            if (investmentNotification) {

                investmentNotification.checked =
                    Boolean(
                        savedNotifications.investments
                    );
            }


            if (promoNotification) {

                promoNotification.checked =
                    Boolean(
                        savedNotifications.promotions
                    );
            }
        }


        /* ================================================
           THEME
        ================================================ */

        const savedTheme =
            getStorage(
                "dashboardTheme",
                "system"
            );


        const themeSelect =
            getElement(
                "themeSelect"
            );


        if (themeSelect) {

            themeSelect.value =
                savedTheme;
        }


        applyTheme(savedTheme);

    }


    /* =====================================================
       SYSTEM THEME CHANGE
    ===================================================== */

    const mediaQuery =
        window.matchMedia(
            "(prefers-color-scheme: light)"
        );


    if (mediaQuery.addEventListener) {

        mediaQuery.addEventListener(
            "change",
            () => {

                const savedTheme =
                    getStorage(
                        "dashboardTheme",
                        "system"
                    );


                if (
                    savedTheme ===
                    "system"
                ) {

                    applyTheme("system");
                }

            }
        );

    }


    /* =====================================================
       SETTINGS MESSAGE / TOAST
    ===================================================== */

    function showSettingsMessage(message) {

        const oldMessage =
            document.querySelector(
                ".settings-toast"
            );


        if (oldMessage) {

            oldMessage.remove();
        }


        const toast =
            document.createElement(
                "div"
            );


        toast.className =
            "settings-toast";


        /* Prevent HTML injection */

        const icon =
            document.createElement(
                "i"
            );

        icon.className =
            "fas fa-check-circle";


        const text =
            document.createElement(
                "span"
            );

        text.textContent =
            message;


        toast.appendChild(icon);

        toast.appendChild(text);


        document.body.appendChild(
            toast
        );


        setTimeout(() => {

            toast.classList.add(
                "hide"
            );


            setTimeout(() => {

                if (toast.parentNode) {

                    toast.remove();
                }

            }, 300);

        }, 3000);

    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    window.logoutUser =
        function () {

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmLogout) {
                return;
            }


            localStorage.removeItem(
                "loggedIn"
            );


            /*
             * IMPORTANT:
             *
             * Your dashboardScript.js currently
             * redirects to:
             *
             * logIn_Page.html
             *
             * Keep the filename consistent.
             */

            window.location.href =
                "logIn_Page.html";
        };


    /* =====================================================
       INITIALIZE
    ===================================================== */

    loadSettings();

    loadSavedSettings();

});