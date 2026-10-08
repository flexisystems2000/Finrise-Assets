/* =========================================================
   FINRISE ASSET
   REAL SUPABASE TRANSACTIONS / LEDGER
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    const section = document.getElementById("transactions");
    if (!section) return;

    const body = document.getElementById("transactionsBody");
    const empty = document.getElementById("transactionsEmpty");
    const search = document.getElementById("transactionSearch");
    const filter = document.getElementById("transactionFilter");
    const refresh = document.getElementById("refreshTransactions");

    let ledger = [];
    let deposits = [];
    let withdrawals = [];

    const money = (value, currency = "NGN") => {
        try {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: currency || "NGN",
                minimumFractionDigits: 2
            }).format(Number(value) || 0);
        } catch {
            return `${currency || "NGN"} ${(Number(value) || 0).toFixed(2)}`;
        }
    };

    const escape = value => String(value ?? "").replace(
        /[&<>"']/g,
        char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[char])
    );

    const normalize = value => String(value || "").trim().toLowerCase();

    function getType(item) {
        const raw = normalize(item.entry_type || item.type || item.transaction_type);

        if (raw.includes("deposit")) return "deposit";
        if (raw.includes("withdraw")) return "withdrawal";
        if (raw.includes("invest") || raw.includes("maturity")) return "investment";
        if (raw.includes("referral")) return "referral";

        return raw || "transaction";
    }

    function buildRows() {
        const rows = (ledger || []).map(item => ({
            source: "ledger",
            id: item.id,
            type: getType(item),
            referenceType: item.reference_type || "-",
            referenceId: item.reference_id || "-",
            amount: Number(item.amount) || 0,
            currency: item.currency || "NGN",
            createdAt: item.created_at,
            status: item.status || "completed"
        }));

        // Add pending financial requests if the ledger has not recorded them yet.
        const existingReferences = new Set(
            rows.map(row => `${row.type}:${row.referenceId}`)
        );

        (deposits || []).forEach(item => {
            const key = `deposit:${item.id}`;
            if (!existingReferences.has(key) && normalize(item.status) === "pending") {
                rows.push({
                    source: "deposit",
                    id: item.id,
                    type: "deposit",
                    referenceType: "deposit",
                    referenceId: item.id,
                    amount: Number(item.amount) || 0,
                    currency: item.currency || "NGN",
                    createdAt: item.created_at,
                    status: "pending"
                });
            }
        });

        (withdrawals || []).forEach(item => {
            const key = `withdrawal:${item.id}`;
            if (!existingReferences.has(key) && normalize(item.status) === "pending") {
                rows.push({
                    source: "withdrawal",
                    id: item.id,
                    type: "withdrawal",
                    referenceType: "withdrawal",
                    referenceId: item.id,
                    amount: Number(item.amount) || 0,
                    currency: item.currency || "NGN",
                    createdAt: item.created_at,
                    status: "pending"
                });
            }
        });

        return rows.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    function render() {
        const allRows = buildRows();
        const query = normalize(search?.value);
        const type = normalize(filter?.value || "all");

        const rows = allRows.filter(item => {
            const haystack = [
                item.type,
                item.referenceType,
                item.referenceId,
                item.status
            ].join(" ").toLowerCase();

            const matchesSearch = !query || haystack.includes(query);
            const matchesType = type === "all" || type === item.type;

            return matchesSearch && matchesType;
        });

        const pendingCount =
            deposits.filter(x => normalize(x.status) === "pending").length +
            withdrawals.filter(x => normalize(x.status) === "pending").length;

        const depositCount = allRows.filter(x => x.type === "deposit").length;
        const withdrawalCount = allRows.filter(x => x.type === "withdrawal").length;

        document.getElementById("totalTransactions")
            ?.replaceChildren(document.createTextNode(String(allRows.length)));

        document.getElementById("transactionDeposits")
            ?.replaceChildren(document.createTextNode(String(depositCount)));

        document.getElementById("transactionWithdrawals")
            ?.replaceChildren(document.createTextNode(String(withdrawalCount)));

        document.getElementById("pendingTransactions")
            ?.replaceChildren(document.createTextNode(String(pendingCount)));

        if (!rows.length) {
            if (body) body.innerHTML = "";
            if (empty) empty.style.display = "block";
            return;
        }

        if (empty) empty.style.display = "none";

        if (body) {
            body.innerHTML = rows.map(item => {
                const date = item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : "-";

                return `
                    <tr>
                        <td>${escape(item.type)}</td>
                        <td>${escape(item.referenceType)}</td>
                        <td>${escape(item.referenceId)}</td>
                        <td>${money(item.amount, item.currency)}</td>
                        <td>${escape(item.status)}</td>
                        <td>${escape(date)}</td>
                    </tr>
                `;
            }).join("");
        }
    }

    async function load() {
        if (body) {
            body.innerHTML = '<tr><td colspan="6">Loading transactions...</td></tr>';
        }

        try {
            const [ledgerResult, depositResult, withdrawalResult] = await Promise.all([
                getUserLedger(),
                getUserDeposits(),
                getUserWithdrawals()
            ]);

            if (ledgerResult.error) throw ledgerResult.error;
            if (depositResult.error) console.warn("Deposit history:", depositResult.error);
            if (withdrawalResult.error) console.warn("Withdrawal history:", withdrawalResult.error);

            ledger = ledgerResult.ledger || [];
            deposits = depositResult.deposits || [];
            withdrawals = withdrawalResult.withdrawals || [];

            render();
        } catch (error) {
            console.error("Transaction load failed:", error);

            if (body) {
                body.innerHTML =
                    '<tr><td colspan="6">Unable to load transactions. Please try again.</td></tr>';
            }
        }
    }

    search?.addEventListener("input", render);
    filter?.addEventListener("change", render);
    refresh?.addEventListener("click", load);

    document.addEventListener("finrise:refresh-dashboard", load);

    try {
        await getSupabase();
        await load();
    } catch (error) {
        console.error("Transaction initialization failed:", error);
    }
});
