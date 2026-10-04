/* =========================================================
   POULTRY MANAGER
   Complete Production + Feed Management
   ========================================================= */


/* =========================================================
   DOM REFERENCES
   ========================================================= */

/* Header */

const headerDate =
    document.getElementById("headerDate");


/* Overview */

const birdCount =
    document.getElementById("birdCount");

const overviewEggCount =
    document.getElementById("overviewEggCount");

const overviewLayingRate =
    document.getElementById("overviewLayingRate");

const overviewFeedAmount =
    document.getElementById("overviewFeedAmount");


/* Production Summary */

const sevenDayEggs =
    document.getElementById("sevenDayEggs");

const averageLayingRate =
    document.getElementById("averageLayingRate");

const bestProductionDay =
    document.getElementById("bestProductionDay");

const bestProductionEggs =
    document.getElementById("bestProductionEggs");


/* Production Trend */

const trendMaxLabel =
    document.getElementById("trendMaxLabel");

const trendMidLabel =
    document.getElementById("trendMidLabel");

const productionTrendChart =
    document.getElementById(
        "productionTrendChart"
    );


/* Production Analytics */

const analyticsEggsPerHen =
    document.getElementById(
        "analyticsEggsPerHen"
    );

const analyticsAverage =
    document.getElementById(
        "analyticsAverage"
    );

const analyticsHighestDay =
    document.getElementById(
        "analyticsHighestDay"
    );

const analyticsHighestDayDate =
    document.getElementById(
        "analyticsHighestDayDate"
    );

const analyticsLowestDay =
    document.getElementById(
        "analyticsLowestDay"
    );

const analyticsLowestDayDate =
    document.getElementById(
        "analyticsLowestDayDate"
    );

const analyticsConsistency =
    document.getElementById(
        "analyticsConsistency"
    );

const analyticsChange =
    document.getElementById(
        "analyticsChange"
    );

const analyticsInsight =
    document.getElementById(
        "analyticsInsight"
    );


/* Egg Production */

const eggCount =
    document.getElementById("eggCount");

const layingRate =
    document.getElementById("layingRate");

const addEggButton =
    document.getElementById(
        "addEggButton"
    );

const removeEggButton =
    document.getElementById(
        "removeEggButton"
    );

const viewHistoryButton =
    document.getElementById(
        "viewHistoryButton"
    );

const eggHistoryList =
    document.getElementById(
        "eggHistoryList"
    );


/* Feed */

const feedAmount =
    document.getElementById(
        "feedAmount"
    );

const feedInput =
    document.getElementById(
        "feedInput"
    );

const addFeedButton =
    document.getElementById(
        "addFeedButton"
    );

const useFeedInput =
    document.getElementById(
        "useFeedInput"
    );

const useFeedButton =
    document.getElementById(
        "useFeedButton"
    );

const resetFeedTodayButton =
    document.getElementById(
        "resetFeedTodayButton"
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

const feedUsedToday =
    document.getElementById(
        "feedUsedToday"
    );

const feedDailyAverage =
    document.getElementById(
        "feedDailyAverage"
    );

const feedDaysRemaining =
    document.getElementById(
        "feedDaysRemaining"
    );

const feedDaysRemainingText =
    document.getElementById(
        "feedDaysRemainingText"
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

const feedConsumptionChart =
    document.getElementById(
        "feedConsumptionChart"
    );

const viewFeedHistoryButton =
    document.getElementById(
        "viewFeedHistoryButton"
    );

const feedHistoryList =
    document.getElementById(
        "feedHistoryList"
    );


/* Feed Schedule */

const morningFeedTime =
    document.getElementById(
        "morningFeedTime"
    );

const afternoonFeedTime =
    document.getElementById(
        "afternoonFeedTime"
    );

const saveScheduleButton =
    document.getElementById(
        "saveScheduleButton"
    );

const scheduleStatus =
    document.getElementById(
        "scheduleStatus"
    );

const nextFeedCountdown =
    document.getElementById(
        "nextFeedCountdown"
    );

const nextFeed =
    document.getElementById(
        "nextFeed"
    );


/* Flock */

const chickenCount =
    document.getElementById(
        "chickenCount"
    );

const addChicken =
    document.getElementById(
        "addChicken"
    );

const removeChicken =
    document.getElementById(
        "removeChicken"
    );

const flockInput =
    document.getElementById(
        "flockInput"
    );

const setFlockButton =
    document.getElementById(
        "setFlockButton"
    );


/* Alarm */

const alarmStatus =
    document.getElementById(
        "alarmStatus"
    );

const alarmMessage =
    document.getElementById(
        "alarmMessage"
    );

const alarmButton =
    document.getElementById(
        "alarmButton"
    );


/* Notifications */

const enableNotifications =
    document.getElementById(
        "enableNotifications"
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


function getDateKeyFromDate(
    date
) {

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


function formatDate(
    dateKey
) {

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


function formatFullDate(
    dateKey
) {

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
   EGG STORAGE
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


function saveEggHistory(
    history
) {

    localStorage.setItem(
        "eggHistory",
        JSON.stringify(
            history
        )
    );

}


function getTodayEggs() {

    const history =
        getEggHistory();

    return Number(
        history[today]
    ) || 0;

}


function saveTodayEggs(
    amount
) {

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
   FLOCK STORAGE
   ========================================================= */

function getFlockCount() {

    return Number(
        localStorage.getItem(
            "flockCount"
        )
    ) || 0;

}


function saveFlockCount(
    amount
) {

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
   FEED STORAGE
   ========================================================= */

function getFeedAmount() {

    return Number(
        localStorage.getItem(
            "feed"
        )
    ) || 0;

}


function saveFeedAmount(
    amount
) {

    localStorage.setItem(
        "feed",
        String(
            Math.max(
                0,
                Number(amount) || 0
            )
        )
    );

}


/* =========================================================
   FEED ADDITION HISTORY
   ========================================================= */

function getFeedAdditionHistory() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "feedAdditionHistory"
            )
        ) || [];

    } catch (error) {

        return [];

    }

}


function saveFeedAdditionHistory(
    history
) {

    localStorage.setItem(
        "feedAdditionHistory",
        JSON.stringify(
            history
        )
    );

}


function getLastFeedAddition() {

    const history =
        getFeedAdditionHistory();

    if (
        !Array.isArray(history) ||
        history.length === 0
    ) {

        return null;

    }

    return history[
        history.length - 1
    ];

}


function recordFeedAddition(
    amount,
    stockBefore,
    stockAfter
) {

    const history =
        getFeedAdditionHistory();

    history.push({
        amount: Number(amount),
        stockBefore: Number(stockBefore),
        stockAfter: Number(stockAfter),
        timestamp: new Date().toISOString()
    });

    /* Keep the local history compact. */

    if (
        history.length > 20
    ) {

        history.splice(
            0,
            history.length - 20
        );

    }

    saveFeedAdditionHistory(
        history
    );

}


function clearLastFeedAddition() {

    const history =
        getFeedAdditionHistory();

    if (
        history.length === 0
    ) {

        return;

    }

    history.pop();

    saveFeedAdditionHistory(
        history
    );

}


/* =========================================================
   FEED USAGE STORAGE
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


function saveFeedUsageHistory(
    history
) {

    localStorage.setItem(
        "feedUsageHistory",
        JSON.stringify(
            history
        )
    );

}


function getFeedUsage(
    dateKey
) {

    const history =
        getFeedUsageHistory();

    return Number(
        history[dateKey]
    ) || 0;

}


function recordFeedUsage(
    amount
) {

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
   EGG DISPLAY
   ========================================================= */

function updateEggDisplay() {

    const eggs =
        getTodayEggs();

    const flock =
        getFlockCount();

    if (eggCount) {

        eggCount.textContent =
            eggs;

    }

    if (overviewEggCount) {

        overviewEggCount.textContent =
            eggs;

    }

    let rate = 0;

    if (
        flock > 0
    ) {

        rate =
            (
                eggs /
                flock
            ) *
            100;

    }

    rate =
        Math.min(
            100,
            rate
        );

    if (layingRate) {

        layingRate.textContent =
            `${rate.toFixed(0)}%`;

    }

    if (overviewLayingRate) {

        overviewLayingRate.textContent =
            `${rate.toFixed(0)}%`;

    }

}


/* =========================================================
   FLOCK DISPLAY
   ========================================================= */

function updateFlockDisplay() {

    const flock =
        getFlockCount();

    if (birdCount) {

        birdCount.textContent =
            flock;

    }

    if (chickenCount) {

        chickenCount.textContent =
            flock;

    }

    updateEggDisplay();

    updateProductionSummary();

    updateProductionAnalytics();

    updateFeedManagement();

}


/* =========================================================
   EGG ACTIONS
   ========================================================= */

if (addEggButton) {

    addEggButton.addEventListener(
        "click",
        () => {

            const current =
                getTodayEggs();

            saveTodayEggs(
                current + 1
            );

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

            const current =
                getTodayEggs();

            if (
                current <= 0
            ) {

                return;

            }

            saveTodayEggs(
                current - 1
            );

            updateEggDisplay();

            displayEggHistory();

            updateProductionSummary();

            renderProductionTrend();

            updateProductionAnalytics();

        }
    );

}


/* =========================================================
   EGG HISTORY
   ========================================================= */

let showAllEggHistory =
    false;


function displayEggHistory() {

    if (!eggHistoryList) {
        return;
    }

    const history =
        getEggHistory();

    const entries =
        Object.entries(
            history
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

        eggHistoryList.innerHTML =
            `
            <div class="empty-state">
                No egg history yet.
            </div>
            `;

        return;

    }

    const visibleEntries =
        showAllEggHistory
            ? entries
            : entries.slice(
                0,
                7
            );

    eggHistoryList.innerHTML =
        visibleEntries
            .map(
                (
                    [
                        date,
                        eggs
                    ]
                ) => `
                    <div class="history-item">

                        <div>
                            <strong>
                                ${formatFullDate(
                                    date
                                )}
                            </strong>

                            <small>
                                Egg production
                            </small>
                        </div>

                        <div>
                            <strong>
                                ${Number(
                                    eggs
                                )} eggs
                            </strong>
                        </div>

                    </div>
                `
            )
            .join("");

}


if (viewHistoryButton) {

    viewHistoryButton.addEventListener(
        "click",
        () => {

            showAllEggHistory =
                !showAllEggHistory;

            viewHistoryButton.textContent =
                showAllEggHistory
                    ? "Show Less"
                    : "View All History";

            displayEggHistory();

        }
    );

}


/* =========================================================
   PRODUCTION SUMMARY
   ========================================================= */

function getLastSevenDays() {

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
            getDateKeyFromDate(
                date
            );

        records.push({
            dateKey,
            eggs:
                Number(
                    history[dateKey]
                ) || 0
        });

    }

    return records;

}


function updateProductionSummary() {

    const records =
        getLastSevenDays();

    const flock =
        getFlockCount();

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

    const averageDaily =
        totalEggs / 7;

    const averageRate =
        flock > 0
            ? (
                averageDaily /
                flock
            ) *
            100
            : 0;

    const bestRecord =
        records.reduce(
            (
                best,
                record
            ) =>
                record.eggs >
                best.eggs
                    ? record
                    : best,
            records[0]
        );


    if (sevenDayEggs) {

        sevenDayEggs.textContent =
            totalEggs;

    }

    if (averageLayingRate) {

        averageLayingRate.textContent =
            `${Math.min(
                100,
                averageRate
            ).toFixed(0)}%`;

    }

    if (bestProductionDay) {

        bestProductionDay.textContent =
            bestRecord.eggs > 0
                ? formatDate(
                    bestRecord.dateKey
                )
                : "—";

    }

    if (bestProductionEggs) {

        bestProductionEggs.textContent =
            bestRecord.eggs;

    }

}


/* =========================================================
   PRODUCTION TREND
   ========================================================= */

function renderProductionTrend() {

    if (!productionTrendChart) {
        return;
    }

    const records =
        getLastSevenDays();

    const maxEggs =
        Math.max(
            ...records.map(
                record =>
                    record.eggs
            ),
            1
        );

    const midValue =
        Math.ceil(
            maxEggs / 2
        );

    if (trendMaxLabel) {

        trendMaxLabel.textContent =
            maxEggs;

    }

    if (trendMidLabel) {

        trendMidLabel.textContent =
            midValue;

    }

    productionTrendChart.innerHTML =
        records
            .map(
                record => {

                    const height =
                        (
                            record.eggs /
                            maxEggs
                        ) *
                        100;

                    const zeroClass =
                        record.eggs === 0
                            ? " zero"
                            : "";

                    const todayClass =
                        record.dateKey === today
                            ? " today"
                            : "";

                    return `
                        <div
                            class="trend-column"
                        >

                            <div
                                class="trend-bar-container"
                            >

                                <div
                                    class="trend-bar${zeroClass}"
                                    style="height:${Math.max(
                                        3,
                                        height
                                    )}%"
                                >

                                    <span
                                        class="trend-bar-value"
                                    >
                                        ${record.eggs}
                                    </span>

                                </div>

                            </div>

                            <div
                                class="trend-day${todayClass}"
                            >
                                ${formatDate(
                                    record.dateKey
                                )}
                            </div>

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

    const records =
        getLastSevenDays();

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
            ? averageDailyEggs /
              flock
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


    if (analyticsEggsPerHen) {

        analyticsEggsPerHen.textContent =
            eggsPerHen.toFixed(2);

    }

    if (analyticsAverage) {

        analyticsAverage.textContent =
            averageDailyEggs.toFixed(2);

    }

    if (analyticsHighestDay) {

        analyticsHighestDay.textContent =
            highestRecord.eggs;

    }

    if (analyticsHighestDayDate) {

        analyticsHighestDayDate.textContent =
            highestRecord.eggs > 0
                ? formatFullDate(
                    highestRecord.dateKey
                )
                : "No data";

    }

    if (analyticsLowestDay) {

        analyticsLowestDay.textContent =
            lowestRecord.eggs;

    }

    if (analyticsLowestDayDate) {

        analyticsLowestDayDate.textContent =
            lowestRecord.eggs > 0
                ? formatFullDate(
                    lowestRecord.dateKey
                )
                : "No data";

    }


    /* Consistency */

    let consistency =
        0;

    const producingDays =
        records.filter(
            record =>
                record.eggs > 0
        ).length;

    if (
        producingDays > 0
    ) {

        consistency =
            Math.round(
                (
                    producingDays /
                    7
                ) *
                100
            );

    }

    if (analyticsConsistency) {

        analyticsConsistency.textContent =
            `${consistency}%`;

    }


    /* Production Change */

    const firstHalf =
        records
            .slice(
                0,
                3
            )
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
            .slice(
                4
            )
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

    if (analyticsChange) {

        analyticsChange.textContent =
            `${
                productionChange >= 0
                    ? "+"
                    : ""
            }${productionChange}%`;

    }


    /* Insight */

    if (analyticsInsight) {

        if (
            totalEggs === 0
        ) {

            analyticsInsight.textContent =
                "Start recording eggs to see production insights.";

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
            getDateKeyFromDate(
                date
            );

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
        !feedStatusBadge
    ) {

        return;

    }

    if (
        stock <= 0
    ) {

        feedStatusBadge.textContent =
            "Out of feed";

        feedStatusBadge.className =
            "feed-status-badge feed-status-empty";

        if (feedStockPercentage) {

            feedStockPercentage.textContent =
                "0%";

        }

        if (feedStockProgress) {

            feedStockProgress.style.width =
                "0%";

        }

        return;

    }


    if (
        averageDailyUsage <= 0
    ) {

        feedStatusBadge.textContent =
            "No usage data";

        feedStatusBadge.className =
            "feed-status-badge feed-status-neutral";

        if (feedStockPercentage) {

            feedStockPercentage.textContent =
                "—";

        }

        if (feedStockProgress) {

            feedStockProgress.style.width =
                "100%";

        }

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


    if (feedStockPercentage) {

        feedStockPercentage.textContent =
            `${Math.round(
                percentage
            )}%`;

    }

    if (feedStockProgress) {

        feedStockProgress.style.width =
            `${percentage}%`;

    }


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

    if (
        !feedConsumptionChart
    ) {

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

    feedConsumptionChart.innerHTML =
        records
            .map(
                record => {

                    const height =
                        (
                            record.usage /
                            maxUsage
                        ) *
                        100;

                    const zeroClass =
                        record.usage === 0
                            ? " zero"
                            : "";

                    const todayClass =
                        record.dateKey === today
                            ? " today"
                            : "";

                    return `
                        <div
                            class="feed-chart-column"
                        >

                            <div
                                class="feed-chart-bar-area"
                            >

                                <div
                                    class="feed-chart-bar${zeroClass}"
                                    style="height:${Math.max(
                                        3,
                                        height
                                    )}%"
                                >

                                    <span
                                        class="feed-chart-value"
                                    >
                                        ${record.usage.toFixed(
                                            1
                                        )}
                                    </span>

                                </div>

                            </div>

                            <div
                                class="feed-chart-day${todayClass}"
                            >
                                ${formatDate(
                                    record.dateKey
                                )}
                            </div>

                        </div>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   FEED HISTORY
   ========================================================= */

let showAllFeedHistory =
    false;


function displayFeedHistory() {

    if (
        !feedHistoryList
    ) {

        return;

    }

    const history =
        getFeedUsageHistory();

    const entries =
        Object.entries(
            history
        )
        .filter(
            (
                [
                    date,
                    usage
                ]
            ) =>
                Number(
                    usage
                ) > 0
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

        feedHistoryList.innerHTML =
            `
            <div class="empty-state">
                No feed usage recorded yet.
            </div>
            `;

        return;

    }


    const visibleEntries =
        showAllFeedHistory
            ? entries
            : entries.slice(
                0,
                5
            );


    feedHistoryList.innerHTML =
        visibleEntries
            .map(
                (
                    [
                        date,
                        usage
                    ]
                ) => `
                    <div
                        class="feed-history-item"
                    >

                        <div
                            class="feed-history-main"
                        >

                            <strong>
                                ${formatFullDate(
                                    date
                                )}
                            </strong>

                            <small>
                                Feed consumption
                            </small>

                        </div>

                        <div
                            class="feed-history-amount"
                        >

                            <strong>
                                ${Number(
                                    usage
                                ).toFixed(
                                    1
                                )} kg
                            </strong>

                            <small>
                                recorded
                            </small>

                        </div>

                    </div>
                `
            )
            .join("");

}


if (
    viewFeedHistoryButton
) {

    viewFeedHistoryButton.addEventListener(
        "click",
        () => {

            showAllFeedHistory =
                !showAllFeedHistory;

            viewFeedHistoryButton.textContent =
                showAllFeedHistory
                    ? "Show Less"
                    : "View All";

            displayFeedHistory();

        }
    );

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
        getFeedUsage(
            today
        );


    /* Overview feed */

    if (
        overviewFeedAmount
    ) {

        overviewFeedAmount.textContent =
            `${stock.toFixed(
                1
            )} kg`;

    }


    /* Main stock */

    if (
        feedAmount
    ) {

        feedAmount.textContent =
            `${stock.toFixed(
                1
            )} kg`;

    }


    /* Used today */

    if (
        feedUsedToday
    ) {

        feedUsedToday.textContent =
            `${todayUsage.toFixed(
                1
            )} kg`;

    }


    /* Daily average */

    if (
        feedDailyAverage
    ) {

        feedDailyAverage.textContent =
            analytics.averageDailyUsage > 0
                ? `${analytics.averageDailyUsage.toFixed(
                    2
                )} kg`
                : "—";

    }


    /* 7-day usage */

    if (
        feedSevenDayUsage
    ) {

        feedSevenDayUsage.textContent =
            `${analytics.totalUsage.toFixed(
                1
            )} kg`;

    }


    /* Usage days */

    if (
        feedUsageDays
    ) {

        feedUsageDays.textContent =
            analytics.usageDays;

    }


    /* Per bird */

    if (
        feedPerBird
    ) {

        feedPerBird.textContent =
            analytics.perBird > 0
                ? `${analytics.perBird.toFixed(
                    0
                )} g`
                : "—";

    }


    /* Days remaining */

    if (
        feedDaysRemaining
    ) {

        if (
            analytics.averageDailyUsage > 0
        ) {

            const daysRemaining =
                stock /
                analytics.averageDailyUsage;

            feedDaysRemaining.textContent =
                daysRemaining.toFixed(
                    1
                );

            if (
                feedDaysRemainingText
            ) {

                feedDaysRemainingText.textContent =
                    "estimated days remaining";

            }

        }

        else {

            feedDaysRemaining.textContent =
                "—";

            if (
                feedDaysRemainingText
            ) {

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

    updateUndoLastFeedButton();

}


/* =========================================================
   ADD FEED + UNDO LAST ADDITION + RESET FEED STOCK
   ========================================================= */

let undoLastFeedButton =
    null;

let resetFeedStockButton =
    null;


/* =========================================================
   CREATE UNDO BUTTON
   ========================================================= */

function createUndoLastFeedButton() {

    if (
        !addFeedButton ||
        undoLastFeedButton
    ) {

        return;

    }

    undoLastFeedButton =
        document.createElement(
            "button"
        );

    undoLastFeedButton.type =
        "button";

    undoLastFeedButton.className =
        "feed-reset-button";

    undoLastFeedButton.textContent =
        "↶ Undo Last Addition";

    undoLastFeedButton.setAttribute(
        "aria-label",
        "Undo last feed addition"
    );

    undoLastFeedButton.addEventListener(
        "click",
        undoLastFeedAddition
    );

    addFeedButton.insertAdjacentElement(
        "afterend",
        undoLastFeedButton
    );

}


/* =========================================================
   CREATE RESET STOCK BUTTON
   ========================================================= */

function createResetFeedStockButton() {

    if (
        !addFeedButton ||
        resetFeedStockButton
    ) {

        return;

    }

    resetFeedStockButton =
        document.createElement(
            "button"
        );

    resetFeedStockButton.type =
        "button";

    resetFeedStockButton.className =
        "feed-reset-button";

    resetFeedStockButton.textContent =
        "🗑 Reset Feed Stock";

    resetFeedStockButton.setAttribute(
        "aria-label",
        "Reset entire feed stock"
    );

    resetFeedStockButton.addEventListener(
        "click",
        resetFeedStock
    );


    /*
     * Put the reset button directly
     * after the Undo button.
     */

    if (
        undoLastFeedButton
    ) {

        undoLastFeedButton.insertAdjacentElement(
            "afterend",
            resetFeedStockButton
        );

    }

    else {

        addFeedButton.insertAdjacentElement(
            "afterend",
            resetFeedStockButton
        );

    }

}


/* =========================================================
   UPDATE UNDO BUTTON
   ========================================================= */

function updateUndoLastFeedButton() {

    if (
        !undoLastFeedButton
    ) {

        return;

    }

    const lastAddition =
        getLastFeedAddition();

    const currentStock =
        getFeedAmount();

    const canUndo =
        !!lastAddition &&
        Math.abs(
            currentStock -
            Number(lastAddition.stockAfter)
        ) < 0.000001;


    undoLastFeedButton.disabled =
        !canUndo;


    undoLastFeedButton.title =
        canUndo
            ? `Undo ${Number(
                lastAddition.amount
            ).toFixed(
                1
            )} kg feed addition`
            : "Add feed first to enable undo";


    undoLastFeedButton.textContent =
        canUndo
            ? `↶ Undo Last Addition (${Number(
                lastAddition.amount
            ).toFixed(
                1
            )} kg)`
            : "↶ Undo Last Addition";

}


/* =========================================================
   UNDO LAST FEED ADDITION
   ========================================================= */

function undoLastFeedAddition() {

    const lastAddition =
        getLastFeedAddition();


    if (
        !lastAddition
    ) {

        return;

    }


    const currentStock =
        getFeedAmount();

    const expectedStock =
        Number(
            lastAddition.stockAfter
        );

    const amount =
        Number(
            lastAddition.amount
        );


    /*
     * Only allow the undo when the stock
     * has not changed since the addition.
     */

    if (
        Math.abs(
            currentStock -
            expectedStock
        ) >= 0.000001
    ) {

        clearLastFeedAddition();

        updateUndoLastFeedButton();

        alert(
            "The last feed addition can no longer be undone because your feed stock has changed since it was added."
        );

        return;

    }


    const confirmed =
        confirm(
            `Undo the last feed addition of ${amount.toFixed(
                1
            )} kg?`
        );


    if (
        !confirmed
    ) {

        return;

    }


    saveFeedAmount(
        Math.max(
            0,
            currentStock -
            amount
        )
    );


    clearLastFeedAddition();


    if (
        feedInput
    ) {

        feedInput.value =
            "";

    }


    updateFeedManagement();

}


/* =========================================================
   RESET ENTIRE FEED STOCK
   ========================================================= */

function resetFeedStock() {

    const currentStock =
        getFeedAmount();


    /*
     * If there is already no feed,
     * there is nothing to reset.
     */

    if (
        currentStock <= 0
    ) {

        alert(
            "Your feed stock is already at 0.0 kg."
        );

        return;

    }


    const confirmed =
        confirm(
            `Reset your entire feed stock?\n\nCurrent stock: ${currentStock.toFixed(
                1
            )} kg\n\nThis will set your current feed inventory to 0.0 kg. Your feed usage history and analytics will remain محفوظ.`
        );


    if (
        !confirmed
    ) {

        return;

    }


    /*
     * Clear the current inventory.
     */

    saveFeedAmount(
        0
    );


    /*
     * The previous additions can no longer
     * safely be undone after a full reset.
     */

    localStorage.removeItem(
        "feedAdditionHistory"
    );


    /*
     * Clear any value still sitting
     * inside the Add Feed input.
     */

    if (
        feedInput
    ) {

        feedInput.value =
            "";

    }


    /*
     * Refresh the complete feed dashboard.
     */

    updateFeedManagement();


    alert(
        "Feed stock has been reset to 0.0 kg."
    );

}


/* =========================================================
   INITIALIZE FEED BUTTONS
   ========================================================= */

createUndoLastFeedButton();

createResetFeedStockButton();


/* =========================================================
   ADD FEED
   ========================================================= */

if (
    addFeedButton
) {

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

            const updatedStock =
                current +
                amount;


            saveFeedAmount(
                updatedStock
            );


            recordFeedAddition(
                amount,
                current,
                updatedStock
            );


            feedInput.value =
                "";


            updateFeedManagement();

        }
    );

}


/* =========================================================
   RECORD FEED USAGE
   ========================================================= */

if (
    useFeedButton
) {

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


            /*
             * Feed usage changes the stock,
             * so the previous addition can
             * no longer be safely undone.
             */

            clearLastFeedAddition();


            useFeedInput.value =
                "";


            updateFeedManagement();

        }
    );

}


/* =========================================================
   RESET TODAY'S USAGE
   ========================================================= */

if (
    resetFeedTodayButton
) {

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
             * Return today's recorded
             * usage back to stock.
             */

            saveFeedAmount(
                currentStock +
                todayUsage
            );


            /*
             * Remove today's usage record.
             */

            delete history[today];


            saveFeedUsageHistory(
                history
            );


            clearLastFeedAddition();


            if (
                useFeedInput
            ) {

                useFeedInput.value =
                    "";

            }


            /*
             * Recalculate the entire
             * feed dashboard.
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


    if (
        morningFeedTime
    ) {

        morningFeedTime.value =
            morning;

    }

    if (
        afternoonFeedTime
    ) {

        afternoonFeedTime.value =
            afternoon;

    }

}


if (saveScheduleButton) {

    saveScheduleButton.addEventListener(
        "click",
        async () => {

            const morning =
                morningFeedTime
                    ? morningFeedTime.value
                    : "";

            const afternoon =
                afternoonFeedTime
                    ? afternoonFeedTime.value
                    : "";


            if (!morning || !afternoon) {

                if (scheduleStatus) {
                    scheduleStatus.textContent =
                        "Please set both feeding times.";
                }

                return;
            }


            /* Save locally */

            localStorage.setItem(
                "morningFeedTime",
                morning
            );

            localStorage.setItem(
                "afternoonFeedTime",
                afternoon
            );


            /* Send schedule to server */

            try {

                const response =
                    await fetch(
                        "https://poultry-manager-hppo.onrender.com/schedule",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                morning:
                                    morning,

                                afternoon:
                                    afternoon
                            })
                        }
                    );


                if (!response.ok) {
                    throw new Error(
                        "Server could not save schedule."
                    );
                }


                if (scheduleStatus) {

                    scheduleStatus.textContent =
                        "Feed schedule saved.";

                }

            }

            catch (error) {

                console.error(
                    "Schedule sync failed:",
                    error
                );


                if (scheduleStatus) {

                    scheduleStatus.textContent =
                        "Schedule saved on this device.";

                }

            }


            updateNextFeed();


            setTimeout(
                () => {

                    if (scheduleStatus) {

                        scheduleStatus.textContent =
                            "";

                    }

                },
                3000
            );

        }
    );

}


/* =========================================================
   NEXT FEED
   ========================================================= */

function formatTime(
    time
) {

    if (
        !time
    ) {

        return "—";

    }

    const parts =
        time.split(":");

    let hour =
        Number(
            parts[0]
        );

    const minute =
        parts[1];

    const suffix =
        hour >= 12
            ? "PM"
            : "AM";

    hour =
        hour % 12 ||
        12;

    return (
        `${hour}:${minute} ${suffix}`
    );

}


function updateNextFeed() {

    if (
        !nextFeed
    ) {

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

    const schedules = [
        morning,
        afternoon
    ];


    let closest =
        null;


    schedules.forEach(
        time => {

            if (
                !time
            ) {

                return;

            }

            const parts =
                time.split(":");

            const candidate =
                new Date(
                    now
                );

            candidate.setHours(
                Number(
                    parts[0]
                ),
                Number(
                    parts[1]
                ),
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
                !closest ||
                candidate <
                closest
            ) {

                closest =
                    candidate;

            }

        }
    );


    if (
        !closest
    ) {

        nextFeed.textContent =
            "—";

        return;

    }


    nextFeed.textContent =
        formatTime(
            String(
                closest.getHours()
            ).padStart(
                2,
                "0"
            ) +
            ":" +
            String(
                closest.getMinutes()
            ).padStart(
                2,
                "0"
            )
        );


    const difference =
        closest.getTime() -
        now.getTime();


    const totalMinutes =
        Math.floor(
            difference /
            60000
        );


    const hours =
        Math.floor(
            totalMinutes /
            60
        );


    const minutes =
        totalMinutes %
        60;


    if (
        nextFeedCountdown
    ) {

        if (
            hours > 0
        ) {

            nextFeedCountdown.textContent =
                `in ${hours}h ${minutes}m`;

        }

        else {

            nextFeedCountdown.textContent =
                `in ${minutes}m`;

        }

    }

}


/* =========================================================
   FLOCK ACTIONS
   ========================================================= */

if (
    addChicken
) {

    addChicken.addEventListener(
        "click",
        () => {

            const current =
                getFlockCount();

            saveFlockCount(
                current + 1
            );

            updateFlockDisplay();

        }
    );

}


if (
    removeChicken
) {

    removeChicken.addEventListener(
        "click",
        () => {

            const current =
                getFlockCount();

            if (
                current <= 0
            ) {

                return;

            }

            saveFlockCount(
                current - 1
            );

            updateFlockDisplay();

        }
    );

}


if (
    setFlockButton
) {

    setFlockButton.addEventListener(
        "click",
        () => {

            const amount =
                Number(
                    flockInput.value
                );

            if (
                !Number.isFinite(
                    amount
                ) ||
                amount < 0
            ) {

                return;

            }

            saveFlockCount(
                amount
            );

            flockInput.value =
                "";

            updateFlockDisplay();

        }
    );

}


/* =========================================================
   ALARM
   ========================================================= */

function isAlarmEnabled() {

    return (
        localStorage.getItem(
            "alarmEnabled"
        ) === "true"
    );

}


function updateAlarmDisplay() {

    const enabled =
        isAlarmEnabled();


    if (
        alarmStatus
    ) {

        alarmStatus.textContent =
            enabled
                ? "Alarm On"
                : "Alarm Off";

    }


    if (
        alarmMessage
    ) {

        alarmMessage.textContent =
            enabled
                ? "Feed alarm is currently enabled."
                : "Feed alarm is currently disabled.";

    }


    if (
        alarmButton
    ) {

        alarmButton.textContent =
            enabled
                ? "Disable Alarm"
                : "Enable Alarm";

    }

}


if (
    alarmButton
) {

    alarmButton.addEventListener(
        "click",
        async () => {

            const enabled =
                isAlarmEnabled();


            if (
                !enabled
            ) {

                if (
                    "Notification" in
                    window
                ) {

                    const permission =
                        await Notification.requestPermission();

                    if (
                        permission !==
                        "granted"
                    ) {

                        return;

                    }

                }

                localStorage.setItem(
                    "alarmEnabled",
                    "true"
                );

            }

            else {

                localStorage.setItem(
                    "alarmEnabled",
                    "false"
                );

            }


            updateAlarmDisplay();

        }
    );

}


/* =========================================================
   FEED ALARM CHECK
   ========================================================= */

function triggerFeedAlarm() {

    if (
        "Notification" in
        window &&
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


function checkFeedAlarm() {

    if (
        !isAlarmEnabled()
    ) {

        return;

    }


    const now =
        new Date();

    const currentTime =
        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        ) +
        ":" +
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );


    const morning =
        localStorage.getItem(
            "morningFeedTime"
        ) || "07:00";

    const afternoon =
        localStorage.getItem(
            "afternoonFeedTime"
        ) || "14:00";


    if (
        currentTime !==
            morning &&
        currentTime !==
            afternoon
    ) {

        return;

    }


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

/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function updateNotificationButton() {

    if (!enableNotifications) {
        return;
    }

    if (!("Notification" in window)) {

        enableNotifications.textContent =
            "Notifications Not Supported";

        return;
    }

    if (Notification.permission === "granted") {

        enableNotifications.textContent =
            "Notifications Enabled";

    } else if (Notification.permission === "denied") {

        enableNotifications.textContent =
            "Notifications Blocked";

    } else {

        enableNotifications.textContent =
            "Enable Notifications";

    }
}


function urlBase64ToUint8Array(base64String) {

    const padding =
        "=".repeat(
            (4 - base64String.length % 4) % 4
        );

    const base64 =
        (base64String + padding)
            .replace(/-/g, "+")
            .replace(/_/g, "/");

    const rawData =
        window.atob(base64);

    return Uint8Array.from(
        [...rawData].map(
            char => char.charCodeAt(0)
        )
    );
}


async function enablePushNotifications() {

    if (!enableNotifications) {
        return;
    }

    if (!("Notification" in window)) {

        alert(
            "Notifications are not supported by this browser."
        );

        return;
    }

    try {

        /* Ask for notification permission */

        const permission =
            await Notification.requestPermission();

        if (permission !== "granted") {

            enableNotifications.textContent =
                "Notifications Blocked";

            return;
        }


        /* Register service worker */

        const registration =
            await navigator.serviceWorker.ready;


        /* Get VAPID public key */

        const keyResponse =
            await fetch(
                "https://poultry-manager-hppo.onrender.com/vapid-public-key"
            );

        if (!keyResponse.ok) {
            throw new Error(
                "Could not get VAPID public key."
            );
        }

        const keyData =
            await keyResponse.json();

        const applicationServerKey =
            urlBase64ToUint8Array(
                keyData.publicKey
            );


        /* Check for an existing subscription */

        let subscription =
            await registration.pushManager.getSubscription();


        /* Create subscription if needed */

        if (!subscription) {

            subscription =
                await registration.pushManager.subscribe({

                    userVisibleOnly: true,

                    applicationServerKey:
                        applicationServerKey

                });

        }


        /* Send subscription to server */

        const subscribeResponse =
            await fetch(
                "https://poultry-manager-hppo.onrender.com/subscribe",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            subscription
                        )
                }
            );


        if (!subscribeResponse.ok) {

            throw new Error(
                "Could not save push subscription."
            );

        }


        /* Success */

        localStorage.setItem(
            "notificationsEnabled",
            "true"
        );

        enableNotifications.textContent =
            "Notifications Enabled";


        /* Small confirmation */

        new Notification(
            "Poultry Manager",
            {
                body:
                    "🐔 Background notifications are now enabled."
            }
        );

    }

    catch (error) {

        console.error(
            "Push notification setup failed:",
            error
        );

        alert(
            "Could not enable background notifications. Please try again."
        );

    }

}


if (enableNotifications) {

    enableNotifications.addEventListener(
        "click",
        enablePushNotifications
    );

}


updateNotificationButton();
/* =========================================================
   SERVICE WORKER
   ========================================================= */

function registerServiceWorker() {

    if (
        "serviceWorker" in
        navigator
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
   INITIALIZATION
   ========================================================= */

displayHeaderDate();

updateEggDisplay();

updateFlockDisplay();

updateProductionSummary();

renderProductionTrend();

updateProductionAnalytics();

updateFeedManagement();

loadFeedSchedule();

updateAlarmDisplay();

updateNextFeed();

displayEggHistory();

displayFeedHistory();

registerServiceWorker();


/* =========================================================
   LIVE CLOCK / FEED ALARM
   ========================================================= */

setInterval(
    () => {

        updateNextFeed();

        checkFeedAlarm();

    },
    1000
);

/* =========================================================
   DATA BACKUP & RESTORE
   ========================================================= */

const exportDataButton =
    document.getElementById("exportData");

const importDataInput =
    document.getElementById("importData");

const backupStatus =
    document.getElementById("backupStatus");


function getPoultryManagerData() {

    const data = {};

    for (let i = 0; i < localStorage.length; i++) {

        const key =
            localStorage.key(i);

        if (key !== null) {

            data[key] =
                localStorage.getItem(key);

        }

    }

    return data;
}


if (exportDataButton) {

    exportDataButton.addEventListener(
        "click",
        () => {

            const data =
                getPoultryManagerData();

            const backup = {

                app:
                    "Poultry Manager",

                version:
                    "1.0",

                createdAt:
                    new Date().toISOString(),

                data:
                    data

            };


            const file =
                new Blob(
                    [
                        JSON.stringify(
                            backup,
                            null,
                            2
                        )
                    ],
                    {
                        type:
                            "application/json"
                    }
                );


            const url =
                URL.createObjectURL(file);


            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                "poultry-manager-backup.json";

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            URL.revokeObjectURL(url);


            if (backupStatus) {

                backupStatus.textContent =
                    "Backup exported successfully.";

            }

        }
    );

}


if (importDataInput) {

    importDataInput.addEventListener(
        "change",
        (event) => {

            const file =
                event.target.files[0];

            if (!file) {
                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                () => {

                    try {

                        const backup =
                            JSON.parse(
                                reader.result
                            );


                        if (
                            !backup ||
                            backup.app !==
                                "Poultry Manager" ||
                            !backup.data
                        ) {

                            throw new Error(
                                "Invalid backup file."
                            );

                        }


                        const confirmed =
                            confirm(
                                "Restore this backup? Your current Poultry Manager data will be replaced."
                            );


                        if (!confirmed) {

                            importDataInput.value =
                                "";

                            return;

                        }


                        automaticBackupPaused = true;

localStorage.clear();

Object.entries(
    backup.data
).forEach(
    ([key, value]) => {

        localStorage.setItem(
            key,
            value
        );

    }
);

automaticBackupPaused = false;

createAutomaticBackup();


                        if (backupStatus) {

                            backupStatus.textContent =
                                "Backup restored. Reloading...";

                        }


                        setTimeout(
                            () => {

                                location.reload();

                            },
                            800
                        );

                    }

                    catch (error) {

                        console.error(
                            "Backup restore failed:",
                            error
                        );

                        if (backupStatus) {

                            backupStatus.textContent =
                                "Invalid backup file.";

                        }

                    }

                };


            reader.readAsText(file);

        }
    );

}

/* =========================================================
   AUTOMATIC LOCAL BACKUP
   ========================================================= */

let automaticBackupPaused = false;
let automaticBackupTimer = null;


function createAutomaticBackup() {

    const data = {};

    for (let i = 0; i < localStorage.length; i++) {

        const key =
            localStorage.key(i);

        if (
            key &&
            key !==
                "poultryManagerAutomaticBackup"
        ) {

            data[key] =
                localStorage.getItem(key);

        }

    }


    const backup = {

        app:
            "Poultry Manager",

        version:
            "1.0",

        createdAt:
            new Date().toISOString(),

        data:
            data

    };


    localStorage.setItem(
        "poultryManagerAutomaticBackup",
        JSON.stringify(backup)
    );

}


function scheduleAutomaticBackup() {

    if (automaticBackupPaused) {
        return;
    }


    clearTimeout(
        automaticBackupTimer
    );


    automaticBackupTimer =
        setTimeout(
            () => {

                try {

                    createAutomaticBackup();

                }

                catch (error) {

                    console.error(
                        "Automatic backup failed:",
                        error
                    );

                }

            },
            1000
        );

}


/* Watch for Poultry Manager data changes */

const originalSetItem =
    localStorage.setItem.bind(
        localStorage
    );

localStorage.setItem =
    function(key, value) {

        originalSetItem(
            key,
            value
        );


        if (
            key !==
                "poultryManagerAutomaticBackup"
        ) {

            scheduleAutomaticBackup();

        }

    };


const originalRemoveItem =
    localStorage.removeItem.bind(
        localStorage
    );

localStorage.removeItem =
    function(key) {

        originalRemoveItem(
            key
        );


        if (
            key !==
                "poultryManagerAutomaticBackup"
        ) {

            scheduleAutomaticBackup();

        }

    };


/* Create the first backup if none exists */

if (
    !localStorage.getItem(
        "poultryManagerAutomaticBackup"
    )
) {

    createAutomaticBackup();

}

/* =========================================================
   POULTRY MANAGER — PROFESSIONAL SETTINGS SYSTEM
   ========================================================= */

(function initializePoultryManagerSettings() {

    "use strict";


    /* =====================================================
       SETTINGS STORAGE
       ===================================================== */

    const SETTINGS_THEME_KEY =
        "poultryManagerTheme";


    const SETTINGS_VIEW_KEY =
        "poultryManagerLastView";


    /* =====================================================
       BASIC HELPERS
       ===================================================== */

    function getStoredTheme() {

        return (
            localStorage.getItem(
                SETTINGS_THEME_KEY
            ) || "light"
        );

    }


    function saveTheme(theme) {

        localStorage.setItem(
            SETTINGS_THEME_KEY,
            theme
        );

    }


    function applyTheme(theme) {

        if (theme === "dark") {

            document.documentElement
                .setAttribute(
                    "data-theme",
                    "dark"
                );

        }

        else {

            document.documentElement
                .removeAttribute(
                    "data-theme"
                );

        }

    }


    /* =====================================================
       CREATE NAVIGATION
       ===================================================== */

    const app =
        document.querySelector(".app");


    if (!app) {

        console.error(
            "Poultry Manager: .app not found."
        );

        return;

    }


    const header =
        app.querySelector(".app-header");


    if (!header) {

        console.error(
            "Poultry Manager: app header not found."
        );

        return;

    }


    let navigation =
        document.getElementById(
            "pmAppNavigation"
        );


    if (!navigation) {

        navigation =
            document.createElement("nav");

        navigation.id =
            "pmAppNavigation";

        navigation.className =
            "app-navigation";


        navigation.innerHTML = `

            <button
                type="button"
                id="pmDashboardButton"
                class="active"
            >
                🏠 Dashboard
            </button>

            <button
                type="button"
                id="pmSettingsButton"
            >
                ⚙️ Settings
            </button>

        `;


        header.appendChild(
            navigation
        );

    }


    const dashboardButton =
        document.getElementById(
            "pmDashboardButton"
        );


    const settingsButton =
        document.getElementById(
            "pmSettingsButton"
        );


    /* =====================================================
       CREATE SETTINGS VIEW
       ===================================================== */

    let settingsView =
        document.getElementById(
            "pmSettingsView"
        );


    if (!settingsView) {

        settingsView =
            document.createElement("main");

        settingsView.id =
            "pmSettingsView";

        settingsView.className =
            "pm-settings-view";


        settingsView.innerHTML = `

            <div class="pm-settings-header">

                <h2>Settings</h2>

                <p>
                    Configure Poultry Manager to match the way you manage your flock.
                </p>

            </div>


            <div class="pm-settings-grid">


                <!-- =====================================
                     FLOCK SETTINGS
                     ===================================== -->

                <section class="pm-settings-card">

                    <div class="pm-settings-card-header">

                        <div class="pm-settings-icon">
                            🐔
                        </div>

                        <div>

                            <h3>Flock Settings</h3>

                            <p>
                                Keep your flock size accurate.
                            </p>

                        </div>

                    </div>


                    <div class="pm-settings-row">

                        <div class="pm-settings-row-info">

                            <strong>Current flock</strong>

                            <span>
                                Number of birds currently being managed.
                            </span>

                        </div>

                        <strong
                            id="pmSettingsFlockValue"
                        >
                            0 birds
                        </strong>

                    </div>


                    <div class="pm-settings-row">

                        <div class="pm-settings-row-info">

                            <strong>Set flock size</strong>

                            <span>
                                Update the total number of birds.
                            </span>

                        </div>

                        <input
                            id="pmSettingsFlockInput"
                            class="pm-settings-input"
                            type="number"
                            min="0"
                            step="1"
                            placeholder="Birds"
                        >

                    </div>


                    <div class="pm-settings-actions">

                        <button
                            type="button"
                            id="pmSettingsFlockSave"
                            class="pm-settings-action-button pm-settings-primary"
                        >
                            Save Flock Size
                        </button>

                    </div>


                    <div
                        id="pmSettingsFlockStatus"
                        class="pm-settings-status"
                    ></div>

                </section>


                <!-- =====================================
                     FEEDING SCHEDULE
                     ===================================== -->

                <section class="pm-settings-card">

                    <div class="pm-settings-card-header">

                        <div class="pm-settings-icon">
                            ⏰
                        </div>

                        <div>

                            <h3>Feeding Schedule</h3>

                            <p>
                                Set your regular morning and afternoon feeding times.
                            </p>

                        </div>

                    </div>


                    <div class="pm-schedule-grid">

                        <div class="pm-schedule-field">

                            <label for="pmSettingsMorning">
                                Morning Feed
                            </label>

                            <input
                                id="pmSettingsMorning"
                                type="time"
                            >

                        </div>


                        <div class="pm-schedule-field">

                            <label for="pmSettingsAfternoon">
                                Afternoon Feed
                            </label>

                            <input
                                id="pmSettingsAfternoon"
                                type="time"
                            >

                        </div>

                    </div>


                    <div class="pm-settings-actions">

                        <button
                            type="button"
                            id="pmSettingsScheduleSave"
                            class="pm-settings-action-button pm-settings-primary"
                        >
                            Save Schedule
                        </button>

                    </div>


                    <div
                        id="pmSettingsScheduleStatus"
                        class="pm-settings-status"
                    ></div>

                </section>


                <!-- =====================================
                     FEED ALARM
                     ===================================== -->

                <section class="pm-settings-card">

                    <div class="pm-settings-card-header">

                        <div class="pm-settings-icon">
                            🔔
                        </div>

                        <div>

                            <h3>Feed Alarm</h3>

                            <p>
                                Control the feeding reminder inside Poultry Manager.
                            </p>

                        </div>

                    </div>


                    <div class="pm-settings-row">

                        <div class="pm-settings-row-info">

                            <strong>Alarm status</strong>

                            <span id="pmSettingsAlarmDescription">
                                Feed alarm is currently disabled.
                            </span>

                        </div>

                        <div
                            id="pmSettingsAlarmBadge"
                            class="pm-settings-badge"
                        >

                            <span class="pm-settings-badge-dot"></span>

                            <span id="pmSettingsAlarmBadgeText">
                                Off
                            </span>

                        </div>

                    </div>


                    <div class="pm-settings-actions">

                        <button
                            type="button"
                            id="pmSettingsAlarmButton"
                            class="pm-settings-action-button pm-settings-primary"
                        >
                            Enable Alarm
                        </button>

                    </div>

                </section>


                <!-- =====================================
                     NOTIFICATIONS
                     ===================================== -->

                <section class="pm-settings-card">

                    <div class="pm-settings-card-header">

                        <div class="pm-settings-icon">
                            📱
                        </div>

                        <div>

                            <h3>Notifications</h3>

                            <p>
                                Notification setup can be completed later.
                            </p>

                        </div>

                    </div>


                    <div class="pm-settings-row">

                        <div class="pm-settings-row-info">

                            <strong>Push notifications</strong>

                            <span>
                                Allow Poultry Manager to request notification permission.
                            </span>

                        </div>

                        <div
                            id="pmSettingsNotificationBadge"
                            class="pm-settings-badge"
                        >

                            <span class="pm-settings-badge-dot"></span>

                            <span>
                                Available
                            </span>

                        </div>

                    </div>


                    <div class="pm-settings-actions">

                        <button
                            type="button"
                            id="pmSettingsNotificationsButton"
                            class="pm-settings-action-button pm-settings-secondary"
                        >
                            Notification Settings
                        </button>

                    </div>

                    <div
                        id="pmSettingsNotificationStatus"
                        class="pm-settings-status"
                    >
                        Background notification work can remain parked while the core app is developed.
                    </div>

                </section>


                <!-- =====================================
                     APP PREFERENCES
                     ===================================== -->

                <section class="pm-settings-card">

                    <div class="pm-settings-card-header">

                        <div class="pm-settings-icon">
                            🎨
                        </div>

                        <div>

                            <h3>App Preferences</h3>

                            <p>
                                Personalize the appearance of Poultry Manager.
                            </p>

                        </div>

                    </div>


                    <div class="pm-settings-row">

                        <div class="pm-settings-row-info">

                            <strong>Appearance</strong>

                            <span>
                                Choose how Poultry Manager looks on your device.
                            </span>

                        </div>

                        <select
                            id="pmSettingsTheme"
                            class="pm-settings-select"
                        >

                            <option value="light">
                                Light
                            </option>

                            <option value="dark">
                                Dark
                            </option>

                        </select>

                    </div>

                </section>


                <!-- =====================================
                     BACKUP
                     ===================================== -->

                <section class="pm-settings-card">

                    <div class="pm-settings-card-header">

                        <div class="pm-settings-icon">
                            💾
                        </div>

                        <div>

                            <h3>Data Backup</h3>

                            <p>
                                Protect your Poultry Manager data.
                            </p>

                        </div>

                    </div>


                    <div class="pm-settings-row">

                        <div class="pm-settings-row-info">

                            <strong>Manual backup</strong>

                            <span>
                                Export your current Poultry Manager data.
                            </span>

                        </div>

                    </div>


                    <div class="pm-settings-actions">

                        <button
                            type="button"
                            id="pmSettingsExport"
                            class="pm-settings-action-button pm-settings-primary"
                        >
                            Export Backup
                        </button>


                        <button
                            type="button"
                            id="pmSettingsRestore"
                            class="pm-settings-action-button pm-settings-secondary"
                        >
                            Restore Backup
                        </button>

                    </div>


                    <div
                        id="pmSettingsBackupStatus"
                        class="pm-settings-status"
                    ></div>

                </section>


                <!-- =====================================
                     ABOUT
                     ===================================== -->

                <section class="pm-settings-card pm-settings-card-wide">

                    <div class="pm-about">

                        <div class="pm-about-brand">

                            <div class="pm-about-logo">
                                🐔
                            </div>

                            <div>

                                <strong>
                                    Poultry Manager
                                </strong>

                                <span>
                                    Version 1.0
                                </span>

                            </div>

                        </div>


                        <p class="pm-about-description">
                            Poultry Manager is a flock management system designed to help poultry keepers monitor birds, egg production, feed consumption, feeding schedules and farm activity from one place.
                        </p>


                        <div class="pm-settings-divider"></div>


                        <div class="pm-settings-row">

                            <div class="pm-settings-row-info">

                                <strong>
                                    Product status
                                </strong>

                                <span>
                                    Active development
                                </span>

                            </div>

                            <div class="pm-settings-badge enabled">

                                <span class="pm-settings-badge-dot"></span>

                                <span>
                                    Active
                                </span>

                            </div>

                        </div>

                    </div>

                </section>


            </div>

        `;


        app.appendChild(
            settingsView
        );

    }


    /* =====================================================
       MOVE EXISTING BACKUP SECTION INTO SETTINGS
       ===================================================== */

    const existingBackupInput =
        document.getElementById(
            "importData"
        );


    const existingExportButton =
        document.getElementById(
            "exportData"
        );


    const existingBackupSection =
        existingBackupInput
            ? existingBackupInput.closest(
                ".section"
            )
            : null;


    if (
        existingBackupSection &&
        existingBackupSection !== settingsView
    ) {

        existingBackupSection.style.display =
            "none";

    }


    /* =====================================================
       SETTINGS ELEMENTS
       ===================================================== */

    const settingsFlockValue =
        document.getElementById(
            "pmSettingsFlockValue"
        );


    const settingsFlockInput =
        document.getElementById(
            "pmSettingsFlockInput"
        );


    const settingsFlockSave =
        document.getElementById(
            "pmSettingsFlockSave"
        );


    const settingsFlockStatus =
        document.getElementById(
            "pmSettingsFlockStatus"
        );


    const settingsMorning =
        document.getElementById(
            "pmSettingsMorning"
        );


    const settingsAfternoon =
        document.getElementById(
            "pmSettingsAfternoon"
        );


    const settingsScheduleSave =
        document.getElementById(
            "pmSettingsScheduleSave"
        );


    const settingsScheduleStatus =
        document.getElementById(
            "pmSettingsScheduleStatus"
        );


    const settingsAlarmButton =
        document.getElementById(
            "pmSettingsAlarmButton"
        );


    const settingsAlarmDescription =
        document.getElementById(
            "pmSettingsAlarmDescription"
        );


    const settingsAlarmBadge =
        document.getElementById(
            "pmSettingsAlarmBadge"
        );


    const settingsAlarmBadgeText =
        document.getElementById(
            "pmSettingsAlarmBadgeText"
        );


    const settingsTheme =
        document.getElementById(
            "pmSettingsTheme"
        );


    const settingsNotificationsButton =
        document.getElementById(
            "pmSettingsNotificationsButton"
        );


    const settingsNotificationStatus =
        document.getElementById(
            "pmSettingsNotificationStatus"
        );


    const settingsExport =
        document.getElementById(
            "pmSettingsExport"
        );


    const settingsRestore =
        document.getElementById(
            "pmSettingsRestore"
        );


    const settingsBackupStatus =
        document.getElementById(
            "pmSettingsBackupStatus"
        );


    /* =====================================================
       DASHBOARD SECTIONS
       ===================================================== */

    const dashboardSections =
        Array.from(
            app.children
        ).filter(
            element =>
                element.classList.contains(
                    "section"
                )
        );


    function setDashboardVisibility(
        visible
    ) {

        dashboardSections.forEach(
            section => {

                if (
                    section ===
                    settingsView
                ) {
                    return;
                }

                section.style.display =
                    visible
                        ? ""
                        : "none";

            }
        );

    }


    /* =====================================================
       VIEW SWITCHING
       ===================================================== */

    function showDashboard() {

        setDashboardVisibility(
            true
        );

        settingsView.classList.remove(
            "active"
        );

        dashboardButton.classList.add(
            "active"
        );

        settingsButton.classList.remove(
            "active"
        );


        localStorage.setItem(
            SETTINGS_VIEW_KEY,
            "dashboard"
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    function showSettings() {

        setDashboardVisibility(
            false
        );

        settingsView.classList.add(
            "active"
        );

        dashboardButton.classList.remove(
            "active"
        );

        settingsButton.classList.add(
            "active"
        );


        localStorage.setItem(
            SETTINGS_VIEW_KEY,
            "settings"
        );


        refreshSettings();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    dashboardButton.addEventListener(
        "click",
        showDashboard
    );


    settingsButton.addEventListener(
        "click",
        showSettings
    );


    /* =====================================================
       FLOCK SETTINGS
       ===================================================== */

    function getCurrentFlockCount() {

        const stored =
            localStorage.getItem(
                "flockCount"
            );


        if (
            stored !== null &&
            stored !== ""
        ) {

            const number =
                parseInt(
                    stored,
                    10
                );


            if (
                Number.isFinite(
                    number
                )
            ) {

                return number;

            }

        }


        const dashboardValue =
            document.getElementById(
                "chickenCount"
            );


        if (dashboardValue) {

            const number =
                parseInt(
                    dashboardValue.textContent,
                    10
                );


            if (
                Number.isFinite(
                    number
                )
            ) {

                return number;

            }

        }


        return 0;

    }


    function refreshFlockSettings() {

        const flock =
            getCurrentFlockCount();


        if (settingsFlockValue) {

            settingsFlockValue.textContent =
                `${flock} ${
                    flock === 1
                        ? "bird"
                        : "birds"
                }`;

        }

    }


    if (settingsFlockSave) {

        settingsFlockSave.addEventListener(
            "click",
            () => {

                const value =
                    parseInt(
                        settingsFlockInput.value,
                        10
                    );


                if (
                    !Number.isFinite(
                        value
                    ) ||
                    value < 0
                ) {

                    settingsFlockStatus.textContent =
                        "Enter a valid flock size.";

                    settingsFlockStatus.className =
                        "pm-settings-status error";

                    return;

                }


                /*
                 * Use the existing dashboard
                 * flock control so all existing
                 * production calculations
                 * remain synchronized.
                 */

                const dashboardInput =
                    document.getElementById(
                        "flockInput"
                    );


                const dashboardSetButton =
                    document.getElementById(
                        "setFlockButton"
                    );


                if (
                    dashboardInput &&
                    dashboardSetButton
                ) {

                    dashboardInput.value =
                        value;

                    dashboardSetButton.click();

                }

                else {

                    localStorage.setItem(
                        "flockCount",
                        String(value)
                    );

                }


                settingsFlockStatus.textContent =
                    "Flock size saved.";

                settingsFlockStatus.className =
                    "pm-settings-status success";


                refreshFlockSettings();

                settingsFlockInput.value =
                    "";

            }
        );

    }


    /* =====================================================
       SCHEDULE SETTINGS
       ===================================================== */

    function loadScheduleIntoSettings() {

        const dashboardMorning =
            document.getElementById(
                "morningFeedTime"
            );


        const dashboardAfternoon =
            document.getElementById(
                "afternoonFeedTime"
            );


        if (dashboardMorning) {

            settingsMorning.value =
                dashboardMorning.value || "";

        }


        if (dashboardAfternoon) {

            settingsAfternoon.value =
                dashboardAfternoon.value || "";

        }

    }


    function saveSettingsSchedule() {

        const morning =
            settingsMorning.value;


        const afternoon =
            settingsAfternoon.value;


        if (
            !morning ||
            !afternoon
        ) {

            settingsScheduleStatus.textContent =
                "Set both feeding times before saving.";

            settingsScheduleStatus.className =
                "pm-settings-status error";

            return;

        }


        const dashboardMorning =
            document.getElementById(
                "morningFeedTime"
            );


        const dashboardAfternoon =
            document.getElementById(
                "afternoonFeedTime"
            );


        const dashboardSave =
            document.getElementById(
                "saveScheduleButton"
            );


        if (
            dashboardMorning &&
            dashboardAfternoon
        ) {

            dashboardMorning.value =
                morning;

            dashboardAfternoon.value =
                afternoon;

        }


        if (dashboardSave) {

            dashboardSave.click();

        }

        else {

            localStorage.setItem(
                "morningFeedTime",
                morning
            );

            localStorage.setItem(
                "afternoonFeedTime",
                afternoon
            );

        }


        settingsScheduleStatus.textContent =
            "Feeding schedule saved.";

        settingsScheduleStatus.className =
            "pm-settings-status success";

    }


    if (settingsScheduleSave) {

        settingsScheduleSave.addEventListener(
            "click",
            saveSettingsSchedule
        );

    }


    /* =====================================================
       ALARM SETTINGS
       ===================================================== */

    function getAlarmState() {

        return (
            localStorage.getItem(
                "alarmEnabled"
            ) === "true"
        );

    }


    function refreshAlarmSettings() {

        const enabled =
            getAlarmState();


        if (settingsAlarmBadge) {

            settingsAlarmBadge.classList.toggle(
                "enabled",
                enabled
            );

        }


        if (settingsAlarmBadgeText) {

            settingsAlarmBadgeText.textContent =
                enabled
                    ? "On"
                    : "Off";

        }


        if (settingsAlarmDescription) {

            settingsAlarmDescription.textContent =
                enabled
                    ? "Feed alarm is currently enabled."
                    : "Feed alarm is currently disabled.";

        }


        if (settingsAlarmButton) {

            settingsAlarmButton.textContent =
                enabled
                    ? "Disable Alarm"
                    : "Enable Alarm";

        }

    }


    if (settingsAlarmButton) {

        settingsAlarmButton.addEventListener(
            "click",
            () => {

                const dashboardAlarmButton =
                    document.getElementById(
                        "alarmButton"
                    );


                if (dashboardAlarmButton) {

                    dashboardAlarmButton.click();

                }

                else {

                    const newState =
                        !getAlarmState();


                    localStorage.setItem(
                        "alarmEnabled",
                        String(newState)
                    );

                }


                setTimeout(
                    refreshAlarmSettings,
                    100
                );

            }
        );

    }


    /* =====================================================
       NOTIFICATION SETTINGS
       ===================================================== */

    if (settingsNotificationsButton) {

        settingsNotificationsButton.addEventListener(
            "click",
            () => {

                const existingNotificationButton =
                    document.getElementById(
                        "enableNotifications"
                    );


                if (
                    existingNotificationButton
                ) {

                    existingNotificationButton.click();


                    settingsNotificationStatus.textContent =
                        "Notification permission request started.";

                }

                else {

                    settingsNotificationStatus.textContent =
                        "Notification controls are not currently available.";

                }

            }
        );

    }


    /* =====================================================
       THEME
       ===================================================== */

    const savedTheme =
        getStoredTheme();


    applyTheme(
        savedTheme
    );


    if (settingsTheme) {

        settingsTheme.value =
            savedTheme;


        settingsTheme.addEventListener(
            "change",
            () => {

                const theme =
                    settingsTheme.value;


                saveTheme(
                    theme
                );


                applyTheme(
                    theme
                );

            }
        );

    }


    /* =====================================================
       BACKUP
       ===================================================== */

    if (settingsExport) {

        settingsExport.addEventListener(
            "click",
            () => {

                if (existingExportButton) {

                    existingExportButton.click();

                    settingsBackupStatus.textContent =
                        "Backup exported successfully.";

                    settingsBackupStatus.className =
                        "pm-settings-status success";

                }

                else {

                    settingsBackupStatus.textContent =
                        "Backup export is unavailable.";

                    settingsBackupStatus.className =
                        "pm-settings-status error";

                }

            }
        );

    }


    if (settingsRestore) {

        settingsRestore.addEventListener(
            "click",
            () => {

                if (existingBackupInput) {

                    existingBackupInput.click();

                }

                else {

                    settingsBackupStatus.textContent =
                        "Restore is unavailable.";

                    settingsBackupStatus.className =
                        "pm-settings-status error";

                }

            }
        );

    }


    /* =====================================================
       REFRESH SETTINGS
       ===================================================== */

    function refreshSettings() {

        refreshFlockSettings();

        loadScheduleIntoSettings();

        refreshAlarmSettings();


        if (settingsTheme) {

            settingsTheme.value =
                getStoredTheme();

        }

    }


    /* =====================================================
       MOVE BACKUP STATUS INTO SETTINGS
       ===================================================== */

    const existingBackupStatus =
        document.getElementById(
            "backupStatus"
        );


    if (existingBackupStatus) {

        existingBackupStatus.style.display =
            "none";

    }


    /* =====================================================
       INITIAL STATE
       ===================================================== */

    refreshSettings();


    const lastView =
        localStorage.getItem(
            SETTINGS_VIEW_KEY
        );


    /*
     * Always open on Dashboard when
     * the application is first launched.
     *
     * Settings can be reopened instantly
     * using the navigation.
     */

    if (
        lastView === "settings"
    ) {

        showSettings();

    }

    else {

        showDashboard();

    }


    console.log(
        "Poultry Manager Settings initialized."
    );


})();


/* =========================================================
   POULTRY MANAGER — APP SHELL POLISH
   ========================================================= */

(function initializePoultryManagerAppShell() {

    "use strict";


    const app =
        document.querySelector(".app");


    const dashboardButton =
        document.getElementById(
            "pmDashboardButton"
        );


    const settingsButton =
        document.getElementById(
            "pmSettingsButton"
        );


    if (
        !app ||
        !dashboardButton ||
        !settingsButton
    ) {

        return;

    }


    /* =====================================================
       VIEW TRANSITION
       ===================================================== */

    function animateViewChange() {

        app.classList.remove(
            "pm-switching"
        );


        requestAnimationFrame(() => {

            app.classList.add(
                "pm-switching"
            );

        });


        setTimeout(() => {

            app.classList.remove(
                "pm-switching"
            );

        }, 250);

    }


    dashboardButton.addEventListener(
        "click",
        animateViewChange
    );


    settingsButton.addEventListener(
        "click",
        animateViewChange
    );


    /* =====================================================
       SETTINGS SAVE FEEDBACK
       ===================================================== */

    function addSavedFeedback(
        button,
        messageElement
    ) {

        if (
            !button ||
            !messageElement
        ) {

            return;

        }


        button.addEventListener(
            "click",
            () => {

                setTimeout(() => {

                    if (
                        messageElement.classList.contains(
                            "success"
                        )
                    ) {

                        messageElement.animate(
                            [
                                {
                                    opacity: 0.45
                                },
                                {
                                    opacity: 1
                                }
                            ],
                            {
                                duration: 220
                            }
                        );

                    }

                }, 120);

            }
        );

    }


    addSavedFeedback(
        document.getElementById(
            "pmSettingsFlockSave"
        ),
        document.getElementById(
            "pmSettingsFlockStatus"
        )
    );


    addSavedFeedback(
        document.getElementById(
            "pmSettingsScheduleSave"
        ),
        document.getElementById(
            "pmSettingsScheduleStatus"
        )
    );


    /* =====================================================
       PREVENT DOUBLE TAP FEEDBACK
       ===================================================== */

    const actionButtons =
        document.querySelectorAll(
            ".pm-settings-action-button"
        );


    actionButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    button.classList.add(
                        "pm-button-pressed"
                    );


                    setTimeout(() => {

                        button.classList.remove(
                            "pm-button-pressed"
                        );

                    }, 180);

                }
            );

        }
    );


    console.log(
        "Poultry Manager App Shell initialized."
    );

})();


/* =========================================================
   POULTRY MANAGER — LIVE FARM OVERVIEW
   ========================================================= */

(function initializeFarmOverview() {

    "use strict";


    const flockElement =
        document.getElementById(
            "farmOverviewFlock"
        );


    const eggsElement =
        document.getElementById(
            "farmOverviewEggs"
        );


    const layingRateElement =
        document.getElementById(
            "farmOverviewLayingRate"
        );


    const feedElement =
        document.getElementById(
            "farmOverviewFeed"
        );


    const nextFeedElement =
        document.getElementById(
            "farmOverviewNextFeed"
        );


    if (
        !flockElement ||
        !eggsElement ||
        !layingRateElement ||
        !feedElement ||
        !nextFeedElement
    ) {

        return;

    }


    /* =====================================================
       FIND CURRENT VALUES
       ===================================================== */

    function getFlock() {

        const stored =
            localStorage.getItem(
                "flockCount"
            );


        if (
            stored !== null &&
            stored !== ""
        ) {

            const value =
                parseInt(
                    stored,
                    10
                );


            if (
                Number.isFinite(value)
            ) {

                return value;

            }

        }


        const dashboard =
            document.getElementById(
                "chickenCount"
            );


        if (dashboard) {

            const value =
                parseInt(
                    dashboard.textContent,
                    10
                );


            if (
                Number.isFinite(value)
            ) {

                return value;

            }

        }


        return 0;

    }


    function getEggs() {

        const possibleKeys = [

            "eggsToday",
            "todayEggs",
            "eggCount"

        ];


        for (
            const key of possibleKeys
        ) {

            const stored =
                localStorage.getItem(
                    key
                );


            if (
                stored !== null &&
                stored !== ""
            ) {

                const value =
                    parseInt(
                        stored,
                        10
                    );


                if (
                    Number.isFinite(value)
                ) {

                    return value;

                }

            }

        }


        const dashboard =
            document.getElementById(
                "todayEggs"
            );


        if (dashboard) {

            const value =
                parseInt(
                    dashboard.textContent,
                    10
                );


            if (
                Number.isFinite(value)
            ) {

                return value;

            }

        }


        return 0;

    }


    function getLayingRate() {

        const flock =
            getFlock();


        const eggs =
            getEggs();


        if (
            flock <= 0
        ) {

            return 0;

        }


        return Math.round(
            (eggs / flock) * 100
        );

    }


    function getFeedRemaining() {

        const possibleKeys = [

            "feedInventory",
            "feedAmount",
            "feedStock",
            "feedKg"

        ];


        for (
            const key of possibleKeys
        ) {

            const stored =
                localStorage.getItem(
                    key
                );


            if (
                stored !== null &&
                stored !== ""
            ) {

                const value =
                    parseFloat(
                        stored
                    );


                if (
                    Number.isFinite(value)
                ) {

                    return value;

                }

            }

        }


        return 0;

    }


    /* =====================================================
       NEXT FEEDING
       ===================================================== */

    function getNextFeed() {

        const morning =
            localStorage.getItem(
                "morningFeedTime"
            );


        const afternoon =
            localStorage.getItem(
                "afternoonFeedTime"
            );


        const times = [

            morning,
            afternoon

        ].filter(
            Boolean
        );


        if (
            times.length === 0
        ) {

            return "Not scheduled";

        }


        const now =
            new Date();


        const currentMinutes =
            now.getHours() * 60 +
            now.getMinutes();


        let closestTime = null;
        let closestDifference = Infinity;


        times.forEach(
            time => {

                const parts =
                    time.split(":");


                const hours =
                    parseInt(
                        parts[0],
                        10
                    );


                const minutes =
                    parseInt(
                        parts[1],
                        10
                    );


                const feedMinutes =
                    hours * 60 +
                    minutes;


                let difference =
                    feedMinutes -
                    currentMinutes;


                if (
                    difference < 0
                ) {

                    difference += 1440;

                }


                if (
                    difference <
                    closestDifference
                ) {

                    closestDifference =
                        difference;

                    closestTime =
                        time;

                }

            }
        );


        if (!closestTime) {

            return "Not scheduled";

        }


        const [hours, minutes] =
            closestTime.split(":");


        const date =
            new Date();


        date.setHours(
            parseInt(hours, 10),
            parseInt(minutes, 10),
            0,
            0
        );


        return date.toLocaleTimeString(
            [],
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );

    }


    /* =====================================================
       UPDATE OVERVIEW
       ===================================================== */

    function updateFarmOverview() {

        const flock =
            getFlock();


        const eggs =
            getEggs();


        const layingRate =
            getLayingRate();


        const feed =
            getFeedRemaining();


        flockElement.textContent =
            flock;


        eggsElement.textContent =
            eggs;


        layingRateElement.textContent =
            `${layingRate}%`;


        feedElement.textContent =
            `${feed.toFixed(2)} kg`;


        nextFeedElement.textContent =
            getNextFeed();

    }


    /* =====================================================
       KEEP OVERVIEW IN SYNC
       ===================================================== */

    updateFarmOverview();


    setInterval(
        updateFarmOverview,
        1000
    );


    window.updateFarmOverview =
        updateFarmOverview;


    console.log(
        "Poultry Manager Farm Overview initialized."
    );

})();
