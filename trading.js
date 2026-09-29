/* =========================================================
   FINRISE ASSET
   TRADING LOGIC
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       TRADING SECTION CHECK
    ===================================================== */

    const tradingSection =
        document.getElementById("trading");

    if (!tradingSection) return;


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const assetButtons =
        tradingSection.querySelectorAll(".asset-btn");

    const marketPrice =
        document.getElementById("marketPrice");

    const chartAsset =
        document.getElementById("chartAsset");

    const orderAsset =
        document.getElementById("orderAsset");

    const orderPrice =
        document.getElementById("orderPrice");

    const orderAssetIcon =
        document.getElementById("orderAssetIcon");

    const tradeAmount =
        document.getElementById("tradeAmount");

    const estimatedQuantity =
        document.getElementById("estimatedQuantity");

    const placeTradeBtn =
        document.getElementById("placeTradeBtn");

    const orderTabs =
        tradingSection.querySelectorAll(".order-tab");

    const investmentsBody =
        document.getElementById("investmentsBody");

    const noInvestments =
        document.getElementById("noInvestments");

    const tradeHistoryBody =
        document.getElementById("tradeHistoryBody");

    const tradingBalance =
        document.getElementById("tradingBalance");

    const orderBalance =
        document.getElementById("orderBalance");


    /* =====================================================
       VARIABLES
    ===================================================== */

    let selectedAsset = {
        symbol: "BINANCE:BTCUSDT",
        name: "BTC/USDT",
        price: 65000
    };

    let orderType = "buy";


    /* =====================================================
       SETTINGS
    ===================================================== */

    const minimumTradeAmount = 1;


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
       SAFE HTML
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
       GET BALANCE
    ===================================================== */

    function getBalance() {

        const storedBalance =
            localStorage.getItem("finriseBalance");

        const balance =
            Number(storedBalance);

        if (!Number.isFinite(balance) || balance < 0) {
            return 0;
        }

        return balance;

    }


    /* =====================================================
       UPDATE BALANCE DISPLAY
    ===================================================== */

    function updateBalanceDisplay() {

        const balance =
            getBalance();

        if (tradingBalance) {

            tradingBalance.textContent =
                formatMoney(balance);

        }

        if (orderBalance) {

            orderBalance.textContent =
                formatMoney(balance);

        }

    }


    /* =====================================================
       GET ARRAY FROM LOCAL STORAGE
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
       SAVE ARRAY TO LOCAL STORAGE
    ===================================================== */

    function saveStorageArray(key, data) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(data)
            );

            return true;

        } catch (error) {

            console.error(
                `Unable to save ${key}:`,
                error
            );

            return false;

        }

    }


    /* =====================================================
       UPDATE ASSET
    ===================================================== */

    function updateAsset(button) {

        if (!button) return;

        const price =
            Number(button.dataset.price);

        selectedAsset = {

            symbol:
                button.dataset.symbol ||
                "BINANCE:BTCUSDT",

            name:
                button.dataset.name ||
                "BTC/USDT",

            price:
                Number.isFinite(price) && price > 0
                    ? price
                    : 0

        };


        /* -------------------------------------------------
           ACTIVE ASSET
        ------------------------------------------------- */

        assetButtons.forEach(item => {

            item.classList.remove("active");

        });

        button.classList.add("active");


        /* -------------------------------------------------
           MARKET PRICE
        ------------------------------------------------- */

        if (marketPrice) {

            marketPrice.textContent =
                formatMoney(
                    selectedAsset.price
                );

        }


        /* -------------------------------------------------
           CHART ASSET
        ------------------------------------------------- */

        if (chartAsset) {

            chartAsset.textContent =
                selectedAsset.name;

        }


        /* -------------------------------------------------
           ORDER ASSET
        ------------------------------------------------- */

        if (orderAsset) {

            orderAsset.textContent =
                selectedAsset.name;

        }


        /* -------------------------------------------------
           ORDER PRICE
        ------------------------------------------------- */

        if (orderPrice) {

            orderPrice.textContent =
                formatMoney(
                    selectedAsset.price
                );

        }


        /* -------------------------------------------------
           ASSET ICON
        ------------------------------------------------- */

        if (orderAssetIcon) {

            const symbol =
                selectedAsset.name
                    .split("/")[0]
                    .toLowerCase();

            orderAssetIcon.textContent =
                symbol.substring(0, 1).toUpperCase();

        }


        updateTradeButton();

        updateQuantity();

        loadTradingChart();

    }


    /* =====================================================
       ASSET BUTTONS
    ===================================================== */

    assetButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                updateAsset(button);

            }
        );

    });


    /* =====================================================
       UPDATE TRADE BUTTON
    ===================================================== */

    function updateTradeButton() {

        if (!placeTradeBtn) return;

        const assetName =
            selectedAsset.name
                .split("/")[0];

        placeTradeBtn.textContent =
            `${orderType === "buy" ? "Buy" : "Sell"} ${assetName}`;

        placeTradeBtn.classList.remove(
            "buy",
            "sell"
        );

        placeTradeBtn.classList.add(
            orderType
        );

    }


    /* =====================================================
       ORDER TYPE
    ===================================================== */

    orderTabs.forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                orderTabs.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


                tab.classList.add(
                    "active"
                );


                orderType =
                    tab.dataset.order === "sell"
                        ? "sell"
                        : "buy";


                updateTradeButton();

            }
        );

    });


    /* =====================================================
       UPDATE QUANTITY
    ===================================================== */

    function updateQuantity() {

        if (!estimatedQuantity) return;

        const amount =
            Number(
                tradeAmount?.value
            ) || 0;


        if (
            amount <= 0 ||
            selectedAsset.price <= 0
        ) {

            estimatedQuantity.textContent =
                "0.000000";

            return;

        }


        const quantity =
            amount /
            selectedAsset.price;


        estimatedQuantity.textContent =
            quantity.toFixed(6);

    }


    /* =====================================================
       TRADE AMOUNT INPUT
    ===================================================== */

    if (tradeAmount) {

        tradeAmount.addEventListener(
            "input",
            updateQuantity
        );

    }


    /* =====================================================
       TRADINGVIEW
    ===================================================== */

    function loadTradingChart() {

        const container =
            document.getElementById(
                "finriseTradingChart"
            );


        if (!container) return;


        if (
            typeof TradingView ===
            "undefined"
        ) {

            console.warn(
                "TradingView is not loaded yet."
            );

            return;

        }


        container.innerHTML = "";


        try {

            new TradingView.widget({

                width: "100%",

                height: 500,

                symbol:
                    selectedAsset.symbol,

                interval: "15",

                timezone:
                    "Etc/UTC",

                theme: "dark",

                style: "1",

                locale: "en",

                enable_publishing: false,

                allow_symbol_change: false,

                hide_side_toolbar: false,

                container_id:
                    "finriseTradingChart"

            });

        } catch (error) {

            console.error(
                "TradingView error:",
                error
            );

        }

    }


    /* =====================================================
       PLACE TRADE
    ===================================================== */

    if (placeTradeBtn) {

        placeTradeBtn.addEventListener(
            "click",
            () => {

                const amount =
                    Number(
                        tradeAmount?.value
                    );


                /* -----------------------------------------
                   VALIDATE AMOUNT
                ----------------------------------------- */

                if (
                    !Number.isFinite(amount) ||
                    amount <= 0
                ) {

                    alert(
                        "Please enter a valid trading amount."
                    );

                    tradeAmount?.focus();

                    return;

                }


                if (
                    amount < minimumTradeAmount
                ) {

                    alert(
                        `Minimum trade amount is ${formatMoney(minimumTradeAmount)}.`
                    );

                    tradeAmount?.focus();

                    return;

                }


                /* -----------------------------------------
                   CHECK ASSET PRICE
                ----------------------------------------- */

                if (
                    !Number.isFinite(
                        selectedAsset.price
                    ) ||
                    selectedAsset.price <= 0
                ) {

                    alert(
                        "The selected asset price is unavailable."
                    );

                    return;

                }


                /* -----------------------------------------
                   CHECK BALANCE FOR BUY
                ----------------------------------------- */

                const balance =
                    getBalance();


                if (
                    orderType === "buy" &&
                    amount > balance
                ) {

                    alert(
                        "Insufficient available balance."
                    );

                    return;

                }


                /* -----------------------------------------
                   CALCULATE QUANTITY
                ----------------------------------------- */

                const quantity =
                    amount /
                    selectedAsset.price;


                if (
                    !Number.isFinite(quantity) ||
                    quantity <= 0
                ) {

                    alert(
                        "Unable to calculate trade quantity."
                    );

                    return;

                }


                /* -----------------------------------------
                   CREATE TRADE
                ----------------------------------------- */

                const trade = {

                    id:
                        "TR-" +
                        Date.now(),

                    asset:
                        selectedAsset.name,

                    symbol:
                        selectedAsset.symbol,

                    type:
                        orderType,

                    amount:
                        amount,

                    quantity:
                        quantity,

                    price:
                        selectedAsset.price,

                    date:
                        new Date()
                            .toLocaleString(),

                    timestamp:
                        Date.now(),

                    status:
                        "Pending"

                };


                /* -----------------------------------------
                   GET EXISTING TRADES
                ----------------------------------------- */

                const trades =
                    getStorageArray(
                        "finriseTrades"
                    );


                trades.unshift(
                    trade
                );


                /* -----------------------------------------
                   SAVE TRADE
                ----------------------------------------- */

                const saved =
                    saveStorageArray(
                        "finriseTrades",
                        trades
                    );


                if (!saved) {

                    alert(
                        "Unable to save your trade. Please try again."
                    );

                    return;

                }


                /* -----------------------------------------
                   ADD TO GENERAL TRANSACTIONS
                ----------------------------------------- */

                const transactions =
                    getStorageArray(
                        "finriseTransactions"
                    );


                transactions.unshift({

                    id:
                        trade.id,

                    type:
                        "Trade",

                    asset:
                        trade.asset,

                    symbol:
                        trade.symbol,

                    tradeType:
                        trade.type,

                    amount:
                        trade.amount,

                    quantity:
                        trade.quantity,

                    price:
                        trade.price,

                    status:
                        "Pending",

                    date:
                        trade.date,

                    timestamp:
                        trade.timestamp

                });


                saveStorageArray(
                    "finriseTransactions",
                    transactions
                );


                /* -----------------------------------------
                   RESET FORM
                ----------------------------------------- */

                if (tradeAmount) {

                    tradeAmount.value = "";

                }


                updateQuantity();

                loadTradeHistory();


                /* -----------------------------------------
                   IMPORTANT
                   
                   Balance is NOT changed here because
                   the trade is still Pending.
                   
                   Your PHP/MySQL backend should later
                   approve/reject the trade.
                ----------------------------------------- */

                alert(
                    `${
                        orderType === "buy"
                            ? "Buy"
                            : "Sell"
                    } order submitted successfully.`
                );

            }
        );

    }


    /* =====================================================
       INVESTMENT PLANS
    ===================================================== */

    const investButtons =
        tradingSection.querySelectorAll(
            ".invest-btn"
        );


    investButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const plan =
                    button.dataset.plan ||
                    "Investment Plan";


                const minimum =
                    Number(
                        button.dataset.min
                    );


                const returnRate =
                    Number(
                        button.dataset.return
                    );


                const duration =
                    Number(
                        button.dataset.duration
                    );


                /* -----------------------------------------
                   VALIDATE PLAN
                ----------------------------------------- */

                if (
                    !Number.isFinite(minimum) ||
                    minimum <= 0
                ) {

                    alert(
                        "This investment plan is not configured correctly."
                    );

                    return;

                }


                if (
                    !Number.isFinite(returnRate) ||
                    returnRate < 0
                ) {

                    alert(
                        "This investment plan has an invalid return rate."
                    );

                    return;

                }


                if (
                    !Number.isFinite(duration) ||
                    duration <= 0
                ) {

                    alert(
                        "This investment plan has an invalid duration."
                    );

                    return;

                }


                /* -----------------------------------------
                   ENTER AMOUNT
                ----------------------------------------- */

                const amountText =
                    prompt(
                        `Enter amount for ${plan}.\nMinimum: ${formatMoney(minimum)}`
                    );


                if (
                    amountText === null
                ) {

                    return;

                }


                const amount =
                    Number(
                        amountText.trim()
                    );


                /* -----------------------------------------
                   VALIDATE AMOUNT
                ----------------------------------------- */

                if (
                    !Number.isFinite(amount) ||
                    amount <= 0
                ) {

                    alert(
                        "Please enter a valid investment amount."
                    );

                    return;

                }


                if (
                    amount < minimum
                ) {

                    alert(
                        `Minimum investment for ${plan} is ${formatMoney(minimum)}.`
                    );

                    return;

                }


                /* -----------------------------------------
                   CHECK BALANCE
                ----------------------------------------- */

                const balance =
                    getBalance();


                if (
                    amount > balance
                ) {

                    alert(
                        "Insufficient available balance."
                    );

                    return;

                }


                /* -----------------------------------------
                   CALCULATE EXPECTED RETURN
                ----------------------------------------- */

                const profit =
                    amount *
                    returnRate /
                    100;


                const expectedReturn =
                    amount +
                    profit;


                /* -----------------------------------------
                   CREATE INVESTMENT
                ----------------------------------------- */

                const investment = {

                    id:
                        "INV-" +
                        Date.now(),

                    plan:
                        plan,

                    amount:
                        amount,

                    returnRate:
                        returnRate,

                    profit:
                        profit,

                    expected:
                        expectedReturn,

                    duration:
                        duration,

                    date:
                        new Date()
                            .toLocaleDateString(),

                    timestamp:
                        Date.now(),

                    status:
                        "Pending"

                };


                /* -----------------------------------------
                   GET INVESTMENTS
                ----------------------------------------- */

                const investments =
                    getStorageArray(
                        "finriseInvestments"
                    );


                investments.unshift(
                    investment
                );


                /* -----------------------------------------
                   SAVE INVESTMENT
                ----------------------------------------- */

                const saved =
                    saveStorageArray(
                        "finriseInvestments",
                        investments
                    );


                if (!saved) {

                    alert(
                        "Unable to save your investment. Please try again."
                    );

                    return;

                }


                /* -----------------------------------------
                   ADD TO TRANSACTIONS
                ----------------------------------------- */

                const transactions =
                    getStorageArray(
                        "finriseTransactions"
                    );


                transactions.unshift({

                    id:
                        investment.id,

                    type:
                        "Investment",

                    plan:
                        investment.plan,

                    amount:
                        investment.amount,

                    returnRate:
                        investment.returnRate,

                    expected:
                        investment.expected,

                    duration:
                        investment.duration,

                    status:
                        "Pending",

                    date:
                        investment.date,

                    timestamp:
                        investment.timestamp

                });


                saveStorageArray(
                    "finriseTransactions",
                    transactions
                );


                loadInvestments();


                /* -----------------------------------------
                   IMPORTANT
                   
                   Pending investment does NOT deduct
                   balance in this frontend demo.
                   
                   Backend should handle this later.
                ----------------------------------------- */

                alert(
                    `${plan} investment request submitted successfully.`
                );

            }
        );

    });


    /* =====================================================
       LOAD INVESTMENTS
    ===================================================== */

    function loadInvestments() {

        if (!investmentsBody) return;


        const investments =
            getStorageArray(
                "finriseInvestments"
            );


        if (
            investments.length === 0
        ) {

            investmentsBody.innerHTML =
                "";


            if (noInvestments) {

                noInvestments.style.display =
                    "block";

            }

            return;

        }


        if (noInvestments) {

            noInvestments.style.display =
                "none";

        }


        investmentsBody.innerHTML =
            investments.map(
                investment => {

                    const plan =
                        escapeHTML(
                            investment.plan ||
                            "Investment"
                        );


                    const amount =
                        Number(
                            investment.amount
                        ) || 0;


                    const returnRate =
                        Number(
                            investment.returnRate
                        ) || 0;


                    const expected =
                        Number(
                            investment.expected
                        ) || 0;


                    const duration =
                        Number(
                            investment.duration
                        ) || 0;


                    const status =
                        String(
                            investment.status ||
                            "Pending"
                        );


                    const statusClass =
                        status
                            .toLowerCase()
                            .replace(/\s+/g, "-");


                    return `

                        <tr>

                            <td>
                                ${plan}
                            </td>

                            <td>
                                ${formatMoney(amount)}
                            </td>

                            <td>
                                ${returnRate}%
                            </td>

                            <td>
                                ${formatMoney(expected)}
                            </td>

                            <td>
                                ${duration} Days
                            </td>

                            <td>
                                <span class="status-${escapeHTML(statusClass)}">
                                    ${escapeHTML(status)}
                                </span>
                            </td>

                        </tr>

                    `;

                }
            ).join("");

    }


    /* =====================================================
       TRADE HISTORY
    ===================================================== */

    function loadTradeHistory() {

        if (!tradeHistoryBody) return;


        const trades =
            getStorageArray(
                "finriseTrades"
            );


        if (
            trades.length === 0
        ) {

            tradeHistoryBody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        style="
                            text-align:center;
                            color:#666;
                        "
                    >

                        No trades yet.

                    </td>

                </tr>

            `;

            return;

        }


        tradeHistoryBody.innerHTML =
            trades.map(
                trade => {

                    const id =
                        escapeHTML(
                            trade.id ||
                            "N/A"
                        );


                    const asset =
                        escapeHTML(
                            trade.asset ||
                            "Unknown"
                        );


                    const type =
                        trade.type === "sell"
                            ? "SELL"
                            : "BUY";


                    const amount =
                        Number(
                            trade.amount
                        ) || 0;


                    const price =
                        Number(
                            trade.price
                        ) || 0;


                    const date =
                        escapeHTML(
                            trade.date ||
                            "Unknown date"
                        );


                    const status =
                        String(
                            trade.status ||
                            "Pending"
                        );


                    const statusClass =
                        status
                            .toLowerCase()
                            .replace(/\s+/g, "-");


                    return `

                        <tr>

                            <td>
                                ${id}
                            </td>

                            <td>
                                ${asset}
                            </td>

                            <td>

                                <span class="trade-type-${type.toLowerCase()}">

                                    ${type}

                                </span>

                            </td>

                            <td>
                                ${formatMoney(amount)}
                            </td>

                            <td>
                                ${formatMoney(price)}
                            </td>

                            <td>

                                <span class="status-${escapeHTML(statusClass)}">

                                    ${escapeHTML(status)}

                                </span>

                                <br>

                                <small>
                                    ${date}
                                </small>

                            </td>

                        </tr>

                    `;

                }
            ).join("");

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    updateBalanceDisplay();

    updateTradeButton();

    loadInvestments();

    loadTradeHistory();


    /* =====================================================
       INITIAL ASSET
    ===================================================== */

    const activeAsset =
        tradingSection.querySelector(
            ".asset-btn.active"
        );


    if (activeAsset) {

        updateAsset(
            activeAsset
        );

    } else if (assetButtons.length > 0) {

        updateAsset(
            assetButtons[0]
        );

    }


    /* =====================================================
       INITIAL TRADINGVIEW LOAD
    ===================================================== */

    setTimeout(() => {

        loadTradingChart();

    }, 1000);


});