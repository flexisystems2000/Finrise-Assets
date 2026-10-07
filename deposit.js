/* =========================================================
   FINRISE ASSET
   REAL SUPABASE DEPOSIT FLOW
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    const section = document.getElementById("deposit");
    const PAYMENT_CONFIG = {
        crypto: { configured: false, address: "" },
        usdt: { configured: false, address: "", network: "" },
        bank: { configured: false, bankName: "", accountName: "", accountNumber: "" }
    };
    if (!section) return;

    const amountInput = document.getElementById("depositAmount");
    const depositBtn = document.getElementById("depositBtn");
    const balanceEl = document.getElementById("depositBalance");
    const historyEl = document.getElementById("depositHistory");
    const networkEl = document.getElementById("depositNetwork");
    const methods = [...section.querySelectorAll(".deposit-method")];
    let selectedMethod = methods.find(x => x.classList.contains("active"))?.dataset.method || "crypto";

    const money = value => new Intl.NumberFormat("en-US", {
        style: "currency", currency: "NGN", minimumFractionDigits: 2
    }).format(Number(value) || 0);

    const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));

    function applyPaymentConfig() {
        const wallet = document.getElementById("walletAddress");
        const bankName = document.getElementById("bankName");
        const bankAccountName = document.getElementById("bankAccountName");
        const bankAccountNumber = document.getElementById("bankAccountNumber");
        if (wallet) wallet.value = PAYMENT_CONFIG.crypto.address || "Payment address not configured";
        if (bankName) bankName.textContent = PAYMENT_CONFIG.bank.bankName || "Bank payment details not configured";
        if (bankAccountName) bankAccountName.textContent = PAYMENT_CONFIG.bank.accountName || "Not configured";
        if (bankAccountNumber) bankAccountNumber.textContent = PAYMENT_CONFIG.bank.accountNumber || "Not configured";
    }

    function selectMethod(method) {
        selectedMethod = method;
        methods.forEach(button => button.classList.toggle("active", button.dataset.method === method));
        document.getElementById("cryptoPayment")?.classList.toggle("active", method === "crypto" || method === "usdt");
        document.getElementById("networkPayment")?.classList.toggle("active", method === "usdt");
        document.getElementById("bankPayment")?.classList.toggle("active", method === "bank");
    }

    methods.forEach(button => button.addEventListener("click", () => selectMethod(button.dataset.method || "crypto")));

    async function load() {
        const [{ wallet }, { deposits }] = await Promise.all([getCurrentWallet(), getUserDeposits()]);
        if (balanceEl) balanceEl.textContent = money(wallet?.available_balance);
        if (!historyEl) return;

        if (!deposits?.length) {
            historyEl.innerHTML = '<div class="empty-state">No deposits yet.</div>';
            return;
        }

        historyEl.innerHTML = deposits.map(item => `
            <div class="deposit-history-item">
                <div>
                    <strong>${escape(item.method || "Deposit")}</strong>
                    <small>${new Date(item.created_at).toLocaleString()}</small>
                </div>
                <div>
                    <strong>${money(item.amount)}</strong>
                    <small class="status-${escape(item.status)}">${escape(item.status)}</small>
                </div>
            </div>
        `).join("");
    }

    depositBtn?.addEventListener("click", async () => {
        const amount = Number(amountInput?.value);
        if (!Number.isFinite(amount) || amount < 50) {
            alert("Minimum deposit is ₦50.");
            return;
        }

        if (!PAYMENT_CONFIG[selectedMethod]?.configured) {
            alert("This deposit method is not configured yet. No payment address or bank account has been published, so do not send funds to any unofficial address.");
            return;
        }

        const oldText = depositBtn.textContent;
        depositBtn.disabled = true;
        depositBtn.textContent = "Submitting...";

        try {
            const reference = `DEP-${Date.now()}`;
            const { error } = await submitDeposit({
                amount,
                currency: "NGN",
                method: selectedMethod,
                network: networkEl?.value || null,
                reference
            });
            if (error) throw error;

            alert("Deposit submitted successfully. It will remain pending until an administrator approves it.");
            if (amountInput) amountInput.value = "";
            await load();
            document.dispatchEvent(new Event("finrise:refresh-dashboard"));
        } catch (error) {
            console.error("Deposit submission failed:", error);
            alert(error.message || "Unable to submit deposit.");
        } finally {
            depositBtn.disabled = false;
            depositBtn.textContent = oldText;
        }
    });

    document.getElementById("copyWallet")?.addEventListener("click", async () => {
        const input = document.getElementById("walletAddress");
        if (!input) return;
        try {
            await navigator.clipboard.writeText(input.value);
            alert("Wallet address copied.");
        } catch { input.select(); document.execCommand("copy"); }
    });

    try {
        await getSupabase();
        applyPaymentConfig();
        selectMethod(selectedMethod);
        await load();
    } catch (error) {
        console.error(error);
    }
});
