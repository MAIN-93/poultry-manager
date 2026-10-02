/* =========================================================
   POULTRY MANAGER
   Production Tracking v6
   Feed Management v2
   Reversible Feed Transactions
   ========================================================= */


/* =========================================================
   DOM REFERENCES
   ========================================================= */

const headerDate =
    document.getElementById("headerDate");

const todayEggs =
    document.getElementById("todayEggs");

const flockCount =
    document.getElementById("flockCount");

const layingRate =
    document.getElementById("layingRate");

const eggInput =
    document.getElementById("eggInput");

const addEggButton =
    document.getElementById("addEggButton");

const removeEggButton =
    document.getElementById("removeEggButton");

const eggHistory =
    document.getElementById("eggHistory");

const productionSummary =
    document.getElementById("productionSummary");

const productionTrend =
    document.getElementById("productionTrend");

const analyticsEggsPerHen =
    document.getElementById("analyticsEggsPerHen");

const analyticsAverage =
    document.getElementById("analyticsAverage");

const analyticsHighestDay =
    document.getElementById("analyticsHighestDay");

const analyticsHighestDayDate =
    document.getElementById("analyticsHighestDayDate");

const analyticsLowestDay =
    document.getElementById("analyticsLowestDay");

const analyticsLowestDayDate =
    document.getElementById("analyticsLowestDayDate");

const analyticsConsistency =
    document.getElementById("analyticsConsistency");

const analyticsChange =
    document.getElementById("analyticsChange");

const analyticsInsight =
    document.getElementById("analyticsInsight");


/* =========================================================
   FEED DOM REFERENCES
   ========================================================= */

const feedAmount =
    document.getElementById("feedAmount");

const feedInput =
    document.getElementById("feedInput");

const addFeedButton =
    document.getElementById("addFeedButton");

const useFeedInput =
    document.getElementById("useFeedInput");

const useFeedButton =
    document.getElementById("useFeedButton");

const resetFeedTodayButton =
    document.getElementById(
        "resetFeedTodayButton"
    );

const feedUsedToday =
    document.getElementById("feedUsedToday");

const feedDailyAverage =
    document.getElementById("feedDailyAverage");

const feedDaysRemaining =
    document.getElementById("feedDaysRemaining");

const feedDaysRemainingText =
    document.getElementById(
        "feedDaysRemainingText"
    );

const feedStatusBadge =
    document.getElementById(
        "feedStatusBadge"
    );

const feedStockPercentage =
    document.getElementById(
        "feedStockPercentage"
    );

const feedStockProgress =
    document.getElementById(
        "feedStockProgress"
    );

const feedSevenDayUsage =
    document.getElementById(
        "feedSevenDayUsage"
    );

const feedUsageDays =
    document.getElementById(
        "feedUsageDays"
    );

const feedPerBird =
    document.getElementById(
        "feedPerBird"
    );

const feedHistory =
    document.getElementById(
        "feedHistory"
    );

const feedChart =
    document.getElementById(
        "feedChart"
    );


/* =========================================================
   DATE HELPERS
   ========================================================= */

function getTodayKey() {

    const date =
        new Date();

    return (
        date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            date.getDate()
        ).padStart(2, "0")
    );

}

const today =
    getTodayKey();


function formatDate(dateKey) {

    const parts =
        dateKey.split("-");

    const date =
        new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );

    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric"
        }
    );

}


function formatFullDate(dateKey) {

    const parts =
        dateKey.split("-");

    const date =
        new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );

    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


/* =========================================================
   HEADER
   ========================================================= */

function displayHeaderDate() {

    if (!headerDate) {
        return;
    }

    const date =
        new Date();

    headerDate.textContent =
        date.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );

}


/* =========================================================
   EGG HISTORY
   ========================================================= */

function getEggHistory() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "eggHistory"
            )
        ) || {};

    } catch (error) {

        return {};

    }

}


function saveEggHistory(history) {

    localStorage.setItem(
        "eggHistory",
        JSON.stringify(history)
    );

}


function getTodayEggs() {

    const history =
        getEggHistory();

    return Number(
        history[today]
    ) || 0;

}


function saveTodayEggs(amount) {

    const history =
        getEggHistory();

    history[today] =
        Math.max(
            0,
            Number(amount) || 0
        );

    saveEggHistory(
        history
    );

}


/* =========================================================
   CURRENT DAY
   ========================================================= */

function updateCurrentDay() {

    const history =
        getEggHistory();

    if (
        typeof history[today] ===
        "undefined"
    ) {

        history[today] = 0;

        saveEggHistory(
            history
        );

    }

}


/* =========================================================
   DAILY ROLLOVER
   ========================================================= */

function checkDailyRollover() {

    const storedDate =
        localStorage.getItem(
            "poultryManagerDate"
        );

    if (
        storedDate !== today
    ) {

        localStorage.setItem(
            "poultryManagerDate",
            today
        );

        updateCurrentDay();

    }

}


/* =========================================================
   FLOCK
   ========================================================= */

function getFlockCount() {

    return Number(
        localStorage.getItem(
            "flockCount"
        )
    ) || 0;

}


function saveFlockCount(amount) {

    localStorage.setItem(
        "flockCount",
        String(
            Math.max(
                0,
                Number(amount) || 0
            )
        )
    );

}


/* =========================================================
   LAYING RATE
   ========================================================= */

function updateLayingRate() {

    if (!layingRate) {
        return;
    }

    const flock =
        getFlockCount();

    const eggs =
        getTodayEggs();

    if (
        flock <= 0
    ) {

        layingRate.textContent =
            "0%";

        return;

    }

    const rate =
        (
            eggs /
            flock
        ) *
        100;

    layingRate.textContent =
        `${Math.min(
            100,
            rate
        ).toFixed(0)}%`;

}


/* =========================================================
   EGG DISPLAY
   ========================================================= */

function updateEggDisplay() {

    const eggs =
        getTodayEggs();

    if (todayEggs) {

        todayEggs.textContent =
            eggs;

    }

    updateLayingRate();

}


/* =========================================================
   CHICKEN DISPLAY
   ========================================================= */

function updateChickenDisplay() {

    const flock =
        getFlockCount();

    if (flockCount) {

        flockCount.textContent =
            flock;

    }

    updateLayingRate();

    updateFeedManagement();

}


/* =========================================================
   EGG ACTIONS
   ========================================================= */

if (addEggButton) {

    addEggButton.addEventListener(
        "click",
        () => {

            const amount =
                Number(
                    eggInput.value
                );

            if (
                !Number.isFinite(
                    amount
                ) ||
                amount <= 0
            ) {

                return;

            }

            const current =
                getTodayEggs();

            saveTodayEggs(
                current +
                amount
            );

            eggInput.value =
                "";

            updateEggDisplay();

            displayEggHistory();

            updateProductionSummary();

            renderProductionTrend();

            updateProductionAnalytics();

        }
    );

}


if (removeEggButton) {

    removeEggButton.addEventListener(
        "click",
        () => {

            const amount =
                Number(
                    eggInput.value
                );

            if (
                !Number.isFinite(
                    amount
                ) ||
                amount <= 0
            ) {

                return;

            }

            const current =
                getTodayEggs();

            saveTodayEggs(
                Math.max(
                    0,
                    current - amount
                )
            );

            eggInput.value =
                "";

            updateEggDisplay();

            displayEggHistory();

            updateProductionSummary();

            renderProductionTrend();

            updateProductionAnalytics();

        }
    );

}


/* =========================================================
   EGG HISTORY DISPLAY
   ========================================================= */

function displayEggHistory() {

    if (!eggHistory) {
        return;
    }

    const history =
        getEggHistory();

    const entries =
        Object.entries(
            history
        )
        .filter(
            ([date, eggs]) =>
                Number(eggs) >= 0
        )
        .sort(
            (
                a,
                b
            ) =>
                b[0].localeCompare(
                    a[0]
                )
        );

    if (
        entries.length === 0
    ) {

        eggHistory.innerHTML =
            "<p>No egg history yet.</p>";

        return;

    }

    eggHistory.innerHTML =
        entries
            .slice(0, 7)
            .map(
                (
                    [date, eggs]
                ) => `
                    <div class="history-row">
                        <span>
                            ${formatFullDate(date)}
                        </span>

                        <strong>
                            ${eggs} eggs
                        </strong>
                    </div>
                `
            )
            .join("");

}


/* =========================================================
   PRODUCTION SUMMARY
   ========================================================= */

function updateProductionSummary() {

    if (!productionSummary) {
        return;
    }

    const history =
        getEggHistory();

    const values =
        Object.values(
            history
        )
        .map(
            value =>
                Number(value) || 0
        );

    const total =
        values.reduce(
            (
                sum,
                value
            ) =>
                sum + value,
            0
        );

    productionSummary.textContent =
        `${total} eggs`;

}


/* =========================================================
   PRODUCTION TREND
   ========================================================= */

function renderProductionTrend() {

    if (!productionTrend) {
        return;
    }

    const history =
        getEggHistory();

    const records = [];

    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date();

        date.setDate(
            date.getDate() - i
        );

        const dateKey =
            date.getFullYear() +
            "-" +
            String(
                date.getMonth() + 1
            ).padStart(2, "0") +
            "-" +
            String(
                date.getDate()
            ).padStart(2, "0");

        records.push({
            dateKey,
            eggs:
                Number(
                    history[dateKey]
                ) || 0
        });

    }

    const maxEggs =
        Math.max(
            ...records.map(
                record =>
                    record.eggs
            ),
            1
        );

    productionTrend.innerHTML =
        records
            .map(
                record => {

                    const height =
                        (
                            record.eggs /
                            maxEggs
                        ) *
                        100;

                    return `
                        <div class="trend-bar-wrap">

                            <div
                                class="trend-value"
                            >
                                ${record.eggs}
                            </div>

                            <div
                                class="trend-bar"
                                style="height:${height}%"
                            ></div>

                            <span>
                                ${formatDate(
                                    record.dateKey
                                )}
                            </span>

                        </div>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   PRODUCTION ANALYTICS
   ========================================================= */

function updateProductionAnalytics() {

    if (
        !analyticsEggsPerHen ||
        !analyticsAverage
    ) {

        return;

    }

    const history =
        getEggHistory();

    const records = [];

    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date();

        date.setDate(
            date.getDate() - i
        );

        const dateKey =
            date.getFullYear() +
            "-" +
            String(
                date.getMonth() + 1
            ).padStart(2, "0") +
            "-" +
            String(
                date.getDate()
            ).padStart(2, "0");

        records.push({
            dateKey,
            eggs:
                Number(
                    history[dateKey]
                ) || 0
        });

    }

    const totalEggs =
        records.reduce(
            (
                sum,
                record
            ) =>
                sum +
                record.eggs,
            0
        );

    const flock =
        getFlockCount();

    const averageDailyEggs =
        totalEggs / 7;

    const eggsPerHen =
        flock > 0
            ? averageDailyEggs / flock
            : 0;

    const highestRecord =
        records.reduce(
            (
                highest,
                record
            ) =>
                record.eggs >
                highest.eggs
                    ? record
                    : highest,
            records[0]
        );

    const lowestRecord =
        records.reduce(
            (
                lowest,
                record
            ) =>
                record.eggs <
                lowest.eggs
                    ? record
                    : lowest,
            records[0]
        );


    analyticsEggsPerHen.textContent =
        eggsPerHen.toFixed(2);

    analyticsAverage.textContent =
        averageDailyEggs.toFixed(2);

    analyticsHighestDay.textContent =
        highestRecord.eggs;

    analyticsHighestDayDate.textContent =
        highestRecord.eggs > 0
            ? formatFullDate(
                highestRecord.dateKey
            )
            : "—";

    analyticsLowestDay.textContent =
        lowestRecord.eggs;

    analyticsLowestDayDate.textContent =
        formatFullDate(
            lowestRecord.dateKey
        );


    let consistency =
        0;

    if (
        averageDailyEggs > 0
    ) {

        const variance =
            records.reduce(
                (
                    sum,
                    record
                ) =>
                    sum +
                    Math.pow(
                        record.eggs -
                        averageDailyEggs,
                        2
                    ),
                0
            ) / 7;

        const standardDeviation =
            Math.sqrt(
                variance
            );

        consistency =
            Math.max(
                0,
                Math.round(
                    100 -
                    (
                        standardDeviation /
                        averageDailyEggs
                    ) *
                    100
                )
            );

    }


    analyticsConsistency.textContent =
        `${consistency}%`;


    const firstHalf =
        records
            .slice(0, 3)
            .reduce(
                (
                    sum,
                    record
                ) =>
                    sum +
                    record.eggs,
                0
            );

    const secondHalf =
        records
            .slice(4)
            .reduce(
                (
                    sum,
                    record
                ) =>
                    sum +
                    record.eggs,
                0
            );


    let productionChange =
        0;

    if (
        firstHalf > 0
    ) {

        productionChange =
            Math.round(
                (
                    (
                        secondHalf -
                        firstHalf
                    ) /
                    firstHalf
                ) *
                100
            );

    }


    analyticsChange.textContent =
        `${productionChange >= 0 ? "+" : ""}${productionChange}%`;


    if (
        totalEggs === 0
    ) {

        analyticsInsight.textContent =
            "No production data yet.";

    }

    else if (
        productionChange > 0
    ) {

        analyticsInsight.textContent =
            "Egg production has increased compared with the earlier part of the seven-day period.";

    }

    else if (
        productionChange < 0
    ) {

        analyticsInsight.textContent =
            "Egg production has decreased compared with the earlier part of the seven-day period.";

    }

    else {

        analyticsInsight.textContent =
            "Egg production has remained relatively stable across the seven-day period.";

    }

}


/* =========================================================
   FEED STORAGE
   ========================================================= */

function getFeedAmount() {

    return Number(
        localStorage.getItem(
            "feed"
        )
    ) || 0;

}


function saveFeedAmount(amount) {

    localStorage.setItem(
        "feed",
        String(
            Math.max(
                0,
                amount
            )
        )
    );

}


/* =========================================================
   FEED USAGE HISTORY
   ========================================================= */

function getFeedUsageHistory() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "feedUsageHistory"
            )
        ) || {};

    } catch (error) {

        return {};

    }

}


function saveFeedUsageHistory(history) {

    localStorage.setItem(
        "feedUsageHistory",
        JSON.stringify(
            history
        )
    );

}


function getFeedUsage(dateKey) {

    const history =
        getFeedUsageHistory();

    return Number(
        history[dateKey]
    ) || 0;

}


function recordFeedUsage(amount) {

    const history =
        getFeedUsageHistory();

    history[today] =
        (
            Number(
                history[today]
            ) || 0
        ) +
        amount;

    saveFeedUsageHistory(
        history
    );

}


/* =========================================================
   FEED ANALYTICS
   ========================================================= */

function getFeedAnalytics() {

    const history =
        getFeedUsageHistory();

    const records = [];

    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date();

        date.setDate(
            date.getDate() - i
        );

        const dateKey =
            date.getFullYear() +
            "-" +
            String(
                date.getMonth() + 1
            ).padStart(2, "0") +
            "-" +
            String(
                date.getDate()
            ).padStart(2, "0");

        records.push({
            dateKey,
            usage:
                Number(
                    history[dateKey]
                ) || 0
        });

    }

    const totalUsage =
        records.reduce(
            (
                sum,
                record
            ) =>
                sum +
                record.usage,
            0
        );

    const usageDays =
        records.filter(
            record =>
                record.usage > 0
        ).length;

    const averageDailyUsage =
        usageDays > 0
            ? totalUsage /
              usageDays
            : 0;

    const flock =
        getFlockCount();

    const perBird =
        flock > 0
            ? (
                averageDailyUsage /
                flock
            ) *
            1000
            : 0;

    return {
        records,
        totalUsage,
        usageDays,
        averageDailyUsage,
        perBird
    };

}


/* =========================================================
   FEED STATUS
   ========================================================= */

function updateFeedStatus(
    stock,
    averageDailyUsage
) {

    if (
        !feedStatusBadge ||
        !feedStockProgress ||
        !feedStockPercentage
    ) {

        return;

    }

    if (
        stock <= 0
    ) {

        feedStatusBadge.textContent =
            "Out of feed";

        feedStatusBadge.className =
            "feed-status-badge feed-status-critical";

        feedStockPercentage.textContent =
            "0%";

        feedStockProgress.style.width =
            "0%";

        return;

    }

    if (
        averageDailyUsage <= 0
    ) {

        feedStatusBadge.textContent =
            "No usage data";

        feedStatusBadge.className =
            "feed-status-badge feed-status-neutral";

        feedStockPercentage.textContent =
            "—";

        feedStockProgress.style.width =
            "100%";

        return;

    }

    const daysRemaining =
        stock /
        averageDailyUsage;

    const percentage =
        Math.min(
            100,
            (
                daysRemaining /
                14
            ) *
            100
        );

    feedStockPercentage.textContent =
        `${Math.round(
            percentage
        )}%`;

    feedStockProgress.style.width =
        `${percentage}%`;


    if (
        daysRemaining <= 2
    ) {

        feedStatusBadge.textContent =
            "Critical";

        feedStatusBadge.className =
            "feed-status-badge feed-status-critical";

    }

    else if (
        daysRemaining <= 5
    ) {

        feedStatusBadge.textContent =
            "Running low";

        feedStatusBadge.className =
            "feed-status-badge feed-status-warning";

    }

    else {

        feedStatusBadge.textContent =
            "Healthy";

        feedStatusBadge.className =
            "feed-status-badge feed-status-good";

    }

}


/* =========================================================
   FEED CHART
   ========================================================= */

function renderFeedConsumptionChart(
    records
) {

    if (!feedChart) {
        return;
    }

    const maxUsage =
        Math.max(
            ...records.map(
                record =>
                    record.usage
            ),
            0.1
        );

    feedChart.innerHTML =
        records
            .map(
                record => {

                    const height =
                        (
                            record.usage /
                            maxUsage
                        ) *
                        100;

                    const todayClass =
                        record.dateKey === today
                            ? " today"
                            : "";

                    const zeroClass =
                        record.usage === 0
                            ? " zero"
                            : "";

                    return `
                        <div
                            class="feed-chart-bar-wrap"
                        >

                            <div
                                class="feed-chart-value"
                            >
                                ${
                                    record.usage
                                        .toFixed(1)
                                }
                            </div>

                            <div
                                class="feed-chart-bar${todayClass}${zeroClass}"
                                style="height:${height}%"
                            ></div>

                            <span>
                                ${
                                    formatDate(
                                        record.dateKey
                                    )
                                }
                            </span>

                        </div>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   FEED HISTORY
   ========================================================= */

function displayFeedHistory() {

    if (!feedHistory) {
        return;
    }

    const history =
        getFeedUsageHistory();

    const entries =
        Object.entries(
            history
        )
        .filter(
            ([date, usage]) =>
                Number(usage) > 0
        )
        .sort(
            (
                a,
                b
            ) =>
                b[0].localeCompare(
                    a[0]
                )
        );

    if (
        entries.length === 0
    ) {

        feedHistory.innerHTML =
            "<p>No feed usage recorded yet.</p>";

        return;

    }

    feedHistory.innerHTML =
        entries
            .slice(0, 5)
            .map(
                (
                    [date, usage]
                ) => `
                    <div class="history-row">

                        <span>
                            ${formatFullDate(date)}
                        </span>

                        <strong>
                            ${Number(
                                usage
                            ).toFixed(1)} kg
                        </strong>

                    </div>
                `
            )
            .join("");

}


/* =========================================================
   FEED MANAGEMENT
   ========================================================= */

function updateFeedManagement() {

    const stock =
        getFeedAmount();

    const analytics =
        getFeedAnalytics();

    const todayUsage =
        getFeedUsage(today);

    if (feedAmount) {

        feedAmount.textContent =
            `${stock.toFixed(1)} kg`;

    }

    if (feedUsedToday) {

        feedUsedToday.textContent =
            `${todayUsage.toFixed(1)} kg`;

    }

    if (feedDailyAverage) {

        feedDailyAverage.textContent =
            analytics.averageDailyUsage > 0
                ? `${analytics.averageDailyUsage.toFixed(2)} kg`
                : "—";

    }

    if (feedSevenDayUsage) {

        feedSevenDayUsage.textContent =
            `${analytics.totalUsage.toFixed(1)} kg`;

    }

    if (feedUsageDays) {

        feedUsageDays.textContent =
            analytics.usageDays;

    }

    if (feedPerBird) {

        feedPerBird.textContent =
            analytics.perBird > 0
                ? `${analytics.perBird.toFixed(0)} g`
                : "—";

    }


    if (feedDaysRemaining) {

        if (
            analytics.averageDailyUsage > 0
        ) {

            const daysRemaining =
                stock /
                analytics.averageDailyUsage;

            feedDaysRemaining.textContent =
                `${daysRemaining.toFixed(1)}`;

            if (feedDaysRemainingText) {

                feedDaysRemainingText.textContent =
                    "estimated days remaining";

            }

        }

        else {

            feedDaysRemaining.textContent =
                "—";

            if (feedDaysRemainingText) {

                feedDaysRemainingText.textContent =
                    "record usage to calculate";

            }

        }

    }


    updateFeedStatus(
        stock,
        analytics.averageDailyUsage
    );

    renderFeedConsumptionChart(
        analytics.records
    );

    displayFeedHistory();

}


/* =========================================================
   ADD FEED HANDLER
   ========================================================= */

if (addFeedButton) {

    addFeedButton.addEventListener(
        "click",
        () => {

            const amount =
                Number(
                    feedInput.value
                );

            if (
                !Number.isFinite(
                    amount
                ) ||
                amount <= 0
            ) {

                return;

            }

            const current =
                getFeedAmount();

            saveFeedAmount(
                current +
                amount
            );

            feedInput.value =
                "";

            updateFeedManagement();

        }
    );

}


/* =========================================================
   USE FEED HANDLER
   ========================================================= */

if (useFeedButton) {

    useFeedButton.addEventListener(
        "click",
        () => {

            const amount =
                Number(
                    useFeedInput.value
                );

            if (
                !Number.isFinite(
                    amount
                ) ||
                amount <= 0
            ) {

                return;

            }

            const current =
                getFeedAmount();

            if (
                current <= 0
            ) {

                return;

            }

            const actualUsage =
                Math.min(
                    amount,
                    current
                );

            saveFeedAmount(
                current -
                actualUsage
            );

            recordFeedUsage(
                actualUsage
            );

            useFeedInput.value =
                "";

            updateFeedManagement();

        }
    );

}


/* =========================================================
   RESET TODAY'S FEED USAGE
   ========================================================= */

if (resetFeedTodayButton) {

    resetFeedTodayButton.addEventListener(
        "click",
        () => {

            const history =
                getFeedUsageHistory();

            const todayUsage =
                Number(
                    history[today]
                ) || 0;

            if (
                todayUsage <= 0
            ) {

                return;

            }

            const confirmed =
                confirm(
                    "Reset today's feed usage? This will return today's recorded usage to your stock and recalculate your feed analytics."
                );

            if (
                !confirmed
            ) {

                return;

            }

            const currentStock =
                getFeedAmount();

            /*
             * Return today's recorded usage
             * back into the feed stock.
             */

            saveFeedAmount(
                currentStock +
                todayUsage
            );

            /*
             * Remove today's usage
             * from the usage history.
             */

            delete history[today];

            saveFeedUsageHistory(
                history
            );

            /*
             * Clear the usage input.
             */

            if (useFeedInput) {

                useFeedInput.value =
                    "";

            }

            /*
             * Recalculate everything.
             */

            updateFeedManagement();

        }
    );

}


/* =========================================================
   FEED SCHEDULE
   ========================================================= */

function loadFeedSchedule() {

    const morning =
        localStorage.getItem(
            "morningFeedTime"
        ) || "07:00";

    const afternoon =
        localStorage.getItem(
            "afternoonFeedTime"
        ) || "14:00";

    const morningInput =
        document.getElementById(
            "morningFeedTime"
        );

    const afternoonInput =
        document.getElementById(
            "afternoonFeedTime"
        );

    if (morningInput) {

        morningInput.value =
            morning;

    }

    if (afternoonInput) {

        afternoonInput.value =
            afternoon;

    }

}


/* =========================================================
   NEXT FEED
   ========================================================= */

function formatTime(time) {

    const parts =
        time.split(":");

    let hour =
        Number(parts[0]);

    const minute =
        parts[1];

    const suffix =
        hour >= 12
            ? "PM"
            : "AM";

    hour =
        hour % 12 ||
        12;

    return `${hour}:${minute} ${suffix}`;

}


function updateNextFeed() {

    const nextFeed =
        document.getElementById(
            "nextFeed"
        );

    if (!nextFeed) {
        return;
    }

    const morning =
        localStorage.getItem(
            "morningFeedTime"
        ) || "07:00";

    const afternoon =
        localStorage.getItem(
            "afternoonFeedTime"
        ) || "14:00";

    const now =
        new Date();

    const times = [
        morning,
        afternoon
    ];

    let nextTime =
        null;

    times.forEach(
        time => {

            const parts =
                time.split(":");

            const candidate =
                new Date(now);

            candidate.setHours(
                Number(parts[0]),
                Number(parts[1]),
                0,
                0
            );

            if (
                candidate <= now
            ) {

                candidate.setDate(
                    candidate.getDate() + 1
                );

            }

            if (
                !nextTime ||
                candidate < nextTime
            ) {

                nextTime =
                    candidate;

            }

        }
    );

    if (nextTime) {

        const difference =
            nextTime.getTime() -
            now.getTime();

        const minutes =
            Math.floor(
                difference /
                60000
            );

        const hours =
            Math.floor(
                minutes /
                60
            );

        const remainingMinutes =
            minutes %
            60;

        nextFeed.textContent =
            `${formatTime(
                nextTime
                    .getHours()
                    .toString()
                    .padStart(2, "0") +
                ":" +
                nextTime
                    .getMinutes()
                    .toString()
                    .padStart(2, "0")
            )} • ${
                hours
            }h ${
                remainingMinutes
            }m`;

    }

}


/* =========================================================
   FEED ALARM
   ========================================================= */

function updateAlarmDisplay() {

    const alarmToggle =
        document.getElementById(
            "feedAlarmToggle"
        );

    if (!alarmToggle) {
        return;
    }

    const enabled =
        localStorage.getItem(
            "alarmEnabled"
        ) === "true";

    alarmToggle.checked =
        enabled;

}


function checkFeedAlarm() {

    const enabled =
        localStorage.getItem(
            "alarmEnabled"
        ) === "true";

    if (!enabled) {
        return;
    }

    const now =
        new Date();

    const currentTime =
        now.getHours()
            .toString()
            .padStart(2, "0") +
        ":" +
        now.getMinutes()
            .toString()
            .padStart(2, "0");

    const morning =
        localStorage.getItem(
            "morningFeedTime"
        ) || "07:00";

    const afternoon =
        localStorage.getItem(
            "afternoonFeedTime"
        ) || "14:00";

    if (
        currentTime === morning ||
        currentTime === afternoon
    ) {

        const alarmKey =
            `feedAlarm_${today}_${currentTime}`;

        if (
            localStorage.getItem(
                alarmKey
            ) === "true"
        ) {

            return;

        }

        localStorage.setItem(
            alarmKey,
            "true"
        );

        triggerFeedAlarm();

    }

}


function triggerFeedAlarm() {

    if (
        "Notification" in window &&
        Notification.permission ===
            "granted"
    ) {

        new Notification(
            "Poultry Manager",
            {
                body:
                    "It's time to feed your flock."
            }
        );

    }

}


/* =========================================================
   SERVICE WORKER
   ========================================================= */

function registerServiceWorker() {

    if (
        "serviceWorker" in navigator
    ) {

        navigator.serviceWorker
            .register(
                "/sw.js"
            )
            .catch(
                error => {

                    console.log(
                        "Service worker registration failed:",
                        error
                    );

                }
            );

    }

}


/* =========================================================
   NOTIFICATION SETUP
   ========================================================= */

const notificationButton =
    document.getElementById(
        "notificationButton"
    );


if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        async () => {

            if (
                !(
                    "Notification" in
                    window
                )
            ) {

                return;

            }

            const permission =
                await Notification.requestPermission();

            if (
                permission !==
                "granted"
            ) {

                return;

            }

            localStorage.setItem(
                "notificationsEnabled",
                "true"
            );

        }
    );

}


/* =========================================================
   ALARM TOGGLE
   ========================================================= */

const feedAlarmToggle =
    document.getElementById(
        "feedAlarmToggle"
    );


if (feedAlarmToggle) {

    feedAlarmToggle.addEventListener(
        "change",
        () => {

            localStorage.setItem(
                "alarmEnabled",
                String(
                    feedAlarmToggle.checked
                )
            );

        }
    );

}


/* =========================================================
   FEED SCHEDULE SAVE
   ========================================================= */

const saveFeedScheduleButton =
    document.getElementById(
        "saveFeedScheduleButton"
    );


if (saveFeedScheduleButton) {

    saveFeedScheduleButton.addEventListener(
        "click",
        () => {

            const morningInput =
                document.getElementById(
                    "morningFeedTime"
                );

            const afternoonInput =
                document.getElementById(
                    "afternoonFeedTime"
                );

            if (morningInput) {

                localStorage.setItem(
                    "morningFeedTime",
                    morningInput.value
                );

            }

            if (afternoonInput) {

                localStorage.setItem(
                    "afternoonFeedTime",
                    afternoonInput.value
                );

            }

            updateNextFeed();

        }
    );

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

checkDailyRollover();

updateCurrentDay();

displayHeaderDate();

updateEggDisplay();

updateChickenDisplay();

updateFeedManagement();

displayEggHistory();

updateProductionSummary();

renderProductionTrend();

updateProductionAnalytics();

loadFeedSchedule();

updateAlarmDisplay();

updateNextFeed();

registerServiceWorker();


/* =========================================================
   LIVE UPDATES
   ========================================================= */

setInterval(
    () => {

        checkFeedAlarm();

        updateNextFeed();

    },
    1000
);