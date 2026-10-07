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

    const money = value => new Intl.NumberFormat("en-US", {
        style: "currency", currency: "NGN", minimumFractionDigits: 2
    }).format(Number(value) || 0);

    const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));

    function render() {
        const q = (search?.value || "").trim().toLowerCase();
        const type = filter?.value || "all";
        const rows = ledger.filter(item => {
            const matchesSearch = !q || `${item.entry_type} ${item.reference_type} ${item.reference_id}`.toLowerCase().includes(q);
            const matchesType = type === "all" || item.entry_type === type;
            return matchesSearch && matchesType;
        });

        const deposits = ledger.filter(x => x.entry_type === "deposit").length;
        const withdrawals = ledger.filter(x => x.entry_type === "withdrawal").length;
        document.getElementById("totalTransactions")?.replaceChildren(document.createTextNode(String(ledger.length)));
        document.getElementById("transactionDeposits")?.replaceChildren(document.createTextNode(String(deposits)));
        document.getElementById("transactionWithdrawals")?.replaceChildren(document.createTextNode(String(withdrawals)));
        document.getElementById("pendingTransactions")?.replaceChildren(document.createTextNode("0"));

        if (!rows.length) {
            if (body) body.innerHTML = "";
            if (empty) empty.style.display = "block";
            return;
        }
        if (empty) empty.style.display = "none";

        if (body) {
            body.innerHTML = rows.map(item => `
                <tr>
                    <td>${escape(item.entry_type)}</td>
                    <td>${escape(item.reference_type || "-")}</td>
                    <td>${money(item.amount)}</td>
                    <td>${escape(item.currency || "NGN")}</td>
                    <td>${new Date(item.created_at).toLocaleString()}</td>
                </tr>
            `).join("");
        }
    }

    async function load() {
        if (body) body.innerHTML = '<tr><td colspan="5">Loading transactions...</td></tr>';
        const { ledger: data, error } = await getUserLedger();
        if (error) {
            console.error("Transaction load failed:", error);
            if (body) body.innerHTML = '<tr><td colspan="5">Unable to load transactions.</td></tr>';
            return;
        }
        ledger = data || [];
        render();
    }

    search?.addEventListener("input", render);
    filter?.addEventListener("change", render);
    refresh?.addEventListener("click", load);

    document.addEventListener("finrise:refresh-dashboard", load);

    try {
        await getSupabase();
        await load();
    } catch (error) {
        console.error(error);
    }
});
