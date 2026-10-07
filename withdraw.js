/* =========================================================
   FINRISE ASSET
   REAL SUPABASE WITHDRAWAL FLOW
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    const section = document.getElementById("withdraw");
    if (!section) return;

    const amountInput = document.getElementById("amount");
    const feeEl = document.getElementById("fee");
    const receiveEl = document.getElementById("receive");
    const balanceEl = document.getElementById("withdrawBalance");
    const destination = document.getElementById("destination");
    const network = document.getElementById("network");
    const networkGroup = document.getElementById("networkGroup");
    const methods = [...section.querySelectorAll(".method")];
    const withdrawBtn = document.getElementById("withdrawBtn");
    const maxBtn = document.getElementById("maxBtn");
    const modal = document.getElementById("withdrawModal");
    const confirmBtn = document.getElementById("confirmBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const closeModal = document.getElementById("closeModal");
    const historyList = document.getElementById("historyList");

    const fee = 5;
    let selectedMethod = methods.find(x => x.classList.contains("active"))?.dataset.method || "crypto";
    let pendingRequest = null;
    let balance = 0;

    const money = value => new Intl.NumberFormat("en-US", {
        style: "currency", currency: "NGN", minimumFractionDigits: 2
    }).format(Number(value) || 0);

    const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));

    function updateCalculation() {
        const amount = Number(amountInput?.value) || 0;
        if (feeEl) feeEl.textContent = money(fee);
        if (receiveEl) receiveEl.textContent = money(Math.max(0, amount - fee));
    }

    function selectMethod(method) {
        selectedMethod = method;
        methods.forEach(item => item.classList.toggle("active", item.dataset.method === method));
        const crypto = method === "crypto" || method === "usdt";
        if (networkGroup) networkGroup.style.display = crypto ? "block" : "none";
        const label = document.getElementById("destinationLabel");
        const help = document.getElementById("destinationHelp");
        if (label) label.textContent = method === "bank" ? "Bank Account" : "Wallet Address";
        if (destination) destination.placeholder = method === "bank" ? "Account number / bank destination" : "Enter wallet address";
        if (help) help.textContent = method === "bank" ? "Enter your bank account destination." : "Enter the destination wallet address.";
    }

    async function load() {
        const [{ wallet }, { withdrawals }] = await Promise.all([getCurrentWallet(), getUserWithdrawals()]);
        balance = Number(wallet?.available_balance || 0);
        if (balanceEl) balanceEl.textContent = money(balance);
        if (!historyList) return;
        if (!withdrawals?.length) {
            historyList.innerHTML = '<div class="empty-state">No withdrawals yet.</div>';
            return;
        }
        historyList.innerHTML = withdrawals.map(item => `
            <div class="withdraw-history-item">
                <div><strong>${money(item.amount)}</strong><small>${escape(item.method)} · Fee ${money(item.fee || 0)} · Net ${money(item.net_amount ?? (Number(item.amount || 0) - Number(item.fee || 0)))}</small></div>
                <div><strong>${escape(item.status)}</strong><small>${new Date(item.created_at).toLocaleString()}</small></div>
            </div>
        `).join("");
    }

    methods.forEach(item => item.addEventListener("click", () => selectMethod(item.dataset.method || "crypto")));
    amountInput?.addEventListener("input", updateCalculation);
    maxBtn?.addEventListener("click", () => {
        const max = Math.max(0, balance - fee);
        if (amountInput) amountInput.value = max.toFixed(2);
        updateCalculation();
    });

    function openModal() {
        const amount = Number(amountInput?.value);
        const dest = destination?.value.trim();
        if (!Number.isFinite(amount) || amount < 20) return alert("Minimum withdrawal is ₦20.");
        if (amount > balance) return alert("Insufficient available balance.");
        if (!dest) return alert("Enter a withdrawal destination.");

        pendingRequest = { amount, destination: dest, method: selectedMethod, network: network?.value || null, fee };
        document.getElementById("confirmMethod")?.replaceChildren(document.createTextNode(selectedMethod));
        document.getElementById("confirmAmount")?.replaceChildren(document.createTextNode(money(amount)));
        document.getElementById("confirmFee")?.replaceChildren(document.createTextNode(money(fee)));
        document.getElementById("confirmReceive")?.replaceChildren(document.createTextNode(money(amount - fee)));
        if (modal) modal.classList.add("active");
    }

    function close() { if (modal) modal.classList.remove("active"); }
    withdrawBtn?.addEventListener("click", openModal);
    cancelBtn?.addEventListener("click", close);
    closeModal?.addEventListener("click", close);

    confirmBtn?.addEventListener("click", async () => {
        if (!pendingRequest) return;
        const oldText = confirmBtn.textContent;
        confirmBtn.disabled = true;
        confirmBtn.textContent = "Processing...";
        try {
            const { error } = await createWithdrawalRequest({
                ...pendingRequest,
                currency: "NGN"
            });
            if (error) throw error;
            close();
            pendingRequest = null;
            if (amountInput) amountInput.value = "";
            alert("Withdrawal request submitted successfully. Your funds are locked until the request is processed.");
            await load();
            document.dispatchEvent(new Event("finrise:refresh-dashboard"));
        } catch (error) {
            console.error("Withdrawal failed:", error);
            alert(error.message || "Unable to create withdrawal request.");
        } finally {
            confirmBtn.disabled = false;
            confirmBtn.textContent = oldText;
        }
    });

    try {
        await getSupabase();
        selectMethod(selectedMethod);
        updateCalculation();
        await load();
    } catch (error) {
        console.error(error);
    }
});
