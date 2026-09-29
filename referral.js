/* =========================================================
   FINRISE ASSET
   REFERRAL SYSTEM
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       REFERRAL SECTION CHECK
    ===================================================== */

    const referralSection =
        document.getElementById("referral");

    if (!referralSection) return;


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const referralBalance =
        document.getElementById(
            "referralBalance"
        );

    const totalReferrals =
        document.getElementById(
            "totalReferrals"
        );

    const activeReferrals =
        document.getElementById(
            "activeReferrals"
        );

    const referralEarnings =
        document.getElementById(
            "referralEarnings"
        );

    const referralLink =
        document.getElementById(
            "referralLink"
        );

    const referralCodeElement =
        document.getElementById(
            "referralCode"
        );

    const copyBtn =
        document.getElementById(
            "copyReferralBtn"
        );

    const tableBody =
        document.getElementById(
            "referralTableBody"
        );

    const emptyReferral =
        document.getElementById(
            "emptyReferral"
        );

    const countLabel =
        document.getElementById(
            "referralCountLabel"
        );


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

    }


    if (!user) {

        console.warn(
            "No logged-in user found."
        );

        return;

    }


    /* =====================================================
       FORMAT MONEY
    ===================================================== */

    function formatMoney(value) {

        const number =
            Number(value);

        if (
            !Number.isFinite(number)
        ) {

            return "$0.00";

        }

        return new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ).format(number);

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       STORAGE HELPERS
    ===================================================== */

    function getStorageArray(key) {

        try {

            const saved =
                localStorage.getItem(key);

            if (!saved) {

                return [];

            }

            const parsed =
                JSON.parse(saved);

            return Array.isArray(parsed)
                ? parsed
                : [];

        } catch (error) {

            console.error(
                `Unable to read ${key}:`,
                error
            );

            return [];

        }

    }


    function saveStorageArray(
        key,
        data
    ) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(data)
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
       GENERATE REFERRAL CODE
    ===================================================== */

    function generateReferralCode() {

        let code =
            localStorage.getItem(
                "finriseReferralCode"
            );


        if (code) {

            return code;

        }


        const fullName =
            String(
                user.fullname ||
                "USER"
            );


        const name =
            fullName
                .replace(/[^a-zA-Z0-9]/g, "")
                .substring(0, 5)
                .toUpperCase() ||
            "USER";


        const random =
            Math.floor(
                1000 +
                Math.random() *
                9000
            );


        code =
            name +
            random;


        localStorage.setItem(
            "finriseReferralCode",
            code
        );


        return code;

    }


    /* =====================================================
       GENERATE REFERRAL LINK
    ===================================================== */

    function generateReferralLink() {

        const code =
            generateReferralCode();


        /*
         * If register.html is in the same folder
         * as your dashboard, this is the safest
         * way to generate the link.
         */

        const baseURL =
            window.location.origin +
            window.location.pathname
                .substring(
                    0,
                    window.location.pathname.lastIndexOf("/")
                    + 1
                );


        return (
            baseURL +
            "register.html?ref=" +
            encodeURIComponent(code)
        );

    }


    /* =====================================================
       GET REFERRALS
    ===================================================== */

    function getReferrals() {

        return getStorageArray(
            "finriseReferrals"
        );

    }


    /* =====================================================
       SAVE REFERRALS
    ===================================================== */

    function saveReferrals(
        referrals
    ) {

        return saveStorageArray(
            "finriseReferrals",
            referrals
        );

    }


    /* =====================================================
       CALCULATE TOTAL EARNINGS
    ===================================================== */

    function calculateReferralEarnings(
        referrals
    ) {

        return referrals.reduce(
            (
                total,
                referral
            ) => {

                const earnings =
                    Number(
                        referral.earnings
                    ) || 0;


                return (
                    total +
                    earnings
                );

            },
            0
        );

    }


    /* =====================================================
       UPDATE STATS
    ===================================================== */

    function updateStats() {

        const referrals =
            getReferrals();


        const active =
            referrals.filter(
                referral => {

                    return String(
                        referral.status ||
                        ""
                    ).toLowerCase() ===
                    "active";

                }
            ).length;


        const earnings =
            calculateReferralEarnings(
                referrals
            );


        if (referralBalance) {

            referralBalance.textContent =
                formatMoney(
                    earnings
                );

        }


        if (referralEarnings) {

            referralEarnings.textContent =
                formatMoney(
                    earnings
                );

        }


        if (totalReferrals) {

            totalReferrals.textContent =
                referrals.length;

        }


        if (activeReferrals) {

            activeReferrals.textContent =
                active;

        }


        if (countLabel) {

            countLabel.textContent =
                `${referrals.length} Referral${
                    referrals.length === 1
                        ? ""
                        : "s"
                }`;

        }

    }


    /* =====================================================
       RENDER REFERRALS
    ===================================================== */

    function renderReferrals() {

        if (!tableBody) return;


        const referrals =
            getReferrals();


        tableBody.innerHTML =
            "";


        /* -------------------------------------------------
           EMPTY
        ------------------------------------------------- */

        if (
            referrals.length === 0
        ) {

            if (emptyReferral) {

                emptyReferral.style.display =
                    "block";

            }

            return;

        }


        if (emptyReferral) {

            emptyReferral.style.display =
                "none";

        }


        /* -------------------------------------------------
           RENDER
        ------------------------------------------------- */

        referrals.forEach(
            referral => {

                const row =
                    document.createElement(
                        "tr"
                    );


                const name =
                    escapeHTML(
                        referral.name ||
                        "Finrise User"
                    );


                const date =
                    escapeHTML(
                        referral.date ||
                        "--"
                    );


                const status =
                    String(
                        referral.status ||
                        "Pending"
                    );


                const earnings =
                    Number(
                        referral.earnings
                    ) || 0;


                const statusClass =
                    status
                        .toLowerCase()
                        .replace(
                            /\s+/g,
                            "-"
                        );


                row.innerHTML = `

                    <td>

                        <div class="referral-user">

                            <div class="referral-avatar">

                                <i class="bi bi-person-fill"></i>

                            </div>

                            <span>
                                ${name}
                            </span>

                        </div>

                    </td>


                    <td>

                        ${date}

                    </td>


                    <td>

                        <span
                            class="
                                referral-status
                                ${escapeHTML(
                                    statusClass
                                )}
                            "
                        >

                            ${escapeHTML(
                                status
                            )}

                        </span>

                    </td>


                    <td class="referral-earning">

                        ${formatMoney(
                            earnings
                        )}

                    </td>

                `;


                tableBody.appendChild(
                    row
                );

            }
        );

    }


    /* =====================================================
       COPY REFERRAL LINK
    ===================================================== */

    if (copyBtn) {

        copyBtn.addEventListener(
            "click",
            async () => {

                if (
                    !referralLink ||
                    !referralLink.value
                ) {

                    alert(
                        "Referral link is unavailable."
                    );

                    return;

                }


                const link =
                    referralLink.value;


                try {

                    if (
                        navigator.clipboard &&
                        window.isSecureContext
                    ) {

                        await navigator.clipboard
                            .writeText(link);

                    } else {

                        referralLink.focus();

                        referralLink.select();

                        referralLink.setSelectionRange(
                            0,
                            referralLink.value.length
                        );

                        document.execCommand(
                            "copy"
                        );

                    }


                    copyBtn.innerHTML =
                        `<i class="bi bi-check-lg"></i> Copied`;


                    setTimeout(
                        () => {

                            copyBtn.innerHTML =
                                `<i class="bi bi-copy"></i> Copy`;

                        },
                        2000
                    );

                } catch (error) {

                    console.error(
                        "Unable to copy referral link:",
                        error
                    );


                    alert(
                        "Unable to copy the referral link. Please copy it manually."
                    );

                }

            }
        );

    }


    /* =====================================================
       SHARE REFERRAL
    ===================================================== */

    function shareReferral(
        platform
    ) {

        if (!referralLink) {

            return;

        }


        const link =
            referralLink.value;


        if (!link) {

            return;

        }


        const message =
            `Join me on Finrise Asset and start your journey today: ${link}`;


        let url = "";


        /* -------------------------------------------------
           WHATSAPP
        ------------------------------------------------- */

        if (
            platform === "whatsapp"
        ) {

            url =
                "https://wa.me/?text=" +
                encodeURIComponent(
                    message
                );

        }


        /* -------------------------------------------------
           TELEGRAM
        ------------------------------------------------- */

        else if (
            platform === "telegram"
        ) {

            url =
                "https://t.me/share/url?url=" +
                encodeURIComponent(
                    link
                ) +
                "&text=" +
                encodeURIComponent(
                    "Join me on Finrise Asset."
                );

        }


        /* -------------------------------------------------
           FACEBOOK
        ------------------------------------------------- */

        else if (
            platform === "facebook"
        ) {

            url =
                "https://www.facebook.com/sharer/sharer.php?u=" +
                encodeURIComponent(
                    link
                );

        }


        /* -------------------------------------------------
           TWITTER / X
        ------------------------------------------------- */

        else if (
            platform === "twitter"
        ) {

            url =
                "https://twitter.com/intent/tweet?text=" +
                encodeURIComponent(
                    message
                );

        }


        /* -------------------------------------------------
           OPEN SHARE WINDOW
        ------------------------------------------------- */

        if (url) {

            window.open(
                url,
                "_blank",
                "width=600,height=500"
            );

        }

    }


    /* =====================================================
       SHARE BUTTONS
    ===================================================== */

    const shareWhatsApp =
        document.getElementById(
            "shareWhatsApp"
        );


    const shareTelegram =
        document.getElementById(
            "shareTelegram"
        );


    const shareFacebook =
        document.getElementById(
            "shareFacebook"
        );


    const shareTwitter =
        document.getElementById(
            "shareTwitter"
        );


    if (shareWhatsApp) {

        shareWhatsApp.addEventListener(
            "click",
            () => {

                shareReferral(
                    "whatsapp"
                );

            }
        );

    }


    if (shareTelegram) {

        shareTelegram.addEventListener(
            "click",
            () => {

                shareReferral(
                    "telegram"
                );

            }
        );

    }


    if (shareFacebook) {

        shareFacebook.addEventListener(
            "click",
            () => {

                shareReferral(
                    "facebook"
                );

            }
        );

    }


    if (shareTwitter) {

        shareTwitter.addEventListener(
            "click",
            () => {

                shareReferral(
                    "twitter"
                );

            }
        );

    }


    /* =====================================================
       INITIALIZE REFERRAL CODE
    ===================================================== */

    const code =
        generateReferralCode();


    if (referralCodeElement) {

        referralCodeElement.textContent =
            code;

    }


    /* =====================================================
       INITIALIZE REFERRAL LINK
    ===================================================== */

    if (referralLink) {

        referralLink.value =
            generateReferralLink();

    }


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    updateStats();

    renderReferrals();

});