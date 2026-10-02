/* =========================================
   POULTRY MANAGER
   Production Tracking v2
========================================= */


/* =========================================
   DATE HELPERS
========================================= */

function getLocalDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}


function getDateFromKey(dateKey) {
    const parts = dateKey.split("-");

    return new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );
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
        day: "numeric",
        year: "numeric"
    });
}


function getLastSevenDateKeys() {
    const dates = [];

    const todayDate = new Date();

    for (let i = 6; i >= 0; i--) {

        const date = new Date(todayDate);

        date.setDate(todayDate.getDate() - i);

        dates.push(getLocalDateKey(date));
    }

    return dates;
}


/* =========================================
   GENERAL HELPERS
========================================= */

function getElement(id) {
    return document.getElementById(id);
}


function getEggHistory() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("eggHistory") || "{}"
        );

        if (
            saved &&
            typeof saved === "object" &&
            !Array.isArray(saved)
        ) {
            return saved;
        }

        return {};
    } catch (error) {
        console.error("Could not read egg history:", error);

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

    if (record === undefined || record === null) {
        return {
            eggs: 0,
            flock: 0
        };
    }

    /* Supports older history format:
       "2026-09-20": 4
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


/* =========================================
   CURRENT DATE / EGG STATE
========================================= */

const today = getLocalDateKey();

let savedDate = localStorage.getItem("eggDate");

let eggs = Number(
    localStorage.getItem("eggs")
) || 0;


/* =========================================
   DAILY ROLLOVER
========================================= */

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

    localStorage.setItem("eggs", "0");
    localStorage.setItem("eggDate", today);
}


/* =========================================
   ELEMENTS
========================================= */

const eggCountElement =
    getElement("eggCount");

const layingRateElement =
    getElement("layingRate");

const overviewEggCount =
    getElement("overviewEggCount");

const overviewLayingRate =
    getElement("overviewLayingRate");

const birdCountElement =
    getElement("birdCount");

const chickenCountElement =
    getElement("chickenCount");

const feedAmountElement =
    getElement("feedAmount");

const overviewFeedAmount =
    getElement("overviewFeedAmount");

const eggHistoryList =
    getElement("eggHistoryList");

const viewHistoryButton =
    getElement("viewHistoryButton");

const productionTrendChart =
    getElement("productionTrendChart");

const trendMaxLabel =
    getElement("trendMaxLabel");

const trendMidLabel =
    getElement("trendMidLabel");

const sevenDayEggsElement =
    getElement("sevenDayEggs");

const averageLayingRateElement =
    getElement("averageLayingRate");

const bestProductionDayElement =
    getElement("bestProductionDay");

const bestProductionEggsElement =
    getElement("bestProductionEggs");


/* =========================================
   HEADER DATE
========================================= */

function displayHeaderDate() {

    const headerDate =
        getElement("headerDate");

    if (!headerDate) return;

    headerDate.textContent =
        formatFullDate(today);
}


/* =========================================
   LAYING RATE
========================================= */

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


function getCurrentFlock() {

    return Number(
        localStorage.getItem("chickenCount")
    ) || 0;
}


/* =========================================
   TODAY'S HISTORY
========================================= */

function saveTodayEggHistory() {

    const history = getEggHistory();

    const currentFlock =
        getCurrentFlock();

    history[today] = {
        eggs: eggs,
        flock: currentFlock
    };

    saveEggHistory(history);
}


/* =========================================
   EGG DISPLAY
========================================= */

function updateEggDisplay() {

    const flock =
        getCurrentFlock();

    const rate =
        calculateLayingRate(
            eggs,
            flock
        );

    if (eggCountElement) {
        eggCountElement.textContent =
            eggs;
    }

    if (layingRateElement) {
        layingRateElement.textContent =
            rate + "%";
    }

    if (overviewEggCount) {
        overviewEggCount.textContent =
            eggs;
    }

    if (overviewLayingRate) {
        overviewLayingRate.textContent =
            rate + "%";
    }
}


/* =========================================
   ADD EGG
========================================= */

const addEggButton =
    getElement("addEggButton");

if (addEggButton) {

    addEggButton.addEventListener(
        "click",
        function () {

            eggs++;

            localStorage.setItem(
                "eggs",
                String(eggs)
            );

            localStorage.setItem(
                "eggDate",
                today
            );

            saveTodayEggHistory();

            updateEggDisplay();
            displayEggHistory();
            updateProductionSummary();
            renderProductionTrend();
        }
    );
}


/* =========================================
   REMOVE EGG
========================================= */

const removeEggButton =
    getElement("removeEggButton");

if (removeEggButton) {

    removeEggButton.addEventListener(
        "click",
        function () {

            if (eggs <= 0) {
                return;
            }

            eggs--;

            localStorage.setItem(
                "eggs",
                String(eggs)
            );

            saveTodayEggHistory();

            updateEggDisplay();
            displayEggHistory();
            updateProductionSummary();
            renderProductionTrend();
        }
    );
}


/* =========================================
   EGG HISTORY
========================================= */

let showAllHistory = false;


function displayEggHistory() {

    if (!eggHistoryList) return;

    const history =
        getEggHistory();

    const dates =
        Object.keys(history)
            .sort()
            .reverse();

    eggHistoryList.innerHTML = "";

    if (dates.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "history-row";

        empty.textContent =
            "No production history yet.";

        eggHistoryList.appendChild(empty);

        if (viewHistoryButton) {
            viewHistoryButton.style.display =
                "none";
        }

        return;
    }


    const datesToShow =
        showAllHistory
            ? dates
            : dates.slice(0, 4);


    datesToShow.forEach(
        function (dateKey) {

            const record =
                getHistoryRecord(dateKey);

            const row =
                document.createElement("div");

            row.className =
                "history-row";


            const dateElement =
                document.createElement("span");

            dateElement.className =
                "history-date";

            dateElement.textContent =
                dateKey === today
                    ? "Today"
                    : formatDate(dateKey);


            const eggsElement =
                document.createElement("span");

            eggsElement.className =
                "history-eggs";

            eggsElement.textContent =
                record.eggs + " eggs";


            const rateElement =
                document.createElement("span");

            rateElement.className =
                "history-rate";

            const rate =
                calculateLayingRate(
                    record.eggs,
                    record.flock
                );

            rateElement.textContent =
                record.flock > 0
                    ? rate + "%"
                    : "—";


            row.appendChild(
                dateElement
            );

            row.appendChild(
                eggsElement
            );

            row.appendChild(
                rateElement
            );

            eggHistoryList.appendChild(
                row
            );
        }
    );


    if (viewHistoryButton) {

        if (dates.length > 3) {

            viewHistoryButton.style.display =
                "block";

            viewHistoryButton.textContent =
                showAllHistory
                    ? "Show Less"
                    : "View All History";

        } else {

            viewHistoryButton.style.display =
                "none";
        }
    }
}


if (viewHistoryButton) {

    viewHistoryButton.addEventListener(
        "click",
        function () {

            showAllHistory =
                !showAllHistory;

            displayEggHistory();
        }
    );
}


/* =========================================
   7-DAY PRODUCTION TREND
========================================= */

function renderProductionTrend() {

    if (!productionTrendChart) {
        return;
    }

    const dates =
        getLastSevenDateKeys();

    const records =
        dates.map(
            function (dateKey) {

                const record =
                    getHistoryRecord(dateKey);

                return {
                    date: dateKey,
                    eggs: record.eggs,
                    flock: record.flock
                };
            }
        );


    const maxEggs =
        Math.max(
            1,
            ...records.map(
                function (record) {
                    return record.eggs;
                }
            )
        );


    /*
       Give the chart a little breathing room
       above the highest bar.
    */

    const chartMax =
        Math.max(
            1,
            Math.ceil(maxEggs / 5) * 5
        );


    const midValue =
        Math.ceil(chartMax / 2);


    if (trendMaxLabel) {
        trendMaxLabel.textContent =
            chartMax;
    }

    if (trendMidLabel) {
        trendMidLabel.textContent =
            midValue;
    }


    productionTrendChart.innerHTML = "";


    records.forEach(
        function (record) {

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


            const percentage =
                record.eggs > 0
                    ? (record.eggs / chartMax) * 100
                    : 3;


            bar.style.height =
                percentage + "%";


            if (record.eggs === 0) {
                bar.classList.add("zero");
            }


            const value =
                document.createElement("span");

            value.className =
                "trend-bar-value";

            value.textContent =
                record.eggs;


            bar.appendChild(value);

            barContainer.appendChild(bar);


            const day =
                document.createElement("div");

            day.className =
                "trend-day";


            if (record.date === today) {
                day.classList.add("today");
            }


            day.textContent =
                record.date === today
                    ? "Today"
                    : formatDate(record.date);


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


/* =========================================
   PRODUCTION SUMMARY
========================================= */

function updateProductionSummary() {

    const dates =
        getLastSevenDateKeys();

    const records =
        dates.map(
            function (dateKey) {

                const record =
                    getHistoryRecord(dateKey);

                return {
                    date: dateKey,
                    eggs: record.eggs,
                    flock: record.flock
                };
            }
        );


    const totalEggs =
        records.reduce(
            function (total, record) {
                return total + record.eggs;
            },
            0
        );


    const rates =
        records
            .filter(
                function (record) {
                    return record.flock > 0;
                }
            )
            .map(
                function (record) {
                    return calculateLayingRate(
                        record.eggs,
                        record.flock
                    );
                }
            );


    const averageRate =
        rates.length > 0
            ? Math.round(
                rates.reduce(
                    function (total, rate) {
                        return total + rate;
                    },
                    0
                ) / rates.length
            )
            : 0;


    let bestRecord = null;


    records.forEach(
        function (record) {

            if (
                !bestRecord ||
                record.eggs > bestRecord.eggs
            ) {
                bestRecord = record;
            }
        }
    );


    if (sevenDayEggsElement) {
        sevenDayEggsElement.textContent =
            totalEggs;
    }


    if (averageLayingRateElement) {
        averageLayingRateElement.textContent =
            averageRate + "%";
    }


    if (
        bestProductionDayElement &&
        bestProductionEggsElement
    ) {

        if (
            bestRecord &&
            bestRecord.eggs > 0
        ) {

            bestProductionDayElement.textContent =
                bestRecord.date === today
                    ? "Today"
                    : formatDate(
                        bestRecord.date
                    );

            bestProductionEggsElement.textContent =
                bestRecord.eggs + " eggs";

        } else {

            bestProductionDayElement.textContent =
                "—";

            bestProductionEggsElement.textContent =
                "0 eggs";
        }
    }
}


/* =========================================
   FLOCK MANAGEMENT
========================================= */

let chickenCount =
    Number(
        localStorage.getItem("chickenCount")
    );

if (
    !Number.isFinite(chickenCount) ||
    chickenCount < 0
) {
    chickenCount = 0;
}


function updateChickenDisplay() {

    if (chickenCountElement) {
        chickenCountElement.textContent =
            chickenCount;
    }

    if (birdCountElement) {
        birdCountElement.textContent =
            chickenCount;
    }

    updateEggDisplay();
    updateProductionSummary();
    displayEggHistory();
    renderProductionTrend();
}


function saveChickenCount() {

    localStorage.setItem(
        "chickenCount",
        String(chickenCount)
    );

    localStorage.setItem(
        "chickenCountUpdated",
        today
    );

    saveTodayEggHistory();

    updateChickenDisplay();
}


/* ADD BIRD */

const addChicken =
    getElement("addChicken");

if (addChicken) {

    addChicken.addEventListener(
        "click",
        function () {

            chickenCount++;

            saveChickenCount();
        }
    );
}


/* REMOVE BIRD */

const removeChicken =
    getElement("removeChicken");

if (removeChicken) {

    removeChicken.addEventListener(
        "click",
        function () {

            if (chickenCount <= 0) {
                return;
            }

            chickenCount--;

            saveChickenCount();
        }
    );
}


/* SET FLOCK */

const setFlockButton =
    getElement("setFlockButton");

const flockInput =
    getElement("flockInput");

if (
    setFlockButton &&
    flockInput
) {

    setFlockButton.addEventListener(
        "click",
        function () {

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

            chickenCount =
                Math.floor(value);

            flockInput.value = "";

            saveChickenCount();
        }
    );
}


/* =========================================
   FEED MANAGEMENT
========================================= */

let feed =
    Number(
        localStorage.getItem("feed")
    );

if (
    !Number.isFinite(feed) ||
    feed < 0
) {
    feed = 0;
}


function updateFeedDisplay() {

    if (feedAmountElement) {

        feedAmountElement.textContent =
            feed.toFixed(2);
    }

    if (overviewFeedAmount) {

        overviewFeedAmount.textContent =
            feed.toFixed(2);
    }
}


function saveFeed() {

    localStorage.setItem(
        "feed",
        String(feed)
    );

    updateFeedDisplay();
}


/* ADD FEED */

const addFeedButton =
    getElement("addFeedButton");

const feedInput =
    getElement("feedInput");

if (
    addFeedButton &&
    feedInput
) {

    addFeedButton.addEventListener(
        "click",
        function () {

            const amount =
                Number(
                    feedInput.value
                );

            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {
                return;
            }

            feed += amount;

            saveFeed();

            feedInput.value = "";
        }
    );
}


/* USE FEED */

const useFeedButton =
    getElement("useFeedButton");

const useFeedInput =
    getElement("useFeedInput");

if (
    useFeedButton &&
    useFeedInput
) {

    useFeedButton.addEventListener(
        "click",
        function () {

            const amount =
                Number(
                    useFeedInput.value
                );

            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {
                return;
            }


            if (amount > feed) {

                alert(
                    "You cannot use more feed than you have in stock."
                );

                return;
            }


            feed -= amount;

            saveFeed();

            useFeedInput.value = "";
        }
    );
}


/* =========================================
   FEED SCHEDULE
========================================= */

const morningFeedTime =
    getElement("morningFeedTime");

const afternoonFeedTime =
    getElement("afternoonFeedTime");

const saveScheduleButton =
    getElement("saveScheduleButton");

const scheduleStatus =
    getElement("scheduleStatus");

const nextFeed =
    getElement("nextFeed");


function updateNextFeed() {

    if (
        !morningFeedTime ||
        !afternoonFeedTime ||
        !nextFeed
    ) {
        return;
    }


    const now =
        new Date();


    const times = [
        morningFeedTime.value,
        afternoonFeedTime.value
    ]
        .filter(Boolean)
        .sort();


    let upcoming = null;


    for (
        const time of times
    ) {

        const parts =
            time.split(":");

        const feedDate =
            new Date(now);

        feedDate.setHours(
            Number(parts[0]),
            Number(parts[1]),
            0,
            0
        );


        if (feedDate > now) {

            upcoming =
                feedDate;

            break;
        }
    }


    if (!upcoming && times.length > 0) {

        const parts =
            times[0].split(":");

        upcoming =
            new Date(now);

        upcoming.setDate(
            upcoming.getDate() + 1
        );

        upcoming.setHours(
            Number(parts[0]),
            Number(parts[1]),
            0,
            0
        );
    }


    if (!upcoming) {

        nextFeed.textContent =
            "Not scheduled";

        return;
    }


    nextFeed.textContent =
        upcoming.toLocaleTimeString(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );
}


function loadFeedSchedule() {

    const savedMorning =
        localStorage.getItem(
            "morningFeedTime"
        );

    const savedAfternoon =
        localStorage.getItem(
            "afternoonFeedTime"
        );


    if (
        savedMorning &&
        morningFeedTime
    ) {
        morningFeedTime.value =
            savedMorning;
    }


    if (
        savedAfternoon &&
        afternoonFeedTime
    ) {
        afternoonFeedTime.value =
            savedAfternoon;
    }


    updateNextFeed();
}


if (saveScheduleButton) {

    saveScheduleButton.addEventListener(
        "click",
        async function () {

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


            updateNextFeed();


            if (scheduleStatus) {

                scheduleStatus.textContent =
                    "Schedule saved.";
            }


            setTimeout(
                function () {

                    if (scheduleStatus) {
                        scheduleStatus.textContent =
                            "";
                    }

                },
                2500
            );


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
                    "Schedule sync unavailable:",
                    error
                );
            }
        }
    );
}


/* =========================================
   FEED ALARM
========================================= */

let alarmEnabled =
    localStorage.getItem(
        "alarmEnabled"
    ) === "true";


const alarmButton =
    getElement("alarmButton");

const alarmStatus =
    getElement("alarmStatus");

const alarmMessage =
    getElement("alarmMessage");


function updateAlarmDisplay() {

    if (
        !alarmButton ||
        !alarmStatus
    ) {
        return;
    }


    if (alarmEnabled) {

        alarmButton.textContent =
            "Disable Feed Alarm";

        alarmStatus.textContent =
            "Enabled";

    } else {

        alarmButton.textContent =
            "Enable Feed Alarm";

        alarmStatus.textContent =
            "Disabled";
    }
}


if (alarmButton) {

    alarmButton.addEventListener(
        "click",
        function () {

            alarmEnabled =
                !alarmEnabled;


            localStorage.setItem(
                "alarmEnabled",
                String(alarmEnabled)
            );


            updateAlarmDisplay();


            if (alarmMessage) {

                alarmMessage.textContent =
                    alarmEnabled
                        ? "Feed alarm enabled."
                        : "Feed alarm disabled.";
            }


            setTimeout(
                function () {

                    if (alarmMessage) {
                        alarmMessage.textContent =
                            "";
                    }

                },
                2500
            );
        }
    );
}


/* =========================================
   ALARM CHECK
========================================= */

let lastAlarmKey =
    localStorage.getItem(
        "lastAlarmKey"
    );


function checkFeedAlarm() {

    if (!alarmEnabled) {
        return;
    }


    const now =
        new Date();

    const currentTime =
        String(
            now.getHours()
        ).padStart(2, "0") +
        ":" +
        String(
            now.getMinutes()
        ).padStart(2, "0");


    const currentDate =
        getLocalDateKey(now);


    const morning =
        localStorage.getItem(
            "morningFeedTime"
        );

    const afternoon =
        localStorage.getItem(
            "afternoonFeedTime"
        );


    if (
        currentTime !== morning &&
        currentTime !== afternoon
    ) {
        return;
    }


    const alarmKey =
        currentDate +
        "-" +
        currentTime;


    if (lastAlarmKey === alarmKey) {
        return;
    }


    lastAlarmKey =
        alarmKey;


    localStorage.setItem(
        "lastAlarmKey",
        alarmKey
    );


    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {

        new Notification(
            "Poultry Manager",
            {
                body:
                    "It's time to feed your chickens."
            }
        );

    } else {

        alert(
            "Poultry Manager: It's time to feed your chickens."
        );
    }
}


/* =========================================
   NOTIFICATIONS
========================================= */

let serviceWorkerRegistration = null;


async function registerServiceWorker() {

    if (
        !("serviceWorker" in navigator)
    ) {
        return;
    }


    try {

        serviceWorkerRegistration =
            await navigator.serviceWorker.register(
                "/service-worker.js"
            );

        console.log(
            "Service worker registered."
        );

    } catch (error) {

        console.log(
            "Service worker registration failed:",
            error
        );
    }
}


async function enableNotifications() {

    if (
        !("Notification" in window)
    ) {

        alert(
            "Notifications are not supported on this device."
        );

        return;
    }


    const permission =
        await Notification.requestPermission();


    if (
        permission !== "granted"
    ) {

        alert(
            "Notification permission was not granted."
        );

        return;
    }


    try {

        if (!serviceWorkerRegistration) {

            await registerServiceWorker();
        }


        if (
            !serviceWorkerRegistration
        ) {
            return;
        }


        let subscription =
            await serviceWorkerRegistration
                .pushManager
                .getSubscription();


        if (!subscription) {

            const response =
                await fetch(
                    "/vapid-public-key"
                );


            if (!response.ok) {
                throw new Error(
                    "Could not get VAPID key."
                );
            }


            const data =
                await response.json();


            const applicationServerKey =
                urlBase64ToUint8Array(
                    data.publicKey
                );


            subscription =
                await serviceWorkerRegistration
                    .pushManager
                    .subscribe({
                        userVisibleOnly: true,
                        applicationServerKey
                    });
        }


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


        alert(
            "Notifications enabled."
        );

    } catch (error) {

        console.error(
            "Notification setup failed:",
            error
        );

        alert(
            "Notifications could not be enabled."
        );
    }
}


function urlBase64ToUint8Array(base64String) {

    const padding =
        "=".repeat(
            (4 - base64String.length % 4) % 4
        );

    const base64 =
        (
            base64String +
            padding
        )
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


const enableNotificationsButton =
    getElement(
        "enableNotifications"
    );


if (enableNotificationsButton) {

    enableNotificationsButton.addEventListener(
        "click",
        enableNotifications
    );
}


/* =========================================
   INITIALIZATION
========================================= */

displayHeaderDate();

updateEggDisplay();

updateChickenDisplay();

updateFeedDisplay();

displayEggHistory();

updateProductionSummary();

renderProductionTrend();

loadFeedSchedule();

updateAlarmDisplay();

registerServiceWorker();


/* =========================================
   TIMERS
========================================= */

setInterval(
    function () {

        checkFeedAlarm();

        updateNextFeed();

    },
    1000
);
