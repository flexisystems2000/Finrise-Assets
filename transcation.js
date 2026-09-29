/* =========================================================
   FINRISE ASSET
   TRANSACTIONS LOGIC
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       TRANSACTIONS SECTION CHECK
    ===================================================== */

    const transactionsSection =
        document.getElementById("transactions");

    if (!transactionsSection) return;


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const transactionsBody =
        document.getElementById(
            "transactionsBody"
        );

    const transactionsEmpty =
        document.getElementById(
            "transactionsEmpty"
        );

    const searchInput =
        document.getElementById(
            "transactionSearch"
        );

    const filterSelect =
        document.getElementById(
            "transactionFilter"
        );

    const refreshButton =
        document.getElementById(
            "refreshTransactions"
        );

    const totalTransactions =
        document.getElementById(
            "totalTransactions"
        );

    const transactionDeposits =
        document.getElementById(
            "transactionDeposits"
        );

    const transactionWithdrawals =
        document.getElementById(
            "transactionWithdrawals"
        );

    const pendingTransactions =
        document.getElementById(
            "pendingTransactions"
        );


    /* =====================================================
       FORMAT MONEY
    ===================================================== */

    function formatMoney(value) {

        const number = Number(value);

        if (!Number.isFinite(number)) {
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
       GET STORAGE ARRAY
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


    /* =====================================================
       GET DEPOSITS
    ===================================================== */

    function getDeposits() {

        return getStorageArray(
            "finriseDeposits"
        );

    }


    /* =====================================================
       GET WITHDRAWALS
    ===================================================== */

    function getWithdrawals() {

        return getStorageArray(
            "finriseWithdrawals"
        );

    }


    /* =====================================================
       GET TRADES
    ===================================================== */

    function getTrades() {

        return getStorageArray(
            "finriseTrades"
        );

    }


    /* =====================================================
       GET INVESTMENTS
    ===================================================== */

    function getInvestments() {

        return getStorageArray(
            "finriseInvestments"
        );

    }


    /* =====================================================
       COMBINE ALL TRANSACTIONS
    ===================================================== */

    function getTransactions() {

        /* -------------------------------------------------
           DEPOSITS
        ------------------------------------------------- */

        const deposits =
            getDeposits().map(
                deposit => ({

                    id:
                        deposit.id ||
                        "N/A",

                    type:
                        "deposit",

                    method:
                        deposit.method ||
                        "unknown",

                    amount:
                        Number(
                            deposit.amount
                        ) || 0,

                    status:
                        deposit.status ||
                        "Pending",

                    date:
                        deposit.date ||
                        "Unknown date",

                    timestamp:
                        Number(
                            deposit.timestamp
                        ) || 0

                })
            );


        /* -------------------------------------------------
           WITHDRAWALS
        ------------------------------------------------- */

        const withdrawals =
            getWithdrawals().map(
                withdrawal => ({

                    id:
                        withdrawal.id ||
                        "N/A",

                    type:
                        "withdrawal",

                    method:
                        withdrawal.method ||
                        "unknown",

                    amount:
                        Number(
                            withdrawal.amount
                        ) || 0,

                    status:
                        withdrawal.status ||
                        "Pending",

                    date:
                        withdrawal.date ||
                        "Unknown date",

                    timestamp:
                        Number(
                            withdrawal.timestamp
                        ) || 0

                })
            );


        /* -------------------------------------------------
           TRADES
        ------------------------------------------------- */

        const trades =
            getTrades().map(
                trade => ({

                    id:
                        trade.id ||
                        "N/A",

                    type:
                        "trade",

                    method:
                        trade.type === "sell"
                            ? "Sell"
                            : "Buy",

                    amount:
                        Number(
                            trade.amount
                        ) || 0,

                    status:
                        trade.status ||
                        "Pending",

                    date:
                        trade.date ||
                        "Unknown date",

                    timestamp:
                        Number(
                            trade.timestamp
                        ) || 0,

                    asset:
                        trade.asset ||
                        "Unknown"

                })
            );


        /* -------------------------------------------------
           INVESTMENTS
        ------------------------------------------------- */

        const investments =
            getInvestments().map(
                investment => ({

                    id:
                        investment.id ||
                        "N/A",

                    type:
                        "investment",

                    method:
                        investment.plan ||
                        "Investment Plan",

                    amount:
                        Number(
                            investment.amount
                        ) || 0,

                    status:
                        investment.status ||
                        "Pending",

                    date:
                        investment.date ||
                        "Unknown date",

                    timestamp:
                        Number(
                            investment.timestamp
                        ) || 0,

                    plan:
                        investment.plan ||
                        "Investment Plan"

                })
            );


        /* -------------------------------------------------
           COMBINE
        ------------------------------------------------- */

        return [
            ...deposits,
            ...withdrawals,
            ...trades,
            ...investments
        ].sort(
            (a, b) => {

                /* Prefer timestamp when available */

                if (
                    a.timestamp &&
                    b.timestamp
                ) {

                    return (
                        b.timestamp -
                        a.timestamp
                    );

                }


                /* Fallback to date */

                const dateA =
                    new Date(a.date)
                        .getTime();

                const dateB =
                    new Date(b.date)
                        .getTime();


                return (
                    (Number.isFinite(dateB)
                        ? dateB
                        : 0) -
                    (Number.isFinite(dateA)
                        ? dateA
                        : 0)
                );

            }
        );

    }


    /* =====================================================
       METHOD NAME
    ===================================================== */

    function getMethodName(
        method,
        type,
        transaction
    ) {

        if (type === "trade") {

            return transaction?.asset
                ? `${transaction.asset} (${method})`
                : method;

        }


        if (type === "investment") {

            return transaction?.plan
                ? transaction.plan
                : "Investment Plan";

        }


        const methods = {

            crypto:
                "Crypto Wallet",

            usdt:
                "USDT",

            bank:
                "Bank Transfer"

        };


        return methods[method] ||
            method ||
            "Unknown";

    }


    /* =====================================================
       STATUS CLASS
    ===================================================== */

    function getStatusClass(status) {

        return String(status || "Pending")
            .toLowerCase()
            .replace(/\s+/g, "-");

    }


    /* =====================================================
       TRANSACTION TYPE INFORMATION
    ===================================================== */

    function getTransactionDisplay(
        transaction
    ) {

        const type =
            transaction.type;


        /* -------------------------------------------------
           DEPOSIT
        ------------------------------------------------- */

        if (type === "deposit") {

            return {

                className:
                    "deposit",

                icon:
                    "bi-arrow-down-circle-fill",

                label:
                    "Deposit",

                prefix:
                    "+"

            };

        }


        /* -------------------------------------------------
           WITHDRAWAL
        ------------------------------------------------- */

        if (type === "withdrawal") {

            return {

                className:
                    "withdrawal",

                icon:
                    "bi-arrow-up-circle-fill",

                label:
                    "Withdrawal",

                prefix:
                    "-"

            };

        }


        /* -------------------------------------------------
           TRADE
        ------------------------------------------------- */

        if (type === "trade") {

            const isSell =
                transaction.method === "Sell";


            return {

                className:
                    isSell
                        ? "withdrawal"
                        : "deposit",

                icon:
                    isSell
                        ? "bi-graph-down-arrow"
                        : "bi-graph-up-arrow",

                label:
                    isSell
                        ? "Sell Trade"
                        : "Buy Trade",

                prefix:
                    isSell
                        ? "-"
                        : ""

            };

        }


        /* -------------------------------------------------
           INVESTMENT
        ------------------------------------------------- */

        if (type === "investment") {

            return {

                className:
                    "investment",

                icon:
                    "bi-pie-chart-fill",

                label:
                    "Investment",

                prefix:
                    "-"

            };

        }


        /* -------------------------------------------------
           DEFAULT
        ------------------------------------------------- */

        return {

            className:
                "transaction",

            icon:
                "bi-receipt",

            label:
                "Transaction",

            prefix:
                ""

        };

    }


    /* =====================================================
       RENDER TRANSACTIONS
    ===================================================== */

    function renderTransactions() {

        if (!transactionsBody) return;


        let transactions =
            getTransactions();


        /* =================================================
           SEARCH
        ================================================= */

        const search =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        if (search) {

            transactions =
                transactions.filter(
                    transaction => {

                        const id =
                            String(
                                transaction.id ||
                                ""
                            ).toLowerCase();


                        const method =
                            String(
                                transaction.method ||
                                ""
                            ).toLowerCase();


                        const type =
                            String(
                                transaction.type ||
                                ""
                            ).toLowerCase();


                        const asset =
                            String(
                                transaction.asset ||
                                ""
                            ).toLowerCase();


                        const plan =
                            String(
                                transaction.plan ||
                                ""
                            ).toLowerCase();


                        const status =
                            String(
                                transaction.status ||
                                ""
                            ).toLowerCase();


                        return (

                            id.includes(search)

                            ||

                            method.includes(search)

                            ||

                            type.includes(search)

                            ||

                            asset.includes(search)

                            ||

                            plan.includes(search)

                            ||

                            status.includes(search)

                        );

                    }
                );

        }


        /* =================================================
           FILTER
        ================================================= */

        const filter =
            filterSelect
                ? filterSelect.value
                : "all";


        if (filter !== "all") {

            transactions =
                transactions.filter(
                    transaction => {

                        return (

                            transaction.type ===
                                filter

                            ||

                            transaction.status
                                ?.toLowerCase() ===
                                filter

                        );

                    }
                );

        }


        /* =================================================
           EMPTY STATE
        ================================================= */

        if (
            transactions.length === 0
        ) {

            transactionsBody.innerHTML =
                "";


            if (transactionsEmpty) {

                transactionsEmpty.classList.add(
                    "show"
                );

            }

            return;

        }


        if (transactionsEmpty) {

            transactionsEmpty.classList.remove(
                "show"
            );

        }


        /* =================================================
           RENDER ROWS
        ================================================= */

        transactionsBody.innerHTML =
            transactions
                .map(
                    transaction => {

                        const display =
                            getTransactionDisplay(
                                transaction
                            );


                        const status =
                            String(
                                transaction.status ||
                                "Pending"
                            );


                        const statusClass =
                            getStatusClass(
                                status
                            );


                        const amount =
                            Number(
                                transaction.amount
                            ) || 0;


                        const typeClass =
                            escapeHTML(
                                display.className
                            );


                        const methodName =
                            getMethodName(
                                transaction.method,
                                transaction.type,
                                transaction
                            );


                        const method =
                            escapeHTML(
                                methodName
                            );


                        const id =
                            escapeHTML(
                                transaction.id ||
                                "N/A"
                            );


                        const date =
                            escapeHTML(
                                transaction.date ||
                                "Unknown date"
                            );


                        const safeStatus =
                            escapeHTML(
                                status
                            );


                        return `

                            <tr>

                                <!-- ID -->

                                <td>

                                    <div class="transaction-id">

                                        ${id}

                                    </div>

                                </td>


                                <!-- TYPE -->

                                <td>

                                    <span
                                        class="
                                            transaction-type
                                            ${typeClass}
                                        "
                                    >

                                        <i
                                            class="
                                                bi
                                                ${escapeHTML(
                                                    display.icon
                                                )}
                                            "
                                        ></i>

                                        ${escapeHTML(
                                            display.label
                                        )}

                                    </span>

                                </td>


                                <!-- METHOD -->

                                <td>

                                    <span
                                        class="transaction-method"
                                    >

                                        ${method}

                                    </span>

                                </td>


                                <!-- AMOUNT -->

                                <td>

                                    <span
                                        class="
                                            transaction-amount
                                            ${typeClass}
                                        "
                                    >

                                        ${escapeHTML(
                                            display.prefix
                                        )}

                                        ${formatMoney(
                                            amount
                                        )}

                                    </span>

                                </td>


                                <!-- DATE -->

                                <td>

                                    <span
                                        class="transaction-date"
                                    >

                                        ${date}

                                    </span>

                                </td>


                                <!-- STATUS -->

                                <td>

                                    <span
                                        class="
                                            transaction-status
                                            ${escapeHTML(
                                                statusClass
                                            )}
                                        "
                                    >

                                        ${safeStatus}

                                    </span>

                                </td>

                            </tr>

                        `;

                    }
                )
                .join("");

    }


    /* =====================================================
       UPDATE SUMMARY
    ===================================================== */

    function updateSummary() {

        const transactions =
            getTransactions();


        /* -------------------------------------------------
           DEPOSITS
        ------------------------------------------------- */

        const deposits =
            transactions.filter(
                transaction =>
                    transaction.type ===
                    "deposit"
            );


        /* -------------------------------------------------
           WITHDRAWALS
        ------------------------------------------------- */

        const withdrawals =
            transactions.filter(
                transaction =>
                    transaction.type ===
                    "withdrawal"
            );


        /* -------------------------------------------------
           PENDING
        ------------------------------------------------- */

        const pending =
            transactions.filter(
                transaction => {

                    return String(
                        transaction.status ||
                        ""
                    ).toLowerCase() ===
                    "pending";

                }
            );


        /* -------------------------------------------------
           TOTAL DEPOSIT
        ------------------------------------------------- */

        const depositTotal =
            deposits.reduce(
                (
                    total,
                    transaction
                ) => {

                    return (
                        total +
                        (
                            Number(
                                transaction.amount
                            ) || 0
                        )
                    );

                },
                0
            );


        /* -------------------------------------------------
           TOTAL WITHDRAWAL
        ------------------------------------------------- */

        const withdrawalTotal =
            withdrawals.reduce(
                (
                    total,
                    transaction
                ) => {

                    return (
                        total +
                        (
                            Number(
                                transaction.amount
                            ) || 0
                        )
                    );

                },
                0
            );


        /* -------------------------------------------------
           DISPLAY
        ------------------------------------------------- */

        if (totalTransactions) {

            totalTransactions.textContent =
                transactions.length;

        }


        if (transactionDeposits) {

            transactionDeposits.textContent =
                formatMoney(
                    depositTotal
                );

        }


        if (transactionWithdrawals) {

            transactionWithdrawals.textContent =
                formatMoney(
                    withdrawalTotal
                );

        }


        if (pendingTransactions) {

            pendingTransactions.textContent =
                pending.length;

        }

    }


    /* =====================================================
       LOAD EVERYTHING
    ===================================================== */

    function loadTransactions() {

        updateSummary();

        renderTransactions();

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            renderTransactions
        );

    }


    /* =====================================================
       FILTER
    ===================================================== */

    if (filterSelect) {

        filterSelect.addEventListener(
            "change",
            renderTransactions
        );

    }


    /* =====================================================
       REFRESH
    ===================================================== */

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            () => {

                refreshButton.classList.add(
                    "refreshing"
                );


                loadTransactions();


                setTimeout(
                    () => {

                        refreshButton.classList.remove(
                            "refreshing"
                        );

                    },
                    500
                );

            }
        );

    }


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    loadTransactions();

});