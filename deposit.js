/* =========================================================
   FINRISE ASSET
   DEPOSIT JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const depositSection =
        document.getElementById("deposit");

    // Stop if the Deposit section does not exist
    if (!depositSection) return;


    const depositMethods =
        depositSection.querySelectorAll(".deposit-method");

    const depositAmount =
        document.getElementById("depositAmount");

    const depositBtn =
        document.getElementById("depositBtn");

    const depositBalance =
        document.getElementById("depositBalance");

    const walletAddress =
        document.getElementById("walletAddress");

    const copyWallet =
        document.getElementById("copyWallet");

    const paymentTitle =
        document.getElementById("paymentTitle");

    const paymentDescription =
        document.getElementById("paymentDescription");

    const cryptoPayment =
        document.getElementById("cryptoPayment");

    const networkPayment =
        document.getElementById("networkPayment");

    const bankPayment =
        document.getElementById("bankPayment");

    const depositNetwork =
        document.getElementById("depositNetwork");

    const depositHistory =
        document.getElementById("depositHistory");


    /* =====================================================
       SETTINGS
    ===================================================== */

    const minimumDeposit = 50;

    let selectedMethod = "crypto";


    /* =====================================================
       FORMAT MONEY
    ===================================================== */

    function formatMoney(value) {

        const number = Number(value);

        if (!Number.isFinite(number)) {
            return "$0.00";
        }

        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number);
    }


    /* =====================================================
       LOCAL STORAGE HELPERS
    ===================================================== */

    function getDeposits() {

        try {

            const savedDeposits =
                localStorage.getItem("finriseDeposits");

            if (!savedDeposits) {
                return [];
            }

            const deposits =
                JSON.parse(savedDeposits);

            return Array.isArray(deposits)
                ? deposits
                : [];

        } catch (error) {

            console.error(
                "Unable to read deposit history:",
                error
            );

            return [];
        }
    }


    function saveDeposits(deposits) {

        try {

            localStorage.setItem(
                "finriseDeposits",
                JSON.stringify(deposits)
            );

            return true;

        } catch (error) {

            console.error(
                "Unable to save deposit:",
                error
            );

            return false;
        }
    }


    /* =====================================================
       GET BALANCE
    ===================================================== */

    function getBalance() {

        const balance =
            Number(
                localStorage.getItem(
                    "finriseBalance"
                )
            );

        return Number.isFinite(balance)
            ? balance
            : 0;
    }


    /* =====================================================
       UPDATE DEPOSIT BALANCE
    ===================================================== */

    function updateBalance() {

        if (!depositBalance) return;

        depositBalance.textContent =
            formatMoney(getBalance());
    }


    updateBalance();


    /* =====================================================
       METHOD SELECTION
    ===================================================== */

    depositMethods.forEach(method => {

        method.addEventListener(
            "click",
            () => {

                depositMethods.forEach(item => {
                    item.classList.remove("active");
                });

                method.classList.add("active");

                selectedMethod =
                    method.dataset.method || "crypto";

                updatePaymentDetails();
            }
        );

    });


    /* =====================================================
       PAYMENT DETAILS
    ===================================================== */

    function updatePaymentDetails() {

        // Hide all payment sections first

        if (cryptoPayment) {
            cryptoPayment.style.display = "none";
        }

        if (networkPayment) {
            networkPayment.style.display = "none";
        }

        if (bankPayment) {
            bankPayment.style.display = "none";
        }


        /* =================================================
           BITCOIN / CRYPTO
        ================================================= */

        if (selectedMethod === "crypto") {

            if (paymentTitle) {
                paymentTitle.textContent =
                    "Bitcoin Payment";
            }

            if (paymentDescription) {
                paymentDescription.textContent =
                    "Send the exact amount to the Bitcoin wallet below.";
            }

            if (cryptoPayment) {
                cryptoPayment.style.display = "block";
            }

            if (walletAddress) {
                walletAddress.value =
                    "YOUR_BTC_WALLET_ADDRESS";
            }

            return;
        }


        /* =================================================
           USDT
        ================================================= */

        if (selectedMethod === "usdt") {

            if (paymentTitle) {
                paymentTitle.textContent =
                    "USDT Payment";
            }

            if (paymentDescription) {
                paymentDescription.textContent =
                    "Send USDT using the selected network.";
            }

            if (cryptoPayment) {
                cryptoPayment.style.display = "block";
            }

            if (networkPayment) {
                networkPayment.style.display = "block";
            }

            if (walletAddress) {
                walletAddress.value =
                    "YOUR_USDT_WALLET_ADDRESS";
            }

            return;
        }


        /* =================================================
           BANK TRANSFER
        ================================================= */

        if (selectedMethod === "bank") {

            if (paymentTitle) {
                paymentTitle.textContent =
                    "Bank Transfer";
            }

            if (paymentDescription) {
                paymentDescription.textContent =
                    "Transfer your deposit to the bank account below.";
            }

            if (bankPayment) {
                bankPayment.style.display = "block";
            }
        }
    }


    updatePaymentDetails();


    /* =====================================================
       COPY WALLET ADDRESS
    ===================================================== */

    if (copyWallet) {

        copyWallet.addEventListener(
            "click",
            async () => {

                if (
                    !walletAddress ||
                    !walletAddress.value
                ) {
                    return;
                }


                const address =
                    walletAddress.value;


                try {

                    if (
                        navigator.clipboard &&
                        window.isSecureContext
                    ) {

                        await navigator.clipboard.writeText(
                            address
                        );

                    } else {

                        walletAddress.select();

                        document.execCommand("copy");
                    }


                    copyWallet.innerHTML =
                        '<i class="bi bi-check-lg"></i> Copied';


                    setTimeout(() => {

                        copyWallet.innerHTML =
                            '<i class="bi bi-copy"></i> Copy';

                    }, 2000);


                } catch (error) {

                    console.error(
                        "Unable to copy wallet address:",
                        error
                    );

                    alert(
                        "Unable to copy the wallet address. Please copy it manually."
                    );
                }
            }
        );
    }


    /* =====================================================
       SUBMIT DEPOSIT
    ===================================================== */

    if (depositBtn) {

        depositBtn.addEventListener(
            "click",
            () => {

                const amount =
                    Number(
                        depositAmount?.value
                    );


                /* =========================================
                   VALIDATION
                ========================================= */

                if (
                    !Number.isFinite(amount) ||
                    amount <= 0
                ) {

                    alert(
                        "Please enter a valid deposit amount."
                    );

                    depositAmount?.focus();

                    return;
                }


                if (amount < minimumDeposit) {

                    alert(
                        `Minimum deposit is ${formatMoney(
                            minimumDeposit
                        )}.`
                    );

                    depositAmount?.focus();

                    return;
                }


                /* =========================================
                   GET NETWORK
                ========================================= */

                let network = "Bank";


                if (selectedMethod !== "bank") {

                    network =
                        depositNetwork?.value || "";

                    if (!network) {

                        alert(
                            "Please select a network."
                        );

                        depositNetwork?.focus();

                        return;
                    }
                }


                /* =========================================
                   METHOD NAME
                ========================================= */

                let methodName = "Crypto Wallet";

                if (selectedMethod === "usdt") {
                    methodName = "USDT";
                }

                if (selectedMethod === "bank") {
                    methodName = "Bank Transfer";
                }


                /* =========================================
                   CREATE TRANSACTION
                ========================================= */

                const transaction = {

                    id:
                        "DP-" +
                        Date.now(),

                    type:
                        "Deposit",

                    method:
                        selectedMethod,

                    methodName:
                        methodName,

                    amount:
                        amount,

                    network:
                        network,

                    status:
                        "Pending",

                    date:
                        new Date().toLocaleString(),

                    timestamp:
                        Date.now()
                };


                /* =========================================
                   SAVE DEPOSIT
                ========================================= */

                const deposits =
                    getDeposits();

                deposits.unshift(
                    transaction
                );


                const saved =
                    saveDeposits(
                        deposits
                    );


                if (!saved) {

                    alert(
                        "Unable to save your deposit request. Please try again."
                    );

                    return;
                }


                /* =========================================
                   GENERAL TRANSACTION HISTORY
                ========================================= */

                let transactions = [];

                try {

                    const savedTransactions =
                        localStorage.getItem(
                            "finriseTransactions"
                        );

                    if (savedTransactions) {

                        const parsed =
                            JSON.parse(
                                savedTransactions
                            );

                        if (
                            Array.isArray(parsed)
                        ) {
                            transactions = parsed;
                        }
                    }

                } catch (error) {

                    console.error(
                        "Unable to read transactions:",
                        error
                    );

                    transactions = [];
                }


                transactions.unshift({

                    id:
                        transaction.id,

                    type:
                        "Deposit",

                    method:
                        selectedMethod,

                    methodName:
                        methodName,

                    amount:
                        amount,

                    network:
                        network,

                    status:
                        "Pending",

                    date:
                        transaction.date,

                    timestamp:
                        transaction.timestamp
                });


                localStorage.setItem(
                    "finriseTransactions",
                    JSON.stringify(
                        transactions
                    )
                );


                /* =========================================
                   IMPORTANT
                ========================================= */

                /*
                    DO NOT increase the balance here.

                    The deposit is Pending.

                    The balance should only be updated
                    after approval by your backend/admin.
                */


                /* =========================================
                   RESET FORM
                ========================================= */

                if (depositAmount) {
                    depositAmount.value = "";
                }


                if (depositNetwork) {
                    depositNetwork.value = "";
                }


                /* =========================================
                   UPDATE HISTORY
                ========================================= */

                renderDepositHistory();


                /* =========================================
                   SUCCESS MESSAGE
                ========================================= */

                alert(
                    "Deposit request submitted successfully. Your deposit is pending review."
                );

            }
        );
    }


    /* =====================================================
       RENDER DEPOSIT HISTORY
    ===================================================== */

    function renderDepositHistory() {

        if (!depositHistory) return;


        const deposits =
            getDeposits();


        /* =========================================
           EMPTY STATE
        ========================================= */

        if (deposits.length === 0) {

            depositHistory.innerHTML = `

                <div class="deposit-empty">

                    <i class="bi bi-wallet2"></i>

                    <p>No deposits yet</p>

                    <small>
                        Your deposit history will appear here.
                    </small>

                </div>

            `;

            return;
        }


        /* =========================================
           HISTORY
        ========================================= */

        depositHistory.innerHTML =
            deposits
                .slice(0, 5)
                .map(deposit => {

                    const method =
                        String(
                            deposit.methodName ||
                            deposit.method ||
                            "Deposit"
                        );


                    const status =
                        String(
                            deposit.status ||
                            "Pending"
                        );


                    const statusClass =
                        status
                            .toLowerCase()
                            .replace(
                                /\s+/g,
                                "-"
                            );


                    const amount =
                        Number(
                            deposit.amount
                        ) || 0;


                    const date =
                        deposit.date ||
                        "Unknown date";


                    return `

                        <div
                            class="deposit-history-item"
                            data-id="${escapeHTML(
                        deposit.id
                    )}"
                        >

                            <div class="deposit-history-left">

                                <div class="deposit-icon">

                                    <i class="bi bi-wallet2"></i>

                                </div>

                                <div>

                                    <strong>
                                        ${escapeHTML(
                        method
                    )}
                                    </strong>

                                    <small>
                                        ${escapeHTML(
                        date
                    )}
                                    </small>

                                </div>

                            </div>


                            <div class="deposit-history-right">

                                <strong>
                                    +${formatMoney(
                        amount
                    )}
                                </strong>

                                <small
                                    class="${escapeHTML(
                        statusClass
                    )}"
                                >
                                    ${escapeHTML(
                        status
                    )}
                                </small>

                            </div>

                        </div>

                    `;
                })
                .join("");
    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       INITIAL RENDER
    ===================================================== */

    renderDepositHistory();

});