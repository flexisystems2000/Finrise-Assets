/* =========================================================
   FINRISE ASSET
   PROFILE LOGIC
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       PROFILE SECTION
    ===================================================== */

    const profileSection = document.getElementById("profile");

    if (!profileSection) {
        return;
    }


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const profileForm =
        document.getElementById("profileForm");

    const editBtn =
        document.getElementById("editProfileBtn");

    const saveBtn =
        document.getElementById("saveProfileBtn");

    const cancelBtn =
        document.getElementById("cancelProfileBtn");

    const imageInput =
        document.getElementById("profileImageInput");

    const profileImage =
        document.getElementById("profilePageImage");

    const fullnameInput =
        document.getElementById("profileFullname");

    const emailInput =
        document.getElementById("profileEmail");

    const phoneInput =
        document.getElementById("profilePhone");

    const countryInput =
        document.getElementById("profileCountry");

    const profileName =
        document.getElementById("profilePageName");

    const profileEmailText =
        document.getElementById("profilePageEmail");

    const accountId =
        document.getElementById("profileAccountId");

    const accountInfoId =
        document.getElementById("accountInfoId");

    const memberSince =
        document.getElementById("memberSince");

    const phoneStatus =
        document.getElementById("phoneStatus");

    const changePasswordBtn =
        document.getElementById("changePasswordBtn");


    /* =====================================================
       SAFE LOCAL STORAGE
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


    /* =====================================================
       GET USER
    ===================================================== */

    let user = null;

    try {

        const savedUser =
            localStorage.getItem("user");

        if (savedUser) {

            user =
                JSON.parse(savedUser);

        }

    } catch (error) {

        console.error(
            "Unable to read user data:",
            error
        );

        user = null;
    }


    if (!user) {

        console.warn(
            "No logged-in user found."
        );

        return;
    }


    /* =====================================================
       CREATE ACCOUNT ID
    ===================================================== */

    function getAccountId() {

        let id =
            getStorage(
                "finriseAccountId"
            );

        if (!id) {

            id =
                "FR-" +
                Math.floor(
                    100000 +
                    Math.random() * 900000
                );

            setStorage(
                "finriseAccountId",
                id
            );
        }

        return id;
    }


    /* =====================================================
       MEMBER SINCE
    ===================================================== */

    function getMemberDate() {

        let date =
            getStorage(
                "finriseMemberSince"
            );

        if (!date) {

            date =
                new Date().toLocaleDateString(
                    "en-US",
                    {
                        month: "long",
                        year: "numeric"
                    }
                );

            setStorage(
                "finriseMemberSince",
                date
            );
        }

        return date;
    }


    /* =====================================================
       PHONE STATUS
    ===================================================== */

    function updatePhoneStatus() {

        if (!phoneStatus) {
            return;
        }

        const userPhone =
            typeof user.phone === "string"
                ? user.phone.trim()
                : "";

        if (userPhone) {

            phoneStatus.textContent =
                "Added";

            phoneStatus.style.color =
                "#22c55e";

        } else {

            phoneStatus.textContent =
                "Not Added";

            phoneStatus.style.color =
                "#777";
        }
    }


    /* =====================================================
       LOAD PROFILE
    ===================================================== */

    function loadProfile() {

        const name =
            user.fullname?.trim() ||
            "Finrise User";

        const email =
            user.email?.trim() ||
            "No email";

        const phone =
            user.phone?.trim() ||
            "";

        const country =
            user.country ||
            "";


        /* ================================================
           FORM VALUES
        ================================================ */

        if (fullnameInput) {

            fullnameInput.value =
                name === "Finrise User"
                    ? ""
                    : name;
        }


        if (emailInput) {

            emailInput.value =
                email === "No email"
                    ? ""
                    : email;
        }


        if (phoneInput) {

            phoneInput.value =
                phone;
        }


        if (countryInput) {

            countryInput.value =
                country;
        }


        /* ================================================
           PROFILE HEADER
        ================================================ */

        if (profileName) {

            profileName.textContent =
                name;
        }


        if (profileEmailText) {

            profileEmailText.textContent =
                email;
        }


        /* ================================================
           ACCOUNT ID
        ================================================ */

        const id =
            getAccountId();

        if (accountId) {

            accountId.textContent =
                id;
        }


        if (accountInfoId) {

            accountInfoId.textContent =
                id;
        }


        /* ================================================
           MEMBER SINCE
        ================================================ */

        if (memberSince) {

            memberSince.textContent =
                getMemberDate();
        }


        /* ================================================
           PROFILE IMAGE
        ================================================ */

        const savedImage =
            getStorage(
                "finriseProfileImage"
            );

        if (
            savedImage &&
            profileImage
        ) {

            profileImage.src =
                savedImage;
        }


        /* ================================================
           PHONE STATUS
        ================================================ */

        updatePhoneStatus();
    }


    /* =====================================================
       EDIT MODE
    ===================================================== */

    function setEditMode(enabled) {

        if (fullnameInput) {

            fullnameInput.disabled =
                !enabled;
        }


        if (phoneInput) {

            phoneInput.disabled =
                !enabled;
        }


        if (countryInput) {

            countryInput.disabled =
                !enabled;
        }


        /*
         * Email remains disabled.
         *
         * Changing email should normally require
         * backend verification.
         */


        if (editBtn) {

            editBtn.style.display =
                enabled
                    ? "none"
                    : "inline-flex";
        }


        if (saveBtn) {

            saveBtn.style.display =
                enabled
                    ? "inline-flex"
                    : "none";
        }


        if (cancelBtn) {

            cancelBtn.style.display =
                enabled
                    ? "inline-flex"
                    : "none";
        }
    }


    /* =====================================================
       EDIT PROFILE
    ===================================================== */

    if (editBtn) {

        editBtn.addEventListener(
            "click",
            () => {

                setEditMode(true);

                if (fullnameInput) {

                    fullnameInput.focus();
                }
            }
        );
    }


    /* =====================================================
       CANCEL EDIT
    ===================================================== */

    if (cancelBtn) {

        cancelBtn.addEventListener(
            "click",
            () => {

                loadProfile();

                setEditMode(false);
            }
        );
    }


    /* =====================================================
       SAVE PROFILE
    ===================================================== */

    if (profileForm) {

        profileForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                /* ==========================================
                   GET VALUES
                ========================================== */

                const newName =
                    fullnameInput
                        ? fullnameInput.value.trim()
                        : "";

                const newPhone =
                    phoneInput
                        ? phoneInput.value.trim()
                        : "";

                const newCountry =
                    countryInput
                        ? countryInput.value
                        : "";


                /* ==========================================
                   VALIDATION
                ========================================== */

                if (!newName) {

                    alert(
                        "Please enter your full name."
                    );

                    if (fullnameInput) {
                        fullnameInput.focus();
                    }

                    return;
                }


                if (newName.length < 2) {

                    alert(
                        "Your name must contain at least 2 characters."
                    );

                    if (fullnameInput) {
                        fullnameInput.focus();
                    }

                    return;
                }


                /* ==========================================
                   UPDATE USER
                ========================================== */

                user.fullname =
                    newName;

                user.phone =
                    newPhone;

                user.country =
                    newCountry;


                /* ==========================================
                   SAVE USER
                ========================================== */

                const saved =
                    setStorage(
                        "user",
                        JSON.stringify(user)
                    );


                if (!saved) {

                    alert(
                        "Unable to save your profile. Please try again."
                    );

                    return;
                }


                /* ==========================================
                   UPDATE DASHBOARD
                ========================================== */

                const dashboardName =
                    document.getElementById(
                        "userName"
                    );

                const welcome =
                    document.getElementById(
                        "welcome"
                    );

                const dashboardEmail =
                    document.getElementById(
                        "userEmail"
                    );


                if (dashboardName) {

                    dashboardName.textContent =
                        user.fullname;
                }


                if (welcome) {

                    welcome.textContent =
                        `Welcome, ${user.fullname}`;
                }


                if (dashboardEmail) {

                    dashboardEmail.textContent =
                        user.email || "No email";
                }


                /* ==========================================
                   UPDATE PROFILE
                ========================================== */

                if (profileName) {

                    profileName.textContent =
                        user.fullname;
                }


                if (profileEmailText) {

                    profileEmailText.textContent =
                        user.email || "No email";
                }


                updatePhoneStatus();

                setEditMode(false);


                alert(
                    "Profile updated successfully."
                );
            }
        );
    }


    /* =====================================================
       PROFILE IMAGE
    ===================================================== */

    if (imageInput) {

        imageInput.addEventListener(
            "change",
            event => {

                const file =
                    event.target.files?.[0];


                if (!file) {
                    return;
                }


                /* ==========================================
                   CHECK IMAGE TYPE
                ========================================== */

                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {

                    alert(
                        "Please select a valid image."
                    );

                    imageInput.value = "";

                    return;
                }


                /* ==========================================
                   CHECK IMAGE SIZE
                ========================================== */

                if (
                    file.size >
                    2 * 1024 * 1024
                ) {

                    alert(
                        "Please select an image smaller than 2MB."
                    );

                    imageInput.value = "";

                    return;
                }


                /* ==========================================
                   READ IMAGE
                ========================================== */

                const reader =
                    new FileReader();


                reader.onload =
                    () => {

                        const imageData =
                            reader.result;


                        if (
                            typeof imageData !==
                            "string"
                        ) {

                            alert(
                                "Unable to process the image."
                            );

                            return;
                        }


                        /* ================================
                           UPDATE PROFILE IMAGE
                        ================================= */

                        if (profileImage) {

                            profileImage.src =
                                imageData;
                        }


                        /* ================================
                           SAVE IMAGE
                        ================================= */

                        const saved =
                            setStorage(
                                "finriseProfileImage",
                                imageData
                            );


                        if (!saved) {

                            alert(
                                "Unable to save the image. The image may be too large."
                            );

                            return;
                        }


                        /* ================================
                           UPDATE NAVBAR IMAGE
                        ================================= */

                        const navbarImage =
                            document.getElementById(
                                "profileImage"
                            );


                        if (navbarImage) {

                            navbarImage.src =
                                imageData;
                        }
                    };


                reader.onerror =
                    () => {

                        alert(
                            "Unable to read the selected image."
                        );
                    };


                reader.readAsDataURL(file);
            }
        );
    }


    /* =====================================================
       CHANGE PASSWORD
    ===================================================== */

    if (changePasswordBtn) {

        changePasswordBtn.addEventListener(
            "click",
            () => {

                /*
                 * IMPORTANT:
                 *
                 * Password changes should NOT be handled
                 * using localStorage in a real application.
                 *
                 * The PHP/MySQL backend should:
                 *
                 * 1. Verify the current password.
                 * 2. Validate the new password.
                 * 3. Hash the new password.
                 * 4. Update the database.
                 * 5. Return success/failure.
                 */


                alert(
                    "Password changes will be handled securely through the backend."
                );
            }
        );
    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    loadProfile();

    setEditMode(false);

});