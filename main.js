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

}


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
             * Return today's
             * recorded usage
             * back to stock.
             */

            saveFeedAmount(
                currentStock +
                todayUsage
            );


            /*
             * Remove today's
             * usage record.
             */

            delete history[today];

            saveFeedUsageHistory(
                history
            );


            if (
                useFeedInput
            ) {

                useFeedInput.value =
                    "";

            }


            /*
             * Recalculate
             * the entire feed
             * dashboard.
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