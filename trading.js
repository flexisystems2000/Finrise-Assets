/* =========================================================
   FINRISE ASSET
   TRADING / INVESTMENT DISPLAY

   There is no trading/order table or RPC in the existing
   Supabase backend. Therefore this file NEVER stores trades
   or money in localStorage. Investment actions use the real
   create_investment RPC when a matching database plan exists.
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    const section = document.getElementById("trading");
    if (!section) return;

    const tradingBalance = document.getElementById("tradingBalance");
    const orderBalance = document.getElementById("orderBalance");
    const placeTradeBtn = document.getElementById("placeTradeBtn");
    const tradeAmount = document.getElementById("tradeAmount");
    const estimatedQuantity = document.getElementById("estimatedQuantity");
    const investmentsBody = document.getElementById("investmentsBody");
    const noInvestments = document.getElementById("noInvestments");
    const assetButtons = [...section.querySelectorAll(".asset-btn")];
    const orderTabs = [...section.querySelectorAll(".order-tab")];
    const marketPrice = document.getElementById("marketPrice");
    const chartAsset = document.getElementById("chartAsset");
    const orderAsset = document.getElementById("orderAsset");
    const orderPrice = document.getElementById("orderPrice");
    const orderAssetIcon = document.getElementById("orderAssetIcon");

    let selectedAsset = {
        symbol: "BINANCE:BTCUSDT",
        name: "BTC/USDT",
        price: 65000
    };
    let orderType = "buy";
    let balance = 0;

    const money = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "NGN", minimumFractionDigits: 2 }).format(Number(value) || 0);
    const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));

    async function loadBalance() {
        const { wallet } = await getCurrentWallet();
        balance = Number(wallet?.available_balance || 0);
        if (tradingBalance) tradingBalance.textContent = money(balance);
        if (orderBalance) orderBalance.textContent = money(balance);
    }

    function updateQuantity() {
        const amount = Number(tradeAmount?.value) || 0;
        if (estimatedQuantity) estimatedQuantity.textContent = amount > 0 && selectedAsset.price > 0 ? (amount / selectedAsset.price).toFixed(6) : "0.000000";
    }

    function updateAsset(button) {
        const price = Number(button.dataset.price);
        selectedAsset = {
            symbol: button.dataset.symbol || "BINANCE:BTCUSDT",
            name: button.dataset.name || "BTC/USDT",
            price: Number.isFinite(price) && price > 0 ? price : 0
        };
        assetButtons.forEach(item => item.classList.toggle("active", item === button));
        if (marketPrice) marketPrice.textContent = money(selectedAsset.price);
        if (chartAsset) chartAsset.textContent = selectedAsset.name;
        if (orderAsset) orderAsset.textContent = selectedAsset.name;
        if (orderPrice) orderPrice.textContent = money(selectedAsset.price);
        if (orderAssetIcon) orderAssetIcon.textContent = selectedAsset.name.split("/")[0].slice(0, 1).toUpperCase();
        updateQuantity();
    }

    assetButtons.forEach(button => button.addEventListener("click", () => updateAsset(button)));
    orderTabs.forEach(tab => tab.addEventListener("click", () => {
        orderTabs.forEach(item => item.classList.remove("active"));
        tab.classList.add("active");
        orderType = tab.dataset.order === "sell" ? "sell" : "buy";
    }));
    tradeAmount?.addEventListener("input", updateQuantity);

    placeTradeBtn?.addEventListener("click", () => {
        alert("Trading orders are not enabled yet because the current Supabase backend has no trading/order table or RPC. Your balance is not changed and no fake trade is stored.");
    });

    async function loadInvestments() {
        const { investments, error } = await getUserInvestments();
        if (error) {
            console.error(error);
            return;
        }
        if (!investmentsBody) return;
        if (!investments?.length) {
            investmentsBody.innerHTML = "";
            if (noInvestments) noInvestments.style.display = "block";
            return;
        }
        if (noInvestments) noInvestments.style.display = "none";
        investmentsBody.innerHTML = investments.map(item => `
            <tr>
                <td>${escape(item.investment_plans?.name || item.plan_id)}</td>
                <td>${money(item.principal)}</td>
                <td>${money(item.expected_return)}</td>
                <td>${escape(item.status)}</td>
                <td>${item.matures_at ? new Date(item.matures_at).toLocaleDateString() : "-"}</td>
                <td>${item.started_at ? new Date(item.started_at).toLocaleDateString() : "-"}</td>
            </tr>
        `).join("");
    }

    async function handleInvestment(button) {
        const planName = button.dataset.plan || "";
        const minimum = Number(button.dataset.min || 0);
        const amountText = window.FinriseNotify
            ? await window.FinriseNotify.prompt({
                title: `Invest in ${planName}`,
                message: `Enter the amount to invest. Minimum: ${money(minimum)}`,
                defaultValue: "",
                confirmText: "Continue",
                cancelText: "Cancel"
            })
            : window.prompt(`Enter amount for ${planName}.\\nMinimum: ${money(minimum)}`);
        if (amountText === null) return;
        const amount = Number(amountText);
        if (!Number.isFinite(amount) || amount < minimum) return alert(`Minimum investment is ${money(minimum)}.`);
        if (amount > balance) return alert("Insufficient available balance.");

        const { plans, error } = await getInvestmentPlans();
        if (error) return alert(error.message || "Unable to load investment plans.");
        const plan = (plans || []).find(item => String(item.name).toLowerCase() === planName.toLowerCase());
        if (!plan) return alert("This investment plan is not currently available in the Supabase investment_plans table.");

        const old = button.textContent;
        button.disabled = true;
        button.textContent = "Processing...";
        try {
            const result = await createInvestmentRequest({ plan_id: plan.id, amount });
            if (result.error) throw result.error;
            alert("Investment created successfully.");
            await Promise.all([loadBalance(), loadInvestments()]);
            document.dispatchEvent(new Event("finrise:refresh-dashboard"));
        } catch (error) {
            console.error(error);
            alert(error.message || "Unable to create investment.");
        } finally {
            button.disabled = false;
            button.textContent = old;
        }
    }

    section.querySelectorAll(".invest-btn").forEach(button => button.addEventListener("click", () => handleInvestment(button)));

    document.addEventListener("finrise:refresh-dashboard", async () => {
        await loadBalance();
        await loadInvestments();
    });

    try {
        await getSupabase();
        updateAsset(assetButtons[0] || { dataset: {} });
        await loadBalance();
        await loadInvestments();
    } catch (error) {
        console.error(error);
    }
});
