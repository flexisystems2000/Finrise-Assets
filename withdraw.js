/* =========================================================
   FINRISE ASSET
   SUPABASE WITHDRAWAL FLOW
   Frontend rules mirror the hardened database function.
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

    const MIN_WITHDRAWAL = 20;
    const WITHDRAWAL_FEE = 5;
    const CURRENCY = "NGN";

    let selectedMethod =
        methods.find(x => x.classList.contains("active"))?.dataset.method || "crypto";
    let pendingRequest = null;
    let balance = 0;

    const money = value => new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: CURRENCY,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(value) || 0);

    const escape = value => String(value ?? "").replace(
        /[&<>"']/g,
        c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c])
    );

    function updateCalculation() {
        const amount = Number(amountInput?.value) || 0;
        if (feeEl) feeEl.textContent = money(WITHDRAWAL_FEE);
        if (receiveEl) {
            receiveEl.textContent = money(Math.max(0, amount - WITHDRAWAL_FEE));
        }
    }

    function updateNetworkOptions(method) {
        if (!network) return;

        const allowed = method === "usdt"
            ? ["TRC20", "ERC20", "BEP20"]
            : method === "crypto"
                ? ["BTC", "ETH"]
                : [];

        [...network.options].forEach(option => {
            if (!option.value) {
                option.hidden = false;
                option.disabled = false;
                return;
            }
            option.hidden = !allowed.includes(option.value);
            option.disabled = !allowed.includes(option.value);
        });

        if (!allowed.includes(network.value)) network.value = "";
        network.required = allowed.length > 0;
    }

    function selectMethod(method) {
        selectedMethod = ["crypto", "usdt", "bank"].includes(method) ? method : "crypto";

        methods.forEach(item =>
            item.classList.toggle("active", item.dataset.method === selectedMethod)
        );

        const needsNetwork = selectedMethod !== "bank";
        if (networkGroup) networkGroup.style.display = needsNetwork ? "block" : "none";

        const label = document.getElementById("destinationLabel");
        const help = document.getElementById("destinationHelp");

        if (label) {
            label.textContent =
                selectedMethod === "bank" ? "Bank Account Destination" : "Wallet Address";
        }

        if (destination) {
            destination.placeholder =
                selectedMethod === "bank"
                    ? "Enter bank account destination"
                    : "Enter wallet address";
        }

        if (help) {
            help.textContent =
                selectedMethod === "bank"
                    ? "Enter the bank destination exactly as required for processing."
                    : "Make sure the wallet address matches the selected network.";
        }

        updateNetworkOptions(selectedMethod);
    }

    async function load() {
        const [{ wallet, error: walletError }, { withdrawals, error: withdrawalError }] =
            await Promise.all([getCurrentWallet(), getUserWithdrawals()]);

        if (walletError) console.error("Wallet load error:", walletError);
        if (withdrawalError) console.error("Withdrawal history error:", withdrawalError);

        balance = Number(wallet?.available_balance || 0);
        if (balanceEl) balanceEl.textContent = money(balance);

        if (!historyList) return;

        if (!withdrawals?.length) {
            historyList.innerHTML = '<div class="empty-state">No withdrawals yet.</div>';
            return;
        }

        historyList.innerHTML = withdrawals.map(item => {
            const amount = Number(item.amount || 0);
            const itemFee = Number(item.fee ?? WITHDRAWAL_FEE);
            const net = Number(item.net_amount ?? (amount - itemFee));

            return `
                <div class="withdraw-history-item">
                    <div>
                        <strong>${money(amount)}</strong>
                        <small>
                            ${escape(item.method || "withdrawal")}
                            · Fee ${money(itemFee)}
                            · Net ${money(net)}
                        </small>
                    </div>
                    <div>
                        <strong>${escape(item.status || "pending")}</strong>
                        <small>${item.created_at ? new Date(item.created_at).toLocaleString() : "-"}</small>
                    </div>
                </div>
            `;
        }).join("");
    }

    methods.forEach(item =>
        item.addEventListener("click", () => selectMethod(item.dataset.method || "crypto"))
    );

    amountInput?.addEventListener("input", updateCalculation);

    maxBtn?.addEventListener("click", () => {
        const max = Math.max(0, balance);
        if (max < MIN_WITHDRAWAL) {
            alert(`Your available balance is below the minimum withdrawal of ${money(MIN_WITHDRAWAL)}.`);
            return;
        }

        if (amountInput) amountInput.value = max.toFixed(2);
        updateCalculation();
    });

    function openModal() {
        const amount = Number(amountInput?.value);
        const dest = destination?.value.trim() || "";
        const selectedNetwork = network?.value || null;

        if (!Number.isFinite(amount) || amount < MIN_WITHDRAWAL) {
            alert(`Minimum withdrawal is ${money(MIN_WITHDRAWAL)}.`);
            return;
        }

        if (amount > balance) {
            alert("Insufficient available balance.");
            return;
        }

        if (amount <= WITHDRAWAL_FEE) {
            alert(`Withdrawal amount must be greater than the ${money(WITHDRAWAL_FEE)} fee.`);
            return;
        }

        if (!dest) {
            alert("Enter a withdrawal destination.");
            destination?.focus();
            return;
        }

        if (selectedMethod === "bank" && selectedNetwork) {
            network.value = "";
        }

        if (selectedMethod === "usdt" &&
            !["TRC20", "ERC20", "BEP20"].includes(selectedNetwork)) {
            alert("Select a valid USDT network: TRC20, ERC20 or BEP20.");
            network?.focus();
            return;
        }

        if (selectedMethod === "crypto" &&
            !["BTC", "ETH"].includes(selectedNetwork)) {
            alert("Select BTC or ETH as the crypto network.");
            network?.focus();
            return;
        }

        pendingRequest = {
            amount,
            destination: dest,
            method: selectedMethod,
            network: selectedMethod === "bank" ? null : selectedNetwork,
            fee: WITHDRAWAL_FEE,
            currency: CURRENCY
        };

        document.getElementById("confirmMethod")
            ?.replaceChildren(document.createTextNode(selectedMethod.toUpperCase()));
        document.getElementById("confirmAmount")
            ?.replaceChildren(document.createTextNode(money(amount)));
        document.getElementById("confirmFee")
            ?.replaceChildren(document.createTextNode(money(WITHDRAWAL_FEE)));
        document.getElementById("confirmReceive")
            ?.replaceChildren(document.createTextNode(money(amount - WITHDRAWAL_FEE)));

        modal?.classList.add("active");
    }

    function close() {
        modal?.classList.remove("active");
    }

    withdrawBtn?.addEventListener("click", openModal);
    cancelBtn?.addEventListener("click", close);
    closeModal?.addEventListener("click", close);

    confirmBtn?.addEventListener("click", async () => {
        if (!pendingRequest) return;

        const oldText = confirmBtn.textContent;
        confirmBtn.disabled = true;
        confirmBtn.textContent = "Processing...";

        try {
            const { error } = await createWithdrawalRequest(pendingRequest);
            if (error) throw error;

            close();
            pendingRequest = null;
            if (amountInput) amountInput.value = "";
            updateCalculation();

            alert(
                "Withdrawal request submitted successfully. " +
                "Your funds are locked until the request is processed."
            );

            await load();
            document.dispatchEvent(new Event("finrise:refresh-dashboard"));
        } catch (error) {
            console.error("Withdrawal failed:", error);

            const message = String(error?.message || "");
            if (/fee|minimum|currency|network|method|amount|balance/i.test(message)) {
                alert(message);
            } else {
                alert("Unable to create withdrawal request. Please verify your details and try again.");
            }
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
        console.error("Withdrawal initialization failed:", error);
        alert("Unable to load withdrawal information. Please refresh and try again.");
    }
});
