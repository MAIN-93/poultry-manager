/* =========================================================
   POULTRY MANAGER
   Production Tracking v3
   ========================================================= */


/* =========================================================
   DOM REFERENCES
   ========================================================= */

const headerDate = document.getElementById("headerDate");

const birdCount = document.getElementById("birdCount");
const overviewEggCount = document.getElementById("overviewEggCount");
const overviewLayingRate = document.getElementById("overviewLayingRate");
const overviewFeedAmount = document.getElementById("overviewFeedAmount");

const sevenDayEggs = document.getElementById("sevenDayEggs");
const averageLayingRate = document.getElementById("averageLayingRate");
const bestProductionDay = document.getElementById("bestProductionDay");
const bestProductionEggs = document.getElementById("bestProductionEggs");

const trendMaxLabel = document.getElementById("trendMaxLabel");
const trendMidLabel = document.getElementById("trendMidLabel");
const productionTrendChart = document.getElementById("productionTrendChart");

const analyticsEggsPerHen = document.getElementById("analyticsEggsPerHen");
const analyticsAverage = document.getElementById("analyticsAverage");
const analyticsHighestDay = document.getElementById("analyticsHighestDay");
const analyticsHighestDayDate = document.getElementById("analyticsHighestDayDate");
const analyticsLowestDay = document.getElementById("analyticsLowestDay");
const analyticsLowestDayDate = document.getElementById("analyticsLowestDayDate");
const analyticsConsistency = document.getElementById("analyticsConsistency");
const analyticsChange = document.getElementById("analyticsChange");

const eggCount = document.getElementById("eggCount");
const layingRate = document.getElementById("layingRate");

const addEggButton = document.getElementById("addEggButton");
const removeEggButton = document.getElementById("removeEggButton");

const eggHistoryList = document.getElementById("eggHistoryList");
const viewHistoryButton = document.getElementById("viewHistoryButton");

const feedAmount = document.getElementById("feedAmount");
const feedInput = document.getElementById("feedInput");
const addFeedButton = document.getElementById("addFeedButton");

const useFeedInput = document.getElementById("useFeedInput");
const useFeedButton = document.getElementById("useFeedButton");

const morningFeedTime = document.getElementById("morningFeedTime");
const afternoonFeedTime = document.getElementById("afternoonFeedTime");
const saveScheduleButton = document.getElementById("saveScheduleButton");
const scheduleStatus = document.getElementById("scheduleStatus");
const nextFeed = document.getElementById("nextFeed");

const chickenCount = document.getElementById("chickenCount");
const addChicken = document.getElementById("addChicken");
const removeChicken = document.getElementById("removeChicken");
const flockInput = document.getElementById("flockInput");
const setFlockButton = document.getElementById("setFlockButton");

const alarmButton = document.getElementById("alarmButton");
const alarmStatus = document.getElementById("alarmStatus");
const alarmMessage = document.getElementById("alarmMessage");

const enableNotifications = document.getElementById("enableNotifications");


/* =========================================================
   DATE HELPERS
   ========================================================= */

function getLocalDateKey(date = new Date()) {

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1)
        .padStart(2, "0");

    const day = String(date.getDate())
        .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getDateFromKey(dateKey) {

    const [year, month, day] = dateKey
        .split("-")
        .map(Number);

    return new Date(year, month - 1, day);
}


function formatDate(dateKey) {

    const date = getDateFromKey(dateKey);

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
    });
}


function formatFullDate(dateKey) {

    const date = getDateFromKey(dateKey);

    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
    });
}


function getLastSevenDateKeys() {

    const dates = [];

    const today = new Date();

    for (let i = 6; i >= 0; i--) {

        const date = new Date(today);

        date.setDate(today.getDate() - i);

        dates.push(getLocalDateKey(date));
    }

    return dates;
}


/* =========================================================
   HEADER
   ========================================================= */

function displayHeaderDate() {

    const today = new Date();

    headerDate.textContent = today.toLocaleDateString(
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
            localStorage.getItem("eggHistory")
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


function getHistoryRecord(dateKey) {

    const history = getEggHistory();

    const record = history[dateKey];

    if (
        record === undefined ||
        record === null
    ) {

        return {
            eggs: 0,
            flock: 0
        };

    }


    /*
       Backward compatibility.

       Older versions stored:

       "2026-09-30": 2

       New versions store:

       "2026-09-30": {
           eggs: 2,
           flock: 5
       }
    */

    if (typeof record === "number") {

        return {
            eggs: record,
            flock: 0
        };

    }


    return {

        eggs: Number(record.eggs) || 0,

        flock: Number(record.flock) || 0

    };
}


/* =========================================================
   CURRENT DAY
   ========================================================= */

const today = getLocalDateKey();

let savedDate = localStorage.getItem("eggDate");

let eggs = Number(
    localStorage.getItem("eggs")
) || 0;


/* =========================================================
   DAILY ROLLOVER
   ========================================================= */

if (savedDate !== today) {

    const history = getEggHistory();

    if (savedDate) {

        const previousFlock =
            Number(
                localStorage.getItem("chickenCount")
            ) || 0;


        history[savedDate] = {

            eggs: eggs,

            flock: previousFlock

        };

    }


    saveEggHistory(history);


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
        localStorage.getItem("chickenCount")
    ) || 0;
}


/* =========================================================
   LAYING RATE
   ========================================================= */

function calculateLayingRate(
    eggAmount,
    flockSize
) {

    if (!flockSize || flockSize <= 0) {

        return 0;

    }


    return Math.round(
        (eggAmount / flockSize) * 100
    );
}


/* =========================================================
   SAVE TODAY'S HISTORY
   ========================================================= */

function saveTodayEggHistory() {

    const history = getEggHistory();

    history[today] = {

        eggs: eggs,

        flock: getCurrentFlock()

    };

    saveEggHistory(history);
}


/* =========================================================
   EGG DISPLAY
   ========================================================= */

function updateEggDisplay() {

    const flock = getCurrentFlock();

    const rate = calculateLayingRate(
        eggs,
        flock
    );


    eggCount.textContent = eggs;

    layingRate.textContent = `${rate}%`;

    overviewEggCount.textContent = eggs;

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
            String(eggs)
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

        if (eggs <= 0) {

            return;

        }


        eggs -= 1;

        localStorage.setItem(
            "eggs",
            String(eggs)
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

let historyExpanded = false;


function displayEggHistory() {

    const history = getEggHistory();

    const records = Object.entries(history)
        .sort(
            ([dateA], [dateB]) =>
                dateB.localeCompare(dateA)
        );


    eggHistoryList.innerHTML = "";


    if (records.length === 0) {

        eggHistoryList.innerHTML = `
            <div class="empty-state">
                No egg history yet.
            </div>
        `;

        viewHistoryButton.style.display = "none";

        return;
    }


    const visibleRecords =
        historyExpanded
            ? records
            : records.slice(0, 4);


    visibleRecords.forEach(
        ([dateKey]) => {

            const record =
                getHistoryRecord(dateKey);

            const rate =
                calculateLayingRate(
                    record.eggs,
                    record.flock
                );


            const item =
                document.createElement("div");

            item.className =
                "history-item";


            item.innerHTML = `

                <div>
                    <strong>
                        ${formatFullDate(dateKey)}
                    </strong>

                    <small>
                        ${record.eggs} ${
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


            eggHistoryList.appendChild(item);

        }
    );


    if (records.length > 4) {

        viewHistoryButton.style.display =
            "inline-flex";

        viewHistoryButton.textContent =
            historyExpanded
                ? "Show Less"
                : "View All History";

    } else {

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
        dates.map(dateKey => {

            const record =
                getHistoryRecord(dateKey);

            return {

                date: dateKey,

                eggs: record.eggs,

                flock: record.flock

            };

        });


    const totalEggs =
        records.reduce(
            (total, record) =>
                total + record.eggs,
            0
        );


    const rateRecords =
        records.filter(
            record => record.flock > 0
        );


    let averageRate = 0;


    if (rateRecords.length > 0) {

        averageRate =
            Math.round(
                rateRecords.reduce(
                    (total, record) =>
                        total +
                        calculateLayingRate(
                            record.eggs,
                            record.flock
                        ),
                    0
                ) / rateRecords.length
            );

    }


    const bestRecord =
        records.reduce(
            (best, record) =>
                record.eggs > best.eggs
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
            ? formatDate(bestRecord.date)
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
        dates.map(dateKey => {

            const record =
                getHistoryRecord(dateKey);

            return {

                date: dateKey,

                eggs: record.eggs,

                flock: record.flock

            };

        });


    const maxEggs =
        Math.max(
            1,
            ...records.map(
                record => record.eggs
            )
        );


    const chartMax =
        Math.max(
            1,
            Math.ceil(maxEggs / 5) * 5
        );


    const midValue =
        Math.ceil(chartMax / 2);


    trendMaxLabel.textContent =
        chartMax;

    trendMidLabel.textContent =
        midValue;


    productionTrendChart.innerHTML = "";


    records.forEach(record => {

        const column =
            document.createElement("div");

        column.className =
            "trend-column";


        const barContainer =
            document.createElement("div");

        barContainer.className =
            "trend-bar-container";


        const bar =
            document.createElement("div");

        bar.className =
            "trend-bar";


        if (record.eggs === 0) {

            bar.classList.add("zero");

        }


        const height =
            record.eggs === 0
                ? 0
                : (record.eggs / chartMax) * 100;


        bar.style.height =
            `${height}%`;


        const value =
            document.createElement("span");

        value.className =
            "trend-bar-value";

        value.textContent =
            record.eggs;


        bar.appendChild(value);

        barContainer.appendChild(bar);


        const day =
            document.createElement("span");

        day.className =
            "trend-day";


        if (record.date === today) {

            day.classList.add("today");

        }


        day.textContent =
            formatDate(record.date);


        column.appendChild(
            barContainer
        );

        column.appendChild(day);


        productionTrendChart.appendChild(
            column
        );

    });

}


/* =========================================================
   PRODUCTION ANALYTICS
   ========================================================= */

function updateProductionAnalytics() {
    const dateKeys = getLastSevenDateKeys();

    const records = dateKeys.map(dateKey => {
        const record = getHistoryRecord(dateKey);

        return {
            dateKey,
            eggs: Number(record.eggs) || 0,
            flock: Number(record.flock) || 0
        };
    });

    const totalEggs = records.reduce((sum, record) => {
        return sum + record.eggs;
    }, 0);

    const daysProducing = records.filter(record => record.eggs > 0).length;

    const averageDailyEggs = totalEggs / 7;

    /*
     * Eggs per hen
     *
     * Only use days where we have a recorded flock size.
     * This prevents missing flock data from incorrectly
     * affecting the calculation.
     */
    const flockRecords = records.filter(record => record.flock > 0);

    const averageFlock = flockRecords.length > 0
        ? flockRecords.reduce((sum, record) => {
            return sum + record.flock;
        }, 0) / flockRecords.length
        : 0;

    const eggsPerHen = averageFlock > 0
        ? totalEggs / averageFlock
        : 0;

    /*
     * Highest and lowest production days.
     */
    const highestRecord = records.reduce((highest, record) => {
        return record.eggs > highest.eggs ? record : highest;
    }, records[0]);

    const lowestRecord = records.reduce((lowest, record) => {
        return record.eggs < lowest.eggs ? record : lowest;
    }, records[0]);

    /*
     * Production consistency.
     *
     * Example:
     * 7 productive days out of 7 = 100%
     * 5 productive days out of 7 = 71%
     */
    const consistency = Math.round((daysProducing / 7) * 100);

    /*
     * Compare the first 3 days with the latest 3 days.
     */
    const earlierRecords = records.slice(0, 3);
    const recentRecords = records.slice(4, 7);

    const earlierAverage =
        earlierRecords.reduce((sum, record) => {
            return sum + record.eggs;
        }, 0) / 3;

    const recentAverage =
        recentRecords.reduce((sum, record) => {
            return sum + record.eggs;
        }, 0) / 3;

    let changeText = "0%";

    if (earlierAverage === 0 && recentAverage > 0) {
        changeText = "New";
    } else if (earlierAverage > 0) {
        const change = ((recentAverage - earlierAverage) / earlierAverage) * 100;

        changeText = `${change >= 0 ? "+" : ""}${Math.round(change)}%`;
    }

    /*
     * Format dates for display.
     */
    function formatAnalyticsDate(dateKey) {
        if (!dateKey) return "No data";

        const date = new Date(`${dateKey}T00:00:00`);

        return date.toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short"
        });
    }

    /*
     * Production insight.
     */
    let insight = "";

    if (totalEggs === 0) {
        insight = "No eggs have been recorded during this 7-day period yet.";
    } else if (consistency === 100) {
        if (recentAverage > earlierAverage) {
            insight = `Your flock produced eggs every day, and recent production is higher than earlier in the week.`;
        } else if (recentAverage < earlierAverage) {
            insight = `Your flock produced eggs every day, but recent production is lower than earlier in the week.`;
        } else {
            insight = `Your flock produced eggs every day with a relatively stable production pattern.`;
        }
    } else if (consistency >= 70) {
        insight = `Your flock produced eggs on ${daysProducing} of the last 7 days. Production is occurring regularly, with some days having no recorded eggs.`;
    } else if (consistency >= 40) {
        insight = `Your flock produced eggs on ${daysProducing} of the last 7 days. There is noticeable variation in production across the period.`;
    } else {
        insight = `Egg production was recorded on ${daysProducing} of the last 7 days. More daily records will make the production pattern clearer.`;
    }

    /*
     * Update the dashboard.
     */
    document.getElementById("analyticsEggsPerHen").textContent =
        eggsPerHen.toFixed(2);

    document.getElementById("analyticsAverage").textContent =
        averageDailyEggs.toFixed(2);

    document.getElementById("analyticsHighestDay").textContent =
        highestRecord.eggs;

    document.getElementById("analyticsHighestDayDate").textContent =
        formatAnalyticsDate(highestRecord.dateKey);

    document.getElementById("analyticsLowestDay").textContent =
        lowestRecord.eggs;

    document.getElementById("analyticsLowestDayDate").textContent =
        formatAnalyticsDate(lowestRecord.dateKey);

    document.getElementById("analyticsConsistency").textContent =
        `${consistency}%`;

    document.getElementById("analyticsChange").textContent =
        changeText;

    document.getElementById("analyticsInsight").textContent =
        insight;
}
    /*
       ---------------------------------------------
       7-DAY TOTAL
       ---------------------------------------------
    */

    const totalEggs =
        records.reduce(
            (total, record) =>
                total + record.eggs,
            0
        );


    /*
       ---------------------------------------------
       EGGS PER HEN
       
       Uses the average recorded flock size
       across the seven-day period.
       ---------------------------------------------
    */

    const flockRecords =
        records.filter(
            record => record.flock > 0
        );


    let averageFlock = 0;


    if (flockRecords.length > 0) {

        averageFlock =
            flockRecords.reduce(
                (total, record) =>
                    total + record.flock,
                0
            ) / flockRecords.length;

    }


    if (averageFlock > 0) {

        const eggsPerHen =
            totalEggs / averageFlock;


        analyticsEggsPerHen.textContent =
            eggsPerHen.toFixed(2);

    } else {

        analyticsEggsPerHen.textContent =
            "—";

    }


    /*
       ---------------------------------------------
       7-DAY AVERAGE
       ---------------------------------------------
    */

    const sevenDayAverage =
        totalEggs / 7;


    analyticsAverage.textContent =
        sevenDayAverage.toFixed(2);


    /*
       ---------------------------------------------
       HIGHEST PRODUCTION DAY
       ---------------------------------------------
    */

    const highestRecord =
        records.reduce(
            (highest, record) =>
                record.eggs > highest.eggs
                    ? record
                    : highest,
            records[0]
        );


    if (totalEggs > 0) {

        analyticsHighestDay.textContent =
            `${highestRecord.eggs} ${
                highestRecord.eggs === 1
                    ? "egg"
                    : "eggs"
            }`;

        analyticsHighestDayDate.textContent =
            formatFullDate(
                highestRecord.date
            );

    } else {

        analyticsHighestDay.textContent =
            "—";

        analyticsHighestDayDate.textContent =
            "No data";

    }


    /*
       ---------------------------------------------
       LOWEST PRODUCTION DAY
       
       Includes zero-production calendar days.
       ---------------------------------------------
    */

    const lowestRecord =
        records.reduce(
            (lowest, record) =>
                record.eggs < lowest.eggs
                    ? record
                    : lowest,
            records[0]
        );


    if (totalEggs > 0) {

        analyticsLowestDay.textContent =
            `${lowestRecord.eggs} ${
                lowestRecord.eggs === 1
                    ? "egg"
                    : "eggs"
            }`;

        analyticsLowestDayDate.textContent =
            formatFullDate(
                lowestRecord.date
            );

    } else {

        analyticsLowestDay.textContent =
            "—";

        analyticsLowestDayDate.textContent =
            "No data";

    }


    /*
       ---------------------------------------------
       PRODUCTION CONSISTENCY
       
       Percentage of the seven calendar days
       that had at least one egg recorded.
       ---------------------------------------------
    */

    const productionDays =
        records.filter(
            record => record.eggs > 0
        ).length;


    const consistency =
        Math.round(
            (productionDays / 7) * 100
        );


    analyticsConsistency.textContent =
        `${consistency}%`;


    /*
       ---------------------------------------------
       PRODUCTION CHANGE
       
       Compares the first three days against
       the latest three days.
       
       Day 4 is intentionally excluded so the
       two groups have equal size.
       ---------------------------------------------
    */

    const earlierRecords =
        records.slice(0, 3);

    const recentRecords =
        records.slice(4, 7);


    const earlierAverage =
        earlierRecords.reduce(
            (total, record) =>
                total + record.eggs,
            0
        ) / earlierRecords.length;


    const recentAverage =
        recentRecords.reduce(
            (total, record) =>
                total + record.eggs,
            0
        ) / recentRecords.length;


    if (earlierAverage === 0) {

        if (recentAverage > 0) {

            analyticsChange.textContent =
                "New";

        } else {

            analyticsChange.textContent =
                "0%";

        }

    } else {

        const change =
            (
                (recentAverage -
                    earlierAverage) /
                earlierAverage
            ) * 100;


        const roundedChange =
            Math.round(change);


        analyticsChange.textContent =
            `${roundedChange > 0 ? "+" : ""}${roundedChange}%`;

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
            String(flock)
        );


        saveTodayEggHistory();

        updateChickenDisplay();

        displayEggHistory();

        updateProductionSummary();

        renderProductionTrend();

        updateProductionAnalytics();

    }
);


removeChicken.addEventListener(
    "click",
    () => {

        let flock =
            getCurrentFlock();


        if (flock <= 0) {

            return;

        }


        flock -= 1;


        localStorage.setItem(
            "chickenCount",
            String(flock)
        );


        saveTodayEggHistory();

        updateChickenDisplay();

        displayEggHistory();

        updateProductionSummary();

        renderProductionTrend();

        updateProductionAnalytics();

    }
);


setFlockButton.addEventListener(
    "click",
    () => {

        const value =
            Number(flockInput.value);


        if (
            !Number.isFinite(value) ||
            value < 0
        ) {

            return;

        }


        const flock =
            Math.floor(value);


        localStorage.setItem(
            "chickenCount",
            String(flock)
        );


        flockInput.value = "";


        saveTodayEggHistory();

        updateChickenDisplay();

        displayEggHistory();

        updateProductionSummary();

        renderProductionTrend();

        updateProductionAnalytics();

    }
);


/* =========================================================
   FEED MANAGEMENT
   ========================================================= */

function getFeedAmount() {

    return Number(
        localStorage.getItem("feed")
    ) || 0;

}


function updateFeedDisplay() {

    const amount =
        getFeedAmount();


    feedAmount.textContent =
        `${amount.toFixed(1)} kg`;

    overviewFeedAmount.textContent =
        `${amount.toFixed(1)} kg`;

}


addFeedButton.addEventListener(
    "click",
    () => {

        const amount =
            Number(feedInput.value);


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            return;

        }


        const current =
            getFeedAmount();


        const updated =
            current + amount;


        localStorage.setItem(
            "feed",
            String(updated)
        );


        feedInput.value = "";

        updateFeedDisplay();

    }
);


useFeedButton.addEventListener(
    "click",
    () => {

        const amount =
            Number(useFeedInput.value);


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            return;

        }


        const current =
            getFeedAmount();


        const updated =
            Math.max(
                0,
                current - amount
            );


        localStorage.setItem(
            "feed",
            String(updated)
        );


        useFeedInput.value = "";

        updateFeedDisplay();

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

                    body: JSON.stringify({
                        morning,
                        afternoon
                    })
                }
            );

        } catch (error) {

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

    ].filter(Boolean);


    if (times.length === 0) {

        nextFeed.textContent =
            "No schedule set";

        return;

    }


    const now = new Date();

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();


    const upcoming =
        times
            .map(time => {

                const [
                    hours,
                    minutes
                ] = time
                    .split(":")
                    .map(Number);


                return {

                    time,

                    minutes:
                        hours * 60 +
                        minutes

                };

            })
            .filter(
                item =>
                    item.minutes >
                    currentMinutes
            )
            .sort(
                (a, b) =>
                    a.minutes -
                    b.minutes
            );


    if (upcoming.length > 0) {

        nextFeed.textContent =
            formatTime(
                upcoming[0].time
            );

        return;

    }


    nextFeed.textContent =
        formatTime(times[0]) +
        " tomorrow";

}


function formatTime(time) {

    if (!time) {

        return "—";

    }


    const [
        hourString,
        minuteString
    ] = time.split(":");


    const hour =
        Number(hourString);

    const minute =
        Number(minuteString);


    const suffix =
        hour >= 12
            ? "PM"
            : "AM";


    const displayHour =
        hour % 12 || 12;


    return `${displayHour}:${String(
        minute
    ).padStart(2, "0")} ${suffix}`;

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

    } else {

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
            String(enabled)
        );


        updateAlarmDisplay();

    }
);


/* =========================================================
   ALARM CHECK
   ========================================================= */

let lastAlarmTrigger = "";


function checkFeedAlarm() {

    if (!getAlarmEnabled()) {

        return;

    }


    const now = new Date();

    const currentTime =
        `${String(
            now.getHours()
        ).padStart(2, "0")}:${String(
            now.getMinutes()
        ).padStart(2, "0")}`;


    const currentDate =
        getLocalDateKey();


    const schedules = [

        morningFeedTime.value,

        afternoonFeedTime.value

    ].filter(Boolean);


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
            !("Notification" in window)
        ) {

            return;

        }


        const permission =
            await Notification.requestPermission();


        if (
            permission !== "granted"
        ) {

            return;

        }


        try {

            const registration =
                await navigator.serviceWorker
                    .register(
                        "/service-worker.js"
                    );


            const response =
                await fetch(
                    "/vapid-public-key"
                );


            if (!response.ok) {

                return;

            }


            const data =
                await response.json();


            const subscription =
                await registration.pushManager
                    .subscribe({
                        userVisibleOnly: true,

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

                    body: JSON.stringify(
                        subscription
                    )
                }
            );


            enableNotifications.textContent =
                "Notifications Enabled";

        } catch (error) {

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
        "serviceWorker" in navigator
    ) {

        try {

            await navigator.serviceWorker
                .register(
                    "/service-worker.js"
                );

        } catch (error) {

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

updateFeedDisplay();

displayEggHistory();

updateProductionSummary();

renderProductionTrend();

updateProductionAnalytics();

loadFeedSchedule();

updateAlarmDisplay();

registerServiceWorker();


/* =========================================================
   LIVE CHECKS
   ========================================================= */

setInterval(
    () => {

        checkFeedAlarm();

        updateNextFeed();

    },
    1000
);
