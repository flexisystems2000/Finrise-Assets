/* =========================================================
   FINRISE ASSET
   WITHDRAWAL SYSTEM
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       MAKE SURE WITHDRAW SECTION EXISTS
    ===================================================== */

    const withdrawSection =
        document.getElementById("withdraw");

    if (!withdrawSection) return;


    /* =====================================================
       SETTINGS
    ===================================================== */

    const withdrawalFee = 5;
    const minimumWithdrawal = 20;
    const maximumWithdrawal = 10000;


    /* =====================================================
       GET AVAILABLE BALANCE
    ===================================================== */

    function getBalance() {

        const balance =
            Number(
                localStorage.getItem("finriseBalance")
            );

        return Number.isFinite(balance)
            ? balance
            : 0;
    }


    let availableBalance =
        getBalance();


    /* =====================================================
       GET ELEMENTS
    ===================================================== */

    const amountInput =
        document.getElementById("amount");

    const receiveDisplay =
        document.getElementById("receive");

    const feeDisplay =
        document.getElementById("fee");

    const maxBtn =
        document.getElementById("maxBtn");

    const methods =
        withdrawSection.querySelectorAll(".method");

    const destination =
        document.getElementById("destination");

    const destinationLabel =
        document.getElementById("destinationLabel");

    const destinationHelp =
        document.getElementById("destinationHelp");

    const networkGroup =
        document.getElementById("networkGroup");

    const network =
        document.getElementById("network");

    const withdrawBtn =
        document.getElementById("withdrawBtn");

    const modal =
        document.getElementById("withdrawModal");

    const closeModal =
        document.getElementById("closeModal");

    const cancelBtn =
        document.getElementById("cancelBtn");

    const confirmBtn =
        document.getElementById("confirmBtn");

    const confirmMethod =
        document.getElementById("confirmMethod");

    const confirmAmount =
        document.getElementById("confirmAmount");

    const confirmFee =
        document.getElementById("confirmFee");

    const confirmReceive =
        document.getElementById("confirmReceive");

    const withdrawBalance =
        document.getElementById("withdrawBalance");

    const historyList =
        document.getElementById("historyList");


    /* =====================================================
       SELECTED METHOD
    ===================================================== */

    let selectedMethod = "crypto";


    /* =====================================================
       FORMAT MONEY
    ===================================================== */

    function formatMoney(value) {

        const number =
            Number(value);

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
       UPDATE BALANCE DISPLAY
    ===================================================== */

    function updateBalanceDisplay() {

        if (!withdrawBalance) return;

        availableBalance =
            getBalance();

        withdrawBalance.textContent =
            formatMoney(
                availableBalance
            );
    }


    updateBalanceDisplay();


    /* =====================================================
       CALCULATE WITHDRAWAL
    ===================================================== */

    function calculateWithdrawal() {

        if (!amountInput) return;


        let amount =
            Number(amountInput.value);


        if (
            !Number.isFinite(amount) ||
            amount < 0
        ) {

            amount = 0;

            amountInput.value = "";

        }


        const fee =
            amount > 0
                ? withdrawalFee
                : 0;


        const receive =
            Math.max(
                amount - fee,
                0
            );


        if (feeDisplay) {

            feeDisplay.textContent =
                formatMoney(fee);

        }


        if (receiveDisplay) {

            receiveDisplay.textContent =
                formatMoney(receive);

        }

    }


    /* =====================================================
       AMOUNT INPUT
    ===================================================== */

    if (amountInput) {

        amountInput.addEventListener(
            "input",
            calculateWithdrawal
        );

    }


    /* =====================================================
       MAX BUTTON
    ===================================================== */

    if (maxBtn) {

        maxBtn.addEventListener(
            "click",
            () => {

                availableBalance =
                    getBalance();


                const maxAmount =
                    Math.min(
                        availableBalance,
                        maximumWithdrawal
                    );


                if (maxAmount <= 0) {

                    alert(
                        "You don't have enough balance to withdraw."
                    );

                    return;
                }


                amountInput.value =
                    maxAmount;


                calculateWithdrawal();

            }
        );

    }


    /* =====================================================
       WITHDRAWAL METHOD SELECTION
    ===================================================== */

    methods.forEach(method => {

        method.addEventListener(
            "click",
            () => {

                methods.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


                method.classList.add(
                    "active"
                );


                selectedMethod =
                    method.dataset.method ||
                    "crypto";


                updateMethodFields();

            }
        );

    });


    /* =====================================================
       UPDATE FORM BASED ON METHOD
    ===================================================== */

    function updateMethodFields() {

        if (
            !destinationLabel ||
            !destination ||
            !destinationHelp ||
            !networkGroup
        ) {
            return;
        }


        /* =================================================
           BANK TRANSFER
        ================================================= */

        if (
            selectedMethod === "bank"
        ) {

            destinationLabel.textContent =
                "Bank Account Number";

            destination.placeholder =
                "Enter account number";

            destinationHelp.textContent =
                "Enter the bank account that should receive your funds.";

            networkGroup.style.display =
                "none";

            if (network) {
                network.value = "";
            }

            return;
        }


        /* =================================================
           USDT
        ================================================= */

        if (
            selectedMethod === "usdt"
        ) {

            destinationLabel.textContent =
                "USDT Wallet Address";

            destination.placeholder =
                "Enter USDT wallet address";

            destinationHelp.textContent =
                "Double-check the wallet address and network.";

            networkGroup.style.display =
                "block";

            return;
        }


        /* =================================================
           CRYPTO
        ================================================= */

        destinationLabel.textContent =
            "Wallet Address";

        destination.placeholder =
            "Enter wallet address";

        destinationHelp.textContent =
            "Make sure the wallet address is correct.";

        networkGroup.style.display =
            "block";

    }


    /* =====================================================
       INITIAL METHOD
    ===================================================== */

    updateMethodFields();


    /* =====================================================
       GET METHOD NAME
    ===================================================== */

    function getMethodName() {

        if (
            selectedMethod === "crypto"
        ) {
            return "Crypto Wallet";
        }


        if (
            selectedMethod === "bank"
        ) {
            return "Bank Transfer";
        }


        if (
            selectedMethod === "usdt"
        ) {
            return "USDT";
        }


        return "Withdrawal";
    }


    /* =====================================================
       VALIDATION
    ===================================================== */

    function validateWithdrawal() {

        if (
            !amountInput ||
            !destination
        ) {
            return false;
        }


        const amount =
            Number(amountInput.value);


        const destinationValue =
            destination.value.trim();


        /* =========================
           DESTINATION
        ========================= */

        if (!destinationValue) {

            alert(
                "Please enter your withdrawal destination."
            );

            destination.focus();

            return false;
        }


        /* =========================
           AMOUNT
        ========================= */

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            alert(
                "Please enter a valid withdrawal amount."
            );

            amountInput.focus();

            return false;
        }


        /* =========================
           MINIMUM
        ========================= */

        if (
            amount < minimumWithdrawal
        ) {

            alert(
                `Minimum withdrawal is ${formatMoney(
                    minimumWithdrawal
                )}.`
            );

            amountInput.focus();

            return false;
        }


        /* =========================
           MAXIMUM
        ========================= */

        if (
            amount > maximumWithdrawal
        ) {

            alert(
                `Maximum withdrawal is ${formatMoney(
                    maximumWithdrawal
                )}.`
            );

            amountInput.focus();

            return false;
        }


        /* =========================
           REFRESH BALANCE
        ========================= */

        availableBalance =
            getBalance();


        /* =========================
           BALANCE
        ========================= */

        if (
            amount > availableBalance
        ) {

            alert(
                "You don't have enough available balance."
            );

            amountInput.focus();

            return false;
        }


        /* =========================
           NETWORK
        ========================= */

        if (
            selectedMethod !== "bank"
        ) {

            if (
                !network ||
                !network.value
            ) {

                alert(
                    "Please select a network."
                );

                network?.focus();

                return false;
            }
        }


        return true;
    }


    /* =====================================================
       OPEN CONFIRMATION MODAL
    ===================================================== */

    if (
        withdrawBtn &&
        modal
    ) {

        withdrawBtn.addEventListener(
            "click",
            () => {

                if (
                    !validateWithdrawal()
                ) {
                    return;
                }


                const amount =
                    Number(
                        amountInput.value
                    );


                const receive =
                    Math.max(
                        amount -
                        withdrawalFee,
                        0
                    );


                /* METHOD */

                if (confirmMethod) {

                    confirmMethod.textContent =
                        getMethodName();

                }


                /* AMOUNT */

                if (confirmAmount) {

                    confirmAmount.textContent =
                        formatMoney(
                            amount
                        );

                }


                /* FEE */

                if (confirmFee) {

                    confirmFee.textContent =
                        formatMoney(
                            withdrawalFee
                        );

                }


                /* RECEIVE */

                if (confirmReceive) {

                    confirmReceive.textContent =
                        formatMoney(
                            receive
                        );

                }


                /* OPEN MODAL */

                modal.classList.add(
                    "show"
                );

            }
        );

    }


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    function closeWithdrawalModal() {

        if (!modal) return;

        modal.classList.remove(
            "show"
        );
    }


    if (closeModal) {

        closeModal.addEventListener(
            "click",
            closeWithdrawalModal
        );

    }


    if (cancelBtn) {

        cancelBtn.addEventListener(
            "click",
            closeWithdrawalModal
        );

    }


    /* =====================================================
       CLOSE MODAL OUTSIDE
    ===================================================== */

    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    closeWithdrawalModal();

                }

            }
        );

    }


    /* =====================================================
       ESC KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                modal &&
                modal.classList.contains("show")
            ) {

                closeWithdrawalModal();

            }

        }
    );


    /* =====================================================
       GET WITHDRAWALS
    ===================================================== */

    function getWithdrawals() {

        try {

            const saved =
                localStorage.getItem(
                    "finriseWithdrawals"
                );


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
                "Unable to read withdrawal history:",
                error
            );

            return [];
        }
    }


    /* =====================================================
       SAVE WITHDRAWALS
    ===================================================== */

    function saveWithdrawals(
        withdrawals
    ) {

        try {

            localStorage.setItem(
                "finriseWithdrawals",
                JSON.stringify(
                    withdrawals
                )
            );

            return true;

        } catch (error) {

            console.error(
                "Unable to save withdrawal:",
                error
            );

            return false;
        }
    }


    /* =====================================================
       CONFIRM WITHDRAWAL
    ===================================================== */

    if (confirmBtn) {

        confirmBtn.addEventListener(
            "click",
            () => {

                if (
                    !validateWithdrawal()
                ) {
                    return;
                }


                const amount =
                    Number(
                        amountInput.value
                    );


                availableBalance =
                    getBalance();


                /* =================================================
                   FINAL BALANCE CHECK
                ================================================= */

                if (
                    amount >
                    availableBalance
                ) {

                    alert(
                        "Your available balance has changed. Please try again."
                    );

                    closeWithdrawalModal();

                    updateBalanceDisplay();

                    return;
                }


                /* =================================================
                   CREATE TRANSACTION
                ================================================= */

                const now =
                    Date.now();


                const newTransaction = {

                    id:
                        "WD-" +
                        now,

                    type:
                        "Withdrawal",

                    method:
                        selectedMethod,

                    methodName:
                        getMethodName(),

                    destination:
                        destination.value.trim(),

                    network:
                        selectedMethod === "bank"
                            ? "Bank"
                            : network?.value || "",

                    amount:
                        amount,

                    fee:
                        withdrawalFee,

                    receive:
                        Math.max(
                            amount -
                            withdrawalFee,
                            0
                        ),

                    status:
                        "Pending",

                    date:
                        new Date()
                            .toLocaleString(),

                    timestamp:
                        now
                };


                /* =================================================
                   SAVE WITHDRAWAL
                ================================================= */

                const withdrawals =
                    getWithdrawals();


                withdrawals.unshift(
                    newTransaction
                );


                const saved =
                    saveWithdrawals(
                        withdrawals
                    );


                if (!saved) {

                    alert(
                        "Unable to save your withdrawal request."
                    );

                    return;
                }


                /* =================================================
                   GENERAL TRANSACTION HISTORY
                ================================================= */

                let transactions = [];

                try {

                    const savedTransactions =
                        localStorage.getItem(
                            "finriseTransactions"
                        );


                    if (
                        savedTransactions
                    ) {

                        const parsed =
                            JSON.parse(
                                savedTransactions
                            );


                        if (
                            Array.isArray(
                                parsed
                            )
                        ) {

                            transactions =
                                parsed;

                        }

                    }

                } catch (error) {

                    console.error(
                        "Unable to read transactions:",
                        error
                    );

                }


                transactions.unshift({

                    id:
                        newTransaction.id,

                    type:
                        "Withdrawal",

                    method:
                        selectedMethod,

                    methodName:
                        getMethodName(),

                    amount:
                        amount,

                    fee:
                        withdrawalFee,

                    receive:
                        newTransaction.receive,

                    status:
                        "Pending",

                    date:
                        newTransaction.date,

                    timestamp:
                        newTransaction.timestamp

                });


                localStorage.setItem(
                    "finriseTransactions",
                    JSON.stringify(
                        transactions
                    )
                );


                /* =================================================
                   UPDATE BALANCE
                   
                   DEMO ONLY
                ================================================= */

                availableBalance =
                    availableBalance -
                    amount;


                localStorage.setItem(
                    "finriseBalance",
                    availableBalance
                );


                updateBalanceDisplay();


                /* =================================================
                   UPDATE DASHBOARD BALANCE
                ================================================= */

                const dashboardBalance =
                    document.getElementById(
                        "balance"
                    );


                if (dashboardBalance) {

                    dashboardBalance.textContent =
                        formatMoney(
                            availableBalance
                        );

                }


                /* =================================================
                   UPDATE HISTORY
                ================================================= */

                renderWithdrawalHistory();


                /* =================================================
                   CLOSE MODAL
                ================================================= */

                closeWithdrawalModal();


                /* =================================================
                   RESET FORM
                ================================================= */

                if (amountInput) {
                    amountInput.value = "";
                }


                if (destination) {
                    destination.value = "";
                }


                if (network) {
                    network.value = "";
                }


                calculateWithdrawal();


                /* =================================================
                   SUCCESS
                ================================================= */

                alert(
                    "Withdrawal request submitted successfully."
                );

            }
        );

    }


    /* =====================================================
       RENDER WITHDRAWAL HISTORY
    ===================================================== */

    function renderWithdrawalHistory() {

        if (!historyList) {
            return;
        }


        const withdrawals =
            getWithdrawals();


        /* =================================================
           NO HISTORY
        ================================================= */

        if (
            withdrawals.length === 0
        ) {

            historyList.innerHTML = `

                <div class="transaction">

                    <div class="transaction-icon">
                        ₮
                    </div>

                    <div class="transaction-info">

                        <strong>
                            No Withdrawals Yet
                        </strong>

                        <small>
                            Your withdrawal history will appear here.
                        </small>

                    </div>

                    <div class="transaction-right">

                        <strong>
                            --
                        </strong>

                    </div>

                </div>

            `;

            return;
        }


        /* =================================================
           LATEST 5
        ================================================= */

        const recentWithdrawals =
            withdrawals.slice(0, 5);


        historyList.innerHTML =
            recentWithdrawals
                .map(
                    withdrawal => {

                        let icon = "₮";


                        if (
                            withdrawal.method ===
                            "crypto"
                        ) {

                            icon = "₿";

                        } else if (
                            withdrawal.method ===
                            "bank"
                        ) {

                            icon = "₦";

                        }


                        const methodName =
                            escapeHTML(
                                withdrawal.methodName ||
                                "Withdrawal"
                            );


                        const date =
                            escapeHTML(
                                withdrawal.date ||
                                "Unknown date"
                            );


                        const status =
                            escapeHTML(
                                withdrawal.status ||
                                "Pending"
                            );


                        const amount =
                            Number(
                                withdrawal.amount
                            ) || 0;


                        return `

                            <div class="transaction">

                                <div class="transaction-icon">
                                    ${icon}
                                </div>


                                <div class="transaction-info">

                                    <strong>
                                        ${methodName}
                                    </strong>

                                    <small>
                                        ${date}
                                    </small>

                                </div>


                                <div class="transaction-right">

                                    <strong>
                                        -${formatMoney(
                                            amount
                                        )}
                                    </strong>


                                    <span class="status pending">
                                        ${status}
                                    </span>

                                </div>

                            </div>

                        `;

                    }
                )
                .join("");

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    /* =====================================================
       INITIAL HISTORY
    ===================================================== */

    renderWithdrawalHistory();


    /* =====================================================
       INITIAL CALCULATION
    ===================================================== */

    calculateWithdrawal();

});