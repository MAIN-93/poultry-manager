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
    document.getElementById(
        "feedConsumptionChart"
    );


const feedHistoryList =
    document.getElementById(
        "feedHistoryList"
    );

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
   RESET TODAY'S FEED USAGE
   ========================================================= */

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
                "Reset today's feed usage? This will remove today's recorded usage and recalculate the feed analytics."
            );

        if (
            !confirmed
        ) {

            return;

        }

        delete history[today];

        saveFeedUsageHistory(
            history
        );

        useFeedInput.value = "";

        updateFeedManagement();

    }
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
                record.eg