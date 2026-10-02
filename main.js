/* =========================================================
   POULTRY MANAGER
   Production Tracking v5
   Feed Management v1
   ========================================================= */


/* =========================================================
   DOM REFERENCES
   ========================================================= */

const headerDate =
    document.getElementById("headerDate");


const birdCount =
    document.getElementById("birdCount");

const overviewEggCount =
    document.getElementById("overviewEggCount");

const overviewLayingRate =
    document.getElementById("overviewLayingRate");

const overviewFeedAmount =
    document.getElementById("overviewFeedAmount");


const sevenDayEggs =
    document.getElementById("sevenDayEggs");

const averageLayingRate =
    document.getElementById("averageLayingRate");

const bestProductionDay =
    document.getElementById("bestProductionDay");

const bestProductionEggs =
    document.getElementById("bestProductionEggs");


const trendMaxLabel =
    document.getElementById("trendMaxLabel");

const trendMidLabel =
    document.getElementById("trendMidLabel");

const productionTrendChart =
    document.getElementById("productionTrendChart");


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


const eggCount =
    document.getElementById("eggCount");

const layingRate =
    document.getElementById("layingRate");


const addEggButton =
    document.getElementById("addEggButton");

const removeEggButton =
    document.getElementById("removeEggButton");


const eggHistoryList =
    document.getElementById("eggHistoryList");

const viewHistoryButton =
    document.getElementById("viewHistoryButton");


/* =========================================================
   FEED DOM
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


const feedUsedToday =
    document.getElementById("feedUsedToday");

const feedDailyAverage =
    document.getElementById("feedDailyAverage");

const feedDaysRemaining =
    document.getElementById("feedDaysRemaining");

const feedDaysRemainingText =
    document.getElementById("feedDaysRemainingText");

const feedStatusBadge =
    document.getElementById("feedStatusBadge");

const feedStockPercentage =
    document.getElementById("feedStockPercentage");

const feedStockProgress =
    document.getElementById("feedStockProgress");


const feedSevenDayUsage =
    document.getElementById("feedSevenDayUsage");

const feedUsageDays =
    document.getElementById("feedUsageDays");

const feedPerBird =
    document.getElementById("feedPerBird");

const feedConsumptionChart =
    document.getElementById("feedConsumptionChart");


const feedHistoryList =
    document.getElementById("feedHistoryList");

const viewFeedHistoryButton =
    document.getElementById(
        "viewFeedHistoryButton"
    );


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

const nextFeed =
    document.getElementById(
        "nextFeed"
    );

const nextFeedCountdown =
    document.getElementById(
        "nextFeedCountdown"
    );


/* =========================================================
   FLOCK DOM
   ========================================================= */

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


/* =========================================================
   ALARM
   ========================================================= */

const alarmButton =
    document.getElementById(
        "alarmButton"
    );

const alarmStatus =
    document.getElementById(
        "alarmStatus"
    );

const alarmMessage =
    document.getElementById(
        "alarmMessage"
    );


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

const enableNotifications =
    document.getElementById(
        "enableNotifications"
    );


/* =========================================================
   DATE HELPERS
   ========================================================= */

function getLocalDateKey(
    date = new Date()
) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;
}


function getDateFromKey(
    dateKey
) {

    const [
        year,
        month,
        day
    ] =
        dateKey
            .split("-")
            .map(Number);

    return new Date(
        year,
        month - 1,
        day
    );
}


function formatDate(
    dateKey
) {

    const date =
        getDateFromKey(
            dateKey
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

    const date =
        getDateFromKey(
            dateKey
        );

    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "short",
            month: "short",
            day: "numeric"
        }
    );
}


function getLastSevenDateKeys() {

    const dates = [];

    const todayDate =
        new Date();

    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date(
                todayDate
            );

        date.setDate(
            todayDate.getDate() - i
        );

        dates.push(
            getLocalDateKey(
                date
            )
        );

    }

    return dates;
}


/* =========================================================
   HEADER
   ========================================================= */

function displayHeaderDate() {

    const currentDate =
        new Date();

    headerDate.textContent =
        currentDate.toLocaleDateString(
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

    }

    catch (error) {

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


function getHistoryRecord(
    dateKey
) {

    const history =
        getEggHistory();

    const record =
        history[dateKey];


    if (
        record === undefined ||
        record === null
    ) {

        return {
            eggs: 0,
            flock: 0
        };

    }


    if (
        typeof record === "number"
    ) {

        return {
            eggs: record,
            flock: 0
        };

    }


    return {

        eggs:
            Number(
                record.eggs
            ) || 0,

        flock:
            Number(
                record.flock
            ) || 0

    };

}


/* =========================================================
   CURRENT DAY
   ========================================================= */

const today =
    getLocalDateKey();


let savedDate =
    localStorage.getItem(
        "eggDate"
    );


let eggs =
    Number(
        localStorage.getItem(
            "eggs"
        )
    ) || 0;


/* =========================================================
   DAILY ROLLOVER
   ========================================================= */

if (
    savedDate !== today
) {

    const history =
        getEggHistory();


    if (savedDate) {

        const previousFlock =
            Number(
                localStorage.getItem(
                    "chickenCount"
                )
            ) || 0;


        history[savedDate] = {

            eggs:
                eggs,

            flock:
                previousFlock

        };

    }


    saveEggHistory(
        history
    );


    eggs = 0;


    localStorage.setItem(
        "eggs",
        "0"
    );


    localStorage.setItem(
        "eggDate",
        today
    );

}


/* =========================================================
   FLOCK
   ========================================================= */

function getCurrentFlock() {

    return Number(
        localStorage.getItem(
            "chickenCount"
        )
    ) || 0;

}


/* =========================================================
   LAYING RATE
   ========================================================= */

function calculateLayingRate(
    eggAmount,
    flockSize
) {

    if (
        !flockSize ||
        flockSize <= 0
    ) {

        return 0;

    }


    return Math.round(
        (
            eggAmount /
            flockSize
        ) * 100
    );

}


/* =========================================================
   SAVE TODAY'S EGG HISTORY
   ========================================================= */

function saveTodayEggHistory() {

    const history =
        getEggHistory();


    history[today] = {

        eggs:
            eggs,

        flock:
            getCurrentFlock()

    };


    saveEggHistory(
        history
    );

}


/* =========================================================
   EGG DISPLAY
   ========================================================= */

function updateEggDisplay() {

    const flock =
        getCurrentFlock();


    const rate =
        calculateLayingRate(
            eggs,
            flock
        );


    eggCount.textContent =
        eggs;


    layingRate.textContent =
        `${rate}%`;


    overviewEggCount.textContent =
        eggs;


    overviewLayingRate.textContent =
        `${rate}%`;

}


/* =========================================================
   EGG ACTIONS
   ========================================================= */

addEggButton.addEventListener(
    "click",
    () => {

        eggs += 1;


        localStorage.setItem(
            "eggs",
            String(
                eggs
            )
        );


        saveTodayEggHistory();

        updateEggDisplay();

        displayEggHistory();

        updateProductionSummary();

        renderProductionTrend();

        updateProductionAnalytics();

    }
);


removeEggButton.addEventListener(
    "click",
    () => {

        if (
            eggs <= 0
        ) {

            return;

        }


        eggs -= 1;


        localStorage.setItem(
            "eggs",
            String(
                eggs
            )
        );


        saveTodayEggHistory();

        updateEggDisplay();

        displayEggHistory();

        updateProductionSummary();

        renderProductionTrend();

        updateProductionAnalytics();

    }
);


/* =========================================================
   EGG HISTORY DISPLAY
   ========================================================= */

let historyExpanded =
    false;


function displayEggHistory() {

    const history =
        getEggHistory();


    const records =
        Object.entries(
            history
        )
            .sort(
                (
                    [dateA],
                    [dateB]
                ) =>
                    dateB.localeCompare(
                        dateA
                    )
            );


    eggHistoryList.innerHTML =
        "";


    if (
        records.length === 0
    ) {

        eggHistoryList.innerHTML = `
            <div class="empty-state">
                No egg history yet.
            </div>
        `;


        viewHistoryButton.style.display =
            "none";


        return;

    }


    const visibleRecords =
        historyExpanded
            ? records
            : records.slice(
                0,
                4
            );


    visibleRecords.forEach(
        ([dateKey]) => {

            const record =
                getHistoryRecord(
                    dateKey
                );


            const rate =
                calculateLayingRate(
                    record.eggs,
                    record.flock
                );


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "history-item";


            item.innerHTML = `

                <div>
                    <strong>
                        ${formatFullDate(
                            dateKey
                        )}
                    </strong>

                    <small>
                        ${record.eggs}
                        ${
                            record.eggs === 1
                                ? "egg"
                                : "eggs"
                        }
                    </small>
                </div>

                <div>
                    <strong>
                        ${rate}%
                    </strong>

                    <small>
                        laying rate
                    </small>
                </div>

            `;


            eggHistoryList.appendChild(
                item
            );

        }
    );


    if (
        records.length > 4
    ) {

        viewHistoryButton.style.display =
            "inline-flex";


        viewHistoryButton.textContent =
            historyExpanded
                ? "Show Less"
                : "View All History";

    }

    else {

        viewHistoryButton.style.display =
            "none";

    }

}


viewHistoryButton.addEventListener(
    "click",
    () => {

        historyExpanded =
            !historyExpanded;

        displayEggHistory();

    }
);


/* =========================================================
   PRODUCTION SUMMARY
   ========================================================= */

function updateProductionSummary() {

    const dates =
        getLastSevenDateKeys();


    const records =
        dates.map(
            dateKey => {

                const record =
                    getHistoryRecord(
                        dateKey
                    );


                return {

                    date:
                        dateKey,

                    eggs:
                        record.eggs,

                    flock:
                        record.flock

                };

            }
        );


    const totalEggs =
        records.reduce(
            (
                total,
                record
            ) =>
                total +
                record.eggs,
            0
        );


    const rateRecords =
        records.filter(
            record =>
                record.flock > 0
        );


    let averageRate =
        0;


    if (
        rateRecords.length > 0
    ) {

        averageRate =
            Math.round(
                rateRecords.reduce(
                    (
                        total,
                        record
                    ) =>
                        total +
                        calculateLayingRate(
                            record.eggs,
                            record.flock
                        ),
                    0
                ) /
                rateRecords.length
            );

    }


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


    sevenDayEggs.textContent =
        totalEggs;


    averageLayingRate.textContent =
        `${averageRate}%`;


    bestProductionDay.textContent =
        bestRecord.eggs > 0
            ? formatDate(
                bestRecord.date
            )
            : "—";


    bestProductionEggs.textContent =
        bestRecord.eggs;

}


/* =========================================================
   PRODUCTION TREND
   ========================================================= */

function renderProductionTrend() {

    const dates =
        getLastSevenDateKeys();


    const records =
        dates.map(
            dateKey => {

                const record =
                    getHistoryRecord(
                        dateKey
                    );


                return {

                    date:
                        dateKey,

                    eggs:
                        record.eggs,

                    flock:
                        record.flock

                };

            }
        );


    const maxEggs =
        Math.max(
            1,
            ...records.map(
                record =>
                    record.eggs
            )
        );


    const chartMax =
        Math.max(
            1,
            Math.ceil(
                maxEggs / 5
            ) * 5
        );


    const midValue =
        Math.ceil(
            chartMax / 2
        );


    trendMaxLabel.textContent =
        chartMax;


    trendMidLabel.textContent =
        midValue;


    productionTrendChart.innerHTML =
        "";


    records.forEach(
        record => {

            const column =
                document.createElement(
                    "div"
                );


            column.className =
                "trend-column";


            const barContainer =
                document.createElement(
                    "div"
                );


            barContainer.className =
                "trend-bar-container";


            const bar =
                document.createElement(
                    "div"
                );


            bar.className =
                "trend-bar";


            if (
                record.eggs === 0
            ) {

                bar.classList.add(
                    "zero"
                );

            }


            const height =
                record.eggs === 0
                    ? 0
                    : (
                        record.eggs /
                        chartMax
                    ) * 100;


            bar.style.height =
                `${height}%`;


            const value =
                document.createElement(
                    "span"
                );


            value.className =
                "trend-bar-value";


            value.textContent =
                record.eggs;


            bar.appendChild(
                value
            );


            barContainer.appendChild(
                bar
            );


            const day =
                document.createElement(
                    "span"
                );


            day.className =
                "trend-day";


            if (
                record.date === today
            ) {

                day.classList.add(
                    "today"
                );

            }


            day.textContent =
                formatDate(
                    record.date
                );


            column.appendChild(
                barContainer
            );


            column.appendChild(
                day
            );


            productionTrendChart.appendChild(
                column
            );

        }
    );

}


/* =========================================================
   PRODUCTION ANALYTICS
   ========================================================= */

function updateProductionAnalytics() {

    const dateKeys =
        getLastSevenDateKeys();


    const records =
        dateKeys.map(
            dateKey => {

                const record =
                    getHistoryRecord(
                        dateKey
                    );


                return {

                    dateKey,

                    eggs:
                        Number(
                            record.eggs
                        ) || 0,

                    flock:
                        Number(
                            record.flock
                        ) || 0

                };

            }
        );


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


    const daysProducing =
        records.filter(
            record =>
                record.eggs > 0
        ).length;


    const averageDailyEggs =
        totalEggs / 7;


    const flockRecords =
        records.filter(
            record =>
                record.flock > 0
        );


    const averageFlock =
        flockRecords.length > 0
            ? flockRecords.reduce(
                (
                    sum,
                    record
                ) =>
                    sum +
                    record.flock,
                0
            ) /
            flockRecords.length
            : 0;


    const eggsPerHen =
        averageFlock > 0
            ? totalEggs /
                averageFlock
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


    const consistency =
        Math.round(
            (
                daysProducing /
                7
            ) * 100
        );


    const earlierRecords =
        records.slice(
            0,
            3
        );


    const recentRecords =
        records.slice(
            4,
            7
        );


    const earlierAverage =
        earlierRecords.reduce(
            (
                sum,
                record
            ) =>
                sum +
                record.eggs,
            0
        ) /
        earlierRecords.length;


    const recentAverage =
        recentRecords.reduce(
            (
                sum,
                record
            ) =>
                sum +
                record.eggs,
            0
        ) /
        recentRecords.length;


    let changeText =
        "0%";


    if (
        earlierAverage === 0 &&
        recentAverage > 0
    ) {

        changeText =
            "New";

    }

    else if (
        earlierAverage > 0
    ) {

        const change =
            (
                (
                    recentAverage -
                    earlierAverage
                ) /
                earlierAverage
            ) * 100;


        changeText =
            `${
                change >= 0
                    ? "+"
                    : ""
            }${Math.round(
                change
            )}%`;

    }


    function formatAnalyticsDate(
        dateKey
    ) {

        if (!dateKey) {

            return "No data";

        }


        const date =
            new Date(
                `${dateKey}T00:00:00`
            );


        return date.toLocaleDateString(
            "en-NG",
            {
                day: "numeric",
                month: "short"
            }
        );

    }


    let insight =
        "Start recording eggs to see production insights.";


    if (
        totalEggs === 0
    ) {

        insight =
            "No eggs have been recorded during this 7-day period yet.";

    }

    else if (
        consistency === 100
    ) {

        if (
            recentAverage >
            earlierAverage
        ) {

            insight =
                "Your flock produced eggs every day, and recent production is higher than earlier in the week.";

        }

        else if (
            recentAverage <
            earlierAverage
        ) {

            insight =
                "Your flock produced eggs every day, but recent production is lower than earlier in the week.";

        }

        else {

            insight =
                "Your flock produced eggs every day with a relatively stable production pattern.";

        }

    }

    else if (
        consistency >= 70
    ) {

        insight =
            `Your flock produced eggs on ${daysProducing} of the last 7 days. Production is occurring regularly, with some days having no recorded eggs.`;

    }

    else if (
        consistency >= 40
    ) {

        insight =
            `Your flock produced eggs on ${daysProducing} of the last 7 days. There is noticeable variation in production across the period.`;

    }

    else {

        insight =
            `Egg production was recorded on ${daysProducing} of the last 7 days. More daily records will make the production pattern clearer.`;

    }


    if (
        analyticsEggsPerHen
    ) {

        analyticsEggsPerHen.textContent =
            eggsPerHen.toFixed(
                2
            );

    }


    if (
        analyticsAverage
    ) {

        analyticsAverage.textContent =
            averageDailyEggs.toFixed(
                2
            );

    }


    if (
        analyticsHighestDay
    ) {

        analyticsHighestDay.textContent =
            totalEggs > 0
                ? `${highestRecord.eggs} ${
                    highestRecord.eggs === 1
                        ? "egg"
                        : "eggs"
                }`
                : "—";

    }


    if (
        analyticsHighestDayDate
    ) {

        analyticsHighestDayDate.textContent =
            totalEggs > 0
                ? formatAnalyticsDate(
                    highestRecord.dateKey
                )
                : "No data";

    }


    if (
        analyticsLowestDay
    ) {

        analyticsLowestDay.textContent =
            totalEggs > 0
                ? `${lowestRecord.eggs} ${
                    lowestRecord.eggs === 1
                        ? "egg"
                        : "eggs"
                }`
                : "—";

    }


    if (
        analyticsLowestDayDate
    ) {

        analyticsLowestDayDate.textContent =
            totalEggs > 0
                ? formatAnalyticsDate(
                    lowestRecord.dateKey
                )
                : "No data";

    }


    if (
        analyticsConsistency
    ) {

        analyticsConsistency.textContent =
            `${consistency}%`;

    }


    if (
        analyticsChange
    ) {

        analyticsChange.textContent =
            changeText;

    }


    if (
        analyticsInsight
    ) {

        analyticsInsight.textContent =
            insight;

    }

}


/* =========================================================
   FLOCK DISPLAY
   ========================================================= */

function updateChickenDisplay() {

    const flock =
        getCurrentFlock();


    chickenCount.textContent =
        flock;


    birdCount.textContent =
        flock;


    updateEggDisplay();

}


/* =========================================================
   FLOCK ACTIONS
   ========================================================= */

addChicken.addEventListener(
    "click",
    () => {

        let flock =
            getCurrentFlock();


        flock += 1;


        localStorage.setItem(
            "chickenCount",
            String(
                flock
            )
        );


        saveTodayEggHistory();

        updateChickenDisplay();

        displayEggHistory();

        updateProductionSummary();

        renderProductionTrend();

        updateProductionAnalytics();

        updateFeedManagement();

    }
);


removeChicken.addEventListener(
    "click",
    () => {

        let flock =
            getCurrentFlock();


        if (
            flock <= 0
        ) {

            return;

        }


        flock -= 1;


        localStorage.setItem(
            "chickenCount",
            String(
                flock
            )
        );


        saveTodayEggHistory();

        updateChickenDisplay();

        displayEggHistory();

        updateProductionSummary();

        renderProductionTrend();

        updateProductionAnalytics();

        updateFeedManagement();

    }
);


setFlockButton.addEventListener(
    "click",
    () => {

        const value =
            Number(
                flockInput.value
            );


        if (
            !Number.isFinite(value) ||
            value < 0
        ) {

            return;

        }


        const flock =
            Math.floor(
                value
            );


        localStorage.setItem(
            "chickenCount",
            String(
                flock
            )
        );


        flockInput.value =
            "";


        saveTodayEggHistory();

        updateChickenDisplay();

        displayEggHistory();

        updateProductionSummary();

        renderProductionTrend();

        updateProductionAnalytics();

        updateFeedManagement();

    }
);


/* =========================================================
   FEED DATA
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

    }

    catch (error) {

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
   FEED DISPLAY
   ========================================================= */

function updateFeedDisplay() {

    const amount =
        getFeedAmount();


    feedAmount.textContent =
        `${amount.toFixed(
            1
        )} kg`;


    overviewFeedAmount.textContent =
        `${amount.toFixed(
            1
        )} kg`;

}


/* =========================================================
   FEED ANALYTICS DATA
   ========================================================= */

function getFeedAnalytics() {

    const dates =
        getLastSevenDateKeys();


    const records =
        dates.map(
            dateKey => ({

                date:
                    dateKey,

                usage:
                    getFeedUsage(
                        dateKey
                    )

            })
        );


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
        getCurrentFlock();


    const perBird =
        averageDailyUsage > 0 &&
        flock > 0
            ? (
                averageDailyUsage /
                flock
            ) * 1000
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
    amount,
    averageDailyUsage
) {

    feedStatusBadge.className =
        "feed-status-badge";


    feedStockProgress.className =
        "feed-progress-fill";


    if (
        amount <= 0
    ) {

        feedStatusBadge.classList.add(
            "feed-status-empty"
        );


        feedStatusBadge.textContent =
            "Out of feed";


        feedStockPercentage.textContent =
            "0%";


        feedStockProgress.style.width =
            "0%";


        feedStockProgress.style.background =
            "#b91c1c";


        return;

    }


    if (
        averageDailyUsage <= 0
    ) {

        feedStatusBadge.classList.add(
            "feed-status-neutral"
        );


        feedStatusBadge.textContent =
            "No usage data";


        feedStockPercentage.textContent =
            "—";


        feedStockProgress.style.width =
            "100%";


        feedStockProgress.style.background =
            "var(--primary)";


        return;

    }


    const daysRemaining =
        amount /
        averageDailyUsage;


    /*
       The visual stock percentage is intentionally
       based on estimated days remaining.

       14+ days = full
       7 days = half
       0 days = empty
    */

    const percentage =
        Math.min(
            100,
            Math.max(
                0,
                (
                    daysRemaining /
                    14
                ) * 100
            )
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

        feedStatusBadge.classList.add(
            "feed-status-critical"
        );


        feedStatusBadge.textContent =
            "Critical";


        feedStockProgress.style.background =
            "#b91c1c";

    }

    else if (
        daysRemaining <= 5
    ) {

        feedStatusBadge.classList.add(
            "feed-status-warning"
        );


        feedStatusBadge.textContent =
            "Running low";


        feedStockProgress.style.background =
            "#b45309";

    }

    else {

        feedStatusBadge.classList.add(
            "feed-status-good"
        );


        feedStatusBadge.textContent =
            "Healthy";


        feedStockProgress.style.background =
            "var(--success)";

    }

}


/* =========================================================
   FEED MANAGEMENT DISPLAY
   ========================================================= */

function updateFeedManagement() {

    const amount =
        getFeedAmount();


    const analytics =
        getFeedAnalytics();


    const {

        totalUsage,

        usageDays,

        averageDailyUsage,

        perBird

    } =
        analytics;


    updateFeedDisplay();


    feedUsedToday.textContent =
        `${getFeedUsage(
            today
        ).toFixed(
            1
        )} kg`;


    feedSevenDayUsage.textContent =
        `${totalUsage.toFixed(
            1
        )} kg`;


    feedUsageDays.textContent =
        usageDays;


    if (
        averageDailyUsage > 0
    ) {

        feedDailyAverage.textContent =
            `${averageDailyUsage.toFixed(
                2
            )} kg`;

    }

    else {

        feedDailyAverage.textContent =
            "—";

    }


    if (
        perBird > 0
    ) {

        feedPerBird.textContent =
            `${perBird.toFixed(
                0
            )} g`;

    }

    else {

        feedPerBird.textContent =
            "—";

    }


    if (
        averageDailyUsage > 0
    ) {

        const daysRemaining =
            amount /
            averageDailyUsage;


        if (
            amount <= 0
        ) {

            feedDaysRemaining.textContent =
                "0";


            feedDaysRemainingText.textContent =
                "Feed stock is empty.";

        }

        else {

            feedDaysRemaining.textContent =
                daysRemaining >= 10
                    ? Math.floor(
                        daysRemaining
                    )
                    : daysRemaining.toFixed(
                        1
                    );


            feedDaysRemainingText.textContent =
                daysRemaining <= 1
                    ? "Less than 1 day"
                    : daysRemaining < 2
                        ? "Approximately 1 day"
                        : "estimated remaining";

        }

    }

    else {

        feedDaysRemaining.textContent =
            "—";


        feedDaysRemainingText.textContent =
            "Record usage to calculate";

    }


    updateFeedStatus(
        amount,
        averageDailyUsage
    );


    renderFeedConsumptionChart();

    displayFeedHistory();

}


/* =========================================================
   ADD FEED
   ========================================================= */

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


/* =========================================================
   USE FEED
   ========================================================= */

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


/* =========================================================
   FEED CONSUMPTION CHART
   ========================================================= */

function renderFeedConsumptionChart() {

    const analytics =
        getFeedAnalytics();


    const records =
        analytics.records;


    const maxUsage =
        Math.max(
            0.1,
            ...records.map(
                record =>
                    record.usage
            )
        );


    feedConsumptionChart.innerHTML =
        "";


    records.forEach(
        record => {

            const column =
                document.createElement(
                    "div"
                );


            column.className =
                "feed-chart-column";


            const barArea =
                document.createElement(
                    "div"
                );


            barArea.className =
                "feed-chart-bar-area";


            const bar =
                document.createElement(
                    "div"
                );


            bar.className =
                "feed-chart-bar";


            if (
                record.usage === 0
            ) {

                bar.classList.add(
                    "zero"
                );

            }


            const height =
                record.usage === 0
                    ? 0
                    : (
                        record.usage /
                        maxUsage
                    ) * 100;


            bar.style.height =
                `${height}%`;


            const value =
                document.createElement(
                    "span"
                );


            value.className =
                "feed-chart-value";


            value.textContent =
                record.usage > 0
                    ? `${record.usage.toFixed(
                        1
                    )}`
                    : "0";


            bar.appendChild(
                value
            );


            barArea.appendChild(
                bar
            );


            const day =
                document.createElement(
                    "span"
                );


            day.className =
                "feed-chart-day";


            if (
                record.date === today
            ) {

                day.classList.add(
                    "today"
                );

            }


            day.textContent =
                formatDate(
                    record.date
                );


            column.appendChild(
                barArea
            );


            column.appendChild(
                day
            );


            feedConsumptionChart.appendChild(
                column
            );

        }
    );

}


/* =========================================================
   FEED HISTORY
   ========================================================= */

let feedHistoryExpanded =
    false;


function displayFeedHistory() {

    const history =
        getFeedUsageHistory();


    const records =
        Object.entries(
            history
        )
            .filter(
                ([, amount]) =>
                    Number(
                        amount
                    ) > 0
            )
            .sort(
                (
                    [dateA],
                    [dateB]
                ) =>
                    dateB.localeCompare(
                        dateA
                    )
            );


    feedHistoryList.innerHTML =
        "";


    if (
        records.length === 0
    ) {

        feedHistoryList.innerHTML = `
            <div class="empty-state">
                No feed usage has been recorded yet.
            </div>
        `;


        viewFeedHistoryButton.style.display =
            "none";


        return;

    }


    const visibleRecords =
        feedHistoryExpanded
            ? records
            : records.slice(
                0,
                5
            );


    visibleRecords.forEach(
        ([dateKey, amount]) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "feed-history-item";


            item.innerHTML = `

                <div class="feed-history-main">

                    <strong>
                        ${formatFullDate(
                            dateKey
                        )}
                    </strong>

                    <small>
                        Feed consumed
                    </small>

                </div>

                <div class="feed-history-amount">

                    <strong>
                        ${Number(
                            amount
                        ).toFixed(
                            1
                        )} kg
                    </strong>

                    <small>
                        usage
                    </small>

                </div>

            `;


            feedHistoryList.appendChild(
                item
            );

        }
    );


    if (
        records.length > 5
    ) {

        viewFeedHistoryButton.style.display =
            "inline-flex";


        viewFeedHistoryButton.textContent =
            feedHistoryExpanded
                ? "Show Less"
                : "View All";

    }

    else {

        viewFeedHistoryButton.style.display =
            "none";

    }

}


viewFeedHistoryButton.addEventListener(
    "click",
    () => {

        feedHistoryExpanded =
            !feedHistoryExpanded;

        displayFeedHistory();

    }
);


/* =========================================================
   FEED SCHEDULE
   ========================================================= */

function loadFeedSchedule() {

    const morning =
        localStorage.getItem(
            "morningFeedTime"
        );


    const afternoon =
        localStorage.getItem(
            "afternoonFeedTime"
        );


    if (morning) {

        morningFeedTime.value =
            morning;

    }


    if (afternoon) {

        afternoonFeedTime.value =
            afternoon;

    }


    updateNextFeed();

}


saveScheduleButton.addEventListener(
    "click",
    async () => {

        const morning =
            morningFeedTime.value;


        const afternoon =
            afternoonFeedTime.value;


        localStorage.setItem(
            "morningFeedTime",
            morning
        );


        localStorage.setItem(
            "afternoonFeedTime",
            afternoon
        );


        scheduleStatus.textContent =
            "Schedule saved.";


        updateNextFeed();


        try {

            await fetch(
                "/schedule",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            morning,
                            afternoon
                        })
                }
            );

        }

        catch (error) {

            console.log(
                "Schedule sync unavailable."
            );

        }

    }
);


/* =========================================================
   NEXT FEED
   ========================================================= */

function updateNextFeed() {

    const times = [

        morningFeedTime.value,

        afternoonFeedTime.value

    ].filter(
        Boolean
    );


    if (
        times.length === 0
    ) {

        nextFeed.textContent =
            "No schedule set";


        nextFeedCountdown.textContent =
            "Set your feeding times";


        return;

    }


    const now =
        new Date();


    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();


    const upcoming =
        times
            .map(
                time => {

                    const [
                        hours,
                        minutes
                    ] =
                        time
                            .split(":")
                            .map(Number);


                    return {

                        time,

                        minutes:
                            hours * 60 +
                            minutes

                    };

                }
            )
            .filter(
                item =>
                    item.minutes >
                    currentMinutes
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    a.minutes -
                    b.minutes
            );


    let next;


    if (
        upcoming.length > 0
    ) {

        next =
            upcoming[0];

    }

    else {

        const first =
            times
                .map(
                    time => {

                        const [
                            hours,
                            minutes
                        ] =
                            time
                                .split(":")
                                .map(Number);


                        return {

                            time,

                            minutes:
                                hours * 60 +
                                minutes

                        };

                    }
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        a.minutes -
                        b.minutes
                )[0];


        next = first;

    }


    nextFeed.textContent =
        formatTime(
            next.time
        );


    const difference =
        next.minutes -
        currentMinutes;


    const minutesUntil =
        difference > 0
            ? difference
            : difference +
                1440;


    const hours =
        Math.floor(
            minutesUntil /
            60
        );


    const minutes =
        minutesUntil %
        60;


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


function formatTime(
    time
) {

    if (!time) {

        return "—";

    }


    const [
        hourString,
        minuteString
    ] =
        time.split(":");


    const hour =
        Number(
            hourString
        );


    const minute =
        Number(
            minuteString
        );


    const suffix =
        hour >= 12
            ? "PM"
            : "AM";


    const displayHour =
        hour % 12 ||
        12;


    return `${displayHour}:${String(
        minute
    ).padStart(
        2,
        "0"
    )} ${suffix}`;

}


/* =========================================================
   ALARM
   ========================================================= */

function getAlarmEnabled() {

    return (
        localStorage.getItem(
            "alarmEnabled"
        ) === "true"
    );

}


function updateAlarmDisplay() {

    const enabled =
        getAlarmEnabled();


    if (enabled) {

        alarmStatus.textContent =
            "Alarm On";


        alarmMessage.textContent =
            "Feed alarm is active.";


        alarmButton.textContent =
            "Disable Alarm";

    }

    else {

        alarmStatus.textContent =
            "Alarm Off";


        alarmMessage.textContent =
            "Feed alarm is currently disabled.";


        alarmButton.textContent =
            "Enable Alarm";

    }

}


alarmButton.addEventListener(
    "click",
    () => {

        const enabled =
            !getAlarmEnabled();


        localStorage.setItem(
            "alarmEnabled",
            String(
                enabled
            )
        );


        updateAlarmDisplay();

    }
);


/* =========================================================
   ALARM CHECK
   ========================================================= */

let lastAlarmTrigger =
    "";


function checkFeedAlarm() {

    if (
        !getAlarmEnabled()
    ) {

        return;

    }


    const now =
        new Date();


    const currentTime =
        `${String(
            now.getHours()
        ).padStart(
            2,
            "0"
        )}:${String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        )}`;


    const currentDate =
        getLocalDateKey();


    const schedules = [

        morningFeedTime.value,

        afternoonFeedTime.value

    ].filter(
        Boolean
    );


    schedules.forEach(
        scheduledTime => {

            const triggerKey =
                `${currentDate}-${scheduledTime}`;


            if (
                currentTime ===
                scheduledTime &&
                lastAlarmTrigger !==
                    triggerKey
            ) {

                lastAlarmTrigger =
                    triggerKey;


                triggerFeedAlarm();

            }

        }
    );

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
                    "It is feeding time for your flock."
            }
        );

    }


    alarmMessage.textContent =
        "Feeding time!";

}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

enableNotifications.addEventListener(
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
            await Notification
                .requestPermission();


        if (
            permission !==
            "granted"
        ) {

            return;

        }


        try {

            const registration =
                await navigator
                    .serviceWorker
                    .register(
                        "/service-worker.js"
                    );


            const response =
                await fetch(
                    "/vapid-public-key"
                );


            if (
                !response.ok
            ) {

                return;

            }


            const data =
                await response.json();


            const subscription =
                await registration
                    .pushManager
                    .subscribe({
                        userVisibleOnly:
                            true,

                        applicationServerKey:
                            data.publicKey
                    });


            await fetch(
                "/subscribe",
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


            enableNotifications.textContent =
                "Notifications Enabled";

        }

        catch (error) {

            console.error(
                "Notification setup failed:",
                error
            );

        }

    }
);


/* =========================================================
   SERVICE WORKER
   ========================================================= */

async function registerServiceWorker() {

    if (
        "serviceWorker" in
        navigator
    ) {

        try {

            await navigator
                .serviceWorker
                .register(
                    "/service-worker.js"
                );

        }

        catch (error) {

            console.log(
                "Service worker registration failed."
            );

        }

    }

}


/* =========================================================
   INITIALIZE APP
   ========================================================= */

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

registerServiceWorker();


/* =========================================================
   LIVE SYSTEM
   ========================================================= */

setInterval(
    () => {

        checkFeedAlarm();

        updateNextFeed();

    },
    1000
);