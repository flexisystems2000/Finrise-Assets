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

    /* =========================================================
       MOBILE SIDEBAR CONTROLS
    ========================================================= */

    let menuOverlay = document.querySelector(".sidebar-overlay");

    if (!menuOverlay) {
        menuOverlay = document.createElement("div");
        menuOverlay.className = "sidebar-overlay";
        document.body.appendChild(menuOverlay);
    }

    let sidebarCloseButton = sidebar?.querySelector(".sidebar-close-btn");

    if (sidebar && !sidebarCloseButton) {
        sidebarCloseButton = document.createElement("button");
        sidebarCloseButton.type = "button";
        sidebarCloseButton.className = "sidebar-close-btn";
        sidebarCloseButton.setAttribute("aria-label", "Close menu");
        sidebarCloseButton.innerHTML = '<i class="bi bi-x-lg"></i>';
        sidebar.insertBefore(sidebarCloseButton, sidebar.firstElementChild);
    }

    function closeMobileMenu() {
        sidebar?.classList.remove("active");
        menuOverlay?.classList.remove("active");

        if (menuButton) {
            menuButton.innerHTML = '<i class="bi bi-list"></i>';
            menuButton.setAttribute("aria-label", "Open menu");
        }
    }

    function openMobileMenu() {
        sidebar?.classList.add("active");
        menuOverlay?.classList.add("active");

        if (menuButton) {
            menuButton.innerHTML = '<i class="bi bi-x-lg"></i>';
            menuButton.setAttribute("aria-label", "Close menu");
        }
    }

    navItems.forEach(item => item.addEventListener("click", () => {
        showPage(item.dataset.page);
        closeMobileMenu();
    }));

    menuButton?.setAttribute("aria-label", "Open menu");
    menuButton?.addEventListener("click", () => {
        if (sidebar?.classList.contains("active")) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    sidebarCloseButton?.addEventListener("click", closeMobileMenu);
    menuOverlay?.addEventListener("click", closeMobileMenu);

    /* =========================================================
       NOTIFICATIONS
    ========================================================= */

    const notificationButton = document.querySelector(".notification");
    let notificationPanel = null;

    function closeNotifications() {
        notificationPanel?.classList.remove("active");
    }

    function ensureNotificationPanel() {
        if (notificationPanel) return notificationPanel;

        notificationPanel = document.createElement("div");
        notificationPanel.className = "notification-panel";
        notificationPanel.setAttribute("role", "dialog");
        notificationPanel.setAttribute("aria-label", "Notifications");
        notificationPanel.innerHTML = `
            <div class="notification-panel-header">
                <div>
                    <strong>Notifications</strong>
                    <small id="notificationSummary">Your latest account updates</small>
                </div>
                <button type="button" class="notification-close" aria-label="Close notifications">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
            <div class="notification-list" id="notificationList">
                <div class="notification-empty">
                    <i class="bi bi-bell-slash"></i>
                    <span>No new notifications</span>
                </div>
            </div>
        `;

        document.body.appendChild(notificationPanel);
        notificationPanel.querySelector(".notification-close")?.addEventListener("click", closeNotifications);

        return notificationPanel;
    }

    function renderNotifications(data = {}) {
        const panel = ensureNotificationPanel();
        const list = panel.querySelector("#notificationList");
        const summary = panel.querySelector("#notificationSummary");

        const deposits = data.deposits || [];
        const withdrawals = data.withdrawals || [];
        const investments = data.investments || [];
        const items = [];

        const pendingDeposits = deposits.filter(x => String(x.status || "").toLowerCase() === "pending");
        const pendingWithdrawals = withdrawals.filter(x => String(x.status || "").toLowerCase() === "pending");
        const activeInvestments = investments.filter(x => String(x.status || "").toLowerCase() === "active");
        const completedInvestments = investments.filter(x => String(x.status || "").toLowerCase() === "completed");

        if (pendingDeposits.length) {
            items.push({
                icon: "bi-hourglass-split",
                title: "Deposit pending",
                text: `${pendingDeposits.length} deposit request${pendingDeposits.length === 1 ? "" : "s"} awaiting review.`,
                type: "pending"
            });
        }

        if (pendingWithdrawals.length) {
            items.push({
                icon: "bi-clock-history",
                title: "Withdrawal pending",
                text: `${pendingWithdrawals.length} withdrawal request${pendingWithdrawals.length === 1 ? "" : "s"} awaiting processing.`,
                type: "pending"
            });
        }

        if (activeInvestments.length) {
            items.push({
                icon: "bi-graph-up-arrow",
                title: "Investment active",
                text: `${activeInvestments.length} active investment${activeInvestments.length === 1 ? "" : "s"} currently running.`,
                type: "active"
            });
        }

        if (completedInvestments.length) {
            items.push({
                icon: "bi-check-circle",
                title: "Investment completed",
                text: `${completedInvestments.length} completed investment${completedInvestments.length === 1 ? "" : "s"} with returns recorded.`,
                type: "success"
            });
        }

        summary.textContent = items.length
            ? `${items.length} account update${items.length === 1 ? "" : "s"}`
            : "You're all caught up";

        if (!items.length) {
            list.innerHTML = `
                <div class="notification-empty">
                    <i class="bi bi-bell-slash"></i>
                    <span>No new notifications</span>
                </div>
            `;
            return;
        }

        list.innerHTML = items.map(item => `
            <div class="notification-item ${item.type}">
                <div class="notification-item-icon"><i class="bi ${item.icon}"></i></div>
                <div>
                    <strong>${item.title}</strong>
                    <p>${item.text}</p>
                </div>
            </div>
        `).join("");
    }

    notificationButton?.setAttribute("role", "button");
    notificationButton?.setAttribute("tabindex", "0");
    notificationButton?.setAttribute("aria-label", "Open notifications");

    notificationButton?.addEventListener("click", event => {
        event.stopPropagation();
        ensureNotificationPanel().classList.toggle("active");
    });

    notificationButton?.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            notificationButton.click();
        }
    });

    document.addEventListener("click", event => {
        if (
            notificationPanel?.classList.contains("active") &&
            !notificationPanel.contains(event.target) &&
            !notificationButton?.contains(event.target)
        ) {
            closeNotifications();
        }
    });

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

        const [{ profile }, { wallet }, { deposits }, { withdrawals }, { investments }, { ledger }, { rewards }] = await Promise.all([
            getCurrentProfile(),
            getCurrentWallet(),
            getUserDeposits(),
            getUserWithdrawals(),
            getUserInvestments(),
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

        const avatarUrl = user?.user_metadata?.avatar_url || profile?.avatar_url || "";
        const fallbackAvatar = "https://i.pravatar.cc/150?img=12";
        ["profileImage", "profilePageImage"].forEach(id => {
            const image = document.getElementById(id);
            if (!image) return;
            image.onerror = () => {
                image.onerror = null;
                image.src = fallbackAvatar;
            };
            image.src = avatarUrl || fallbackAvatar;
        });

        renderNotifications({
            user,
            profile,
            wallet,
            deposits,
            withdrawals,
            investments,
            ledger,
            rewards
        });

        document.dispatchEvent(new CustomEvent("finrise:datarefresh", {
            detail: { user, profile, wallet, deposits, withdrawals, investments, ledger, rewards }
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
    document.addEventListener("finrise:avatar-updated", event => {
        const avatarUrl = event.detail?.avatarUrl;
        if (!avatarUrl) return;
        ["profileImage", "profilePageImage"].forEach(id => {
            const image = document.getElementById(id);
            if (image) image.src = avatarUrl;
        });
    });
});
