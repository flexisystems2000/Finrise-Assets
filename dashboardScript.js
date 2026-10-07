/* =========================================================
   FINRISE ASSET
   DASHBOARD / SESSION / NAVIGATION
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    const sections = [...document.querySelectorAll(".page-section")];
    const navItems = [...document.querySelectorAll(".sidebar .nav-item[data-page]")];
    const sidebar = document.querySelector(".sidebar");
    const menuButton = document.querySelector(".menu-btn");
    const logoutButton = document.getElementById("logout");
    const clock = document.getElementById("clock");

    function showPage(pageName) {
        const target = document.getElementById(pageName);
        if (!target) return;

        sections.forEach(section => section.classList.toggle("active", section === target));
        navItems.forEach(item => item.classList.toggle("active", item.dataset.page === pageName));

        document.dispatchEvent(new CustomEvent("finrise:pagechange", { detail: { page: pageName } }));
    }

    window.showPage = showPage;

    navItems.forEach(item => item.addEventListener("click", () => showPage(item.dataset.page)));

    menuButton?.addEventListener("click", () => sidebar?.classList.toggle("active"));

    function updateClock() {
        if (!clock) return;
        clock.textContent = new Date().toLocaleString([], {
            weekday: "short",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }
    updateClock();
    setInterval(updateClock, 1000);

    function money(value) {
        const n = Number(value) || 0;
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(n);
    }

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    async function loadDashboard() {
        const { user, error: userError } = await getCurrentUser();
        if (userError || !user) {
            window.location.href = "logIn_Page.html";
            return;
        }

        const [{ profile }, { wallet }, { deposits }, { ledger }, { rewards }] = await Promise.all([
            getCurrentProfile(),
            getCurrentWallet(),
            getUserDeposits(),
            getUserLedger(),
            getUserReferralRewards()
        ]);

        const approvedDeposits = (deposits || [])
            .filter(item => item.status === "approved")
            .reduce((sum, item) => sum + Number(item.amount || 0), 0);

        const earnings = (ledger || [])
            .filter(item => ["investment_return", "referral_bonus"].includes(item.entry_type))
            .reduce((sum, item) => sum + Math.max(0, Number(item.amount || 0)), 0);

        const referralBonus = (rewards || [])
            .filter(item => ["approved", "paid"].includes(item.status))
            .reduce((sum, item) => sum + Number(item.amount || 0), 0);

        setText("balance", money(wallet?.available_balance));
        setText("totalDeposit", money(approvedDeposits));
        setText("totalEarning", money(earnings));
        setText("referralBonus", money(referralBonus));
        setText("depositBalance", money(wallet?.available_balance));
        setText("withdrawBalance", money(wallet?.available_balance));
        setText("tradingBalance", money(wallet?.available_balance));
        setText("orderBalance", money(wallet?.available_balance));

        const name = profile?.full_name || user.user_metadata?.full_name || "User";
        setText("userName", name);
        setText("userEmail", user.email || "");
        setText("welcome", `Welcome, ${name}`);

        const image = document.getElementById("profileImage");
        if (image && !image.getAttribute("src")) image.src = "https://i.pravatar.cc/150?img=12";

        document.dispatchEvent(new CustomEvent("finrise:datarefresh", {
            detail: { user, profile, wallet, deposits, ledger, rewards }
        }));
    }

    try {
        await getSupabase();
        await loadDashboard();
    } catch (error) {
        console.error("Dashboard initialization failed:", error);
        alert("Unable to load your account. Please refresh and try again.");
    }

    logoutButton?.addEventListener("click", window.logoutUser || (async () => {
        await signOut();
        window.location.href = "logIn_Page.html";
    }));

    document.addEventListener("finrise:refresh-dashboard", loadDashboard);
});
