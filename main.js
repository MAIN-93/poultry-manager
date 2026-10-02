/* =========================================
   POULTRY MANAGER
   Main Application Logic
========================================= */


/* =========================================
   DATE
========================================= */

const today = new Date().toISOString().split("T")[0];

let savedDate =
    localStorage.getItem("eggDate");

let eggs =
    Number(localStorage.getItem("eggs")) || 0;


/* =========================================
   EGG DAY ROLLOVER
========================================= */

if (savedDate !== today) {

    let eggHistory =
        JSON.parse(
            localStorage.getItem("eggHistory")
        ) || {};


    if (savedDate) {

        const flockSize =
            Number(
                localStorage.getItem("chickenCount")
            ) || 0;


        eggHistory[savedDate] = {
            eggs: eggs,
            flock: flockSize
        };
    }


    localStorage.setItem(
        "eggHistory",
        JSON.stringify(eggHistory)
    );


    eggs = 0;


    localStorage.setItem(
        "eggs",
        eggs
    );


    localStorage.setItem(
        "eggDate",
        today
    );
}


/* =========================================
   DOM HELPERS
========================================= */

function getElement(id) {
    return document.getElementById(id);
}


/* =========================================
   HEADER DATE
========================================= */

const headerDate =
    getElement("headerDate");


if (headerDate) {

    headerDate.textContent =
        new Date().toLocaleDateString(
            "en-US",
            {
                weekday: "short",
                month: "short",
                day: "numeric"
            }
        );
}


/* =========================================
   EGG ELEMENTS
========================================= */

const eggCount =
    getElement("eggCount");

const overviewEggCount =
    getElement("overviewEggCount");

const addEggButton =
    getElement("addEggButton");

const removeEggButton =
    getElement("removeEggButton");


/* =========================================
   EGG DISPLAY
========================================= */

function updateEggDisplay() {

    if (eggCount) {
        eggCount.textContent = eggs;
    }


    if (overviewEggCount) {
        overviewEggCount.textContent = eggs;
    }
}


updateEggDisplay();


/* =========================================
   ADD EGG
========================================= */

if (addEggButton) {

    addEggButton.addEventListener(
        "click",
        function() {

            eggs++;


            localStorage.setItem(
                "eggs",
                eggs
            );


            localStorage.setItem(
                "eggDate",
                today
            );


            updateEggDisplay();

            updateLayingRate();

            saveTodayEggHistory();

            displayEggHistory();
        }
    );
}


/* =========================================
   REMOVE EGG
========================================= */

if (removeEggButton) {

    removeEggButton.addEventListener(
        "click",
        function() {

            if (eggs <= 0) {
                return;
            }


            eggs--;


            localStorage.setItem(
                "eggs",
                eggs
            );


            localStorage.setItem(
                "eggDate",
                today
            );


            updateEggDisplay();

            updateLayingRate();

            saveTodayEggHistory();

            displayEggHistory();
        }
    );
}


/* =========================================
   FEED
========================================= */

let feed =
    Number(
        localStorage.getItem("feed")
    ) || 0;


const feedAmount =
    getElement("feedAmount");

const overviewFeedAmount =
    getElement("overviewFeedAmount");

const feedInput =
    getElement("feedInput");

const addFeedButton =
    getElement("addFeedButton");

const useFeedInput =
    getElement("useFeedInput");

const useFeedButton =
    getElement("useFeedButton");


/* =========================================
   FORMAT FEED
========================================= */

function formatFeed(value) {

    return Number(
        value.toFixed(2)
    );
}


/* =========================================
   UPDATE FEED DISPLAY
========================================= */

function updateFeedDisplay() {

    feed = formatFeed(feed);


    if (feedAmount) {

        feedAmount.textContent =
            feed + " kg";
    }


    if (overviewFeedAmount) {

        overviewFeedAmount.textContent =
            feed;
    }
}


updateFeedDisplay();


/* =========================================
   ADD FEED
========================================= */

if (addFeedButton) {

    addFeedButton.addEventListener(
        "click",
        function() {

            const amount =
                Number(feedInput.value);


            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {
                return;
            }


            feed += amount;

            feed = formatFeed(feed);


            localStorage.setItem(
                "feed",
                feed
            );


            feedInput.value = "";


            updateFeedDisplay();
        }
    );
}


/* =========================================
   USE FEED
========================================= */

if (useFeedButton) {

    useFeedButton.addEventListener(
        "click",
        function() {

            const amount =
                Number(useFeedInput.value);


            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {
                return;
            }


            if (amount > feed) {

                alert(
                    "You cannot use more feed than you have."
                );

                return;
            }


            feed -= amount;

            feed = formatFeed(feed);


            localStorage.setItem(
                "feed",
                feed
            );


            useFeedInput.value = "";


            updateFeedDisplay();
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


const savedMorningTime =
    localStorage.getItem(
        "morningFeedTime"
    );

const savedAfternoonTime =
    localStorage.getItem(
        "afternoonFeedTime"
    );


if (
    savedMorningTime &&
    morningFeedTime
) {

    morningFeedTime.value =
        savedMorningTime;
}


if (
    savedAfternoonTime &&
    afternoonFeedTime
) {

    afternoonFeedTime.value =
        savedAfternoonTime;
}


function updateScheduleStatus() {

    const morning =
        localStorage.getItem(
            "morningFeedTime"
        );

    const afternoon =
        localStorage.getItem(
            "afternoonFeedTime"
        );


    if (
        scheduleStatus &&
        morning &&
        afternoon
    ) {

        scheduleStatus.textContent =
            "Morning: " +
            morning +
            " | Afternoon: " +
            afternoon;
    }
}


updateScheduleStatus();


/* =========================================
   SAVE SCHEDULE
========================================= */

if (saveScheduleButton) {

    saveScheduleButton.addEventListener(
        "click",
        async function() {

            const morning =
                morningFeedTime.value;

            const afternoon =
                afternoonFeedTime.value;


            if (!morning || !afternoon) {

                scheduleStatus.textContent =
                    "Please set both feeding times.";

                return;
            }


            localStorage.setItem(
                "morningFeedTime",
                morning
            );


            localStorage.setItem(
                "afternoonFeedTime",
                afternoon
            );


            scheduleStatus.textContent =
                "Morning: " +
                morning +
                " | Afternoon: " +
                afternoon;


            updateNextFeed();


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
                                morning: morning,
                                afternoon: afternoon
                            })
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Schedule could not be saved."
                    );
                }


                scheduleStatus.textContent =
                    "Morning: " +
                    morning +
                    " | Afternoon: " +
                    afternoon +
                    " • Server saved";

            } catch (error) {

                console.error(
                    "Schedule sync failed:",
                    error
                );


                scheduleStatus.textContent =
                    "Saved on phone, but server sync failed.";
            }
        }
    );
}


/* =========================================
   NEXT FEED
========================================= */

function updateNextFeed() {

    const nextFeed =
        getElement("nextFeed");


    if (!nextFeed) {
        return;
    }


    const morning =
        localStorage.getItem(
            "morningFeedTime"
        );

    const afternoon =
        localStorage.getItem(
            "afternoonFeedTime"
        );


    if (!morning || !afternoon) {

        nextFeed.textContent =
            "Not set";

        return;
    }


    const now =
        new Date();


    const todayMorning =
        new Date();


    const [
        morningHour,
        morningMinute
    ] =
        morning.split(":");


    todayMorning.setHours(
        Number(morningHour),
        Number(morningMinute),
        0,
        0
    );


    const todayAfternoon =
        new Date();


    const [
        afternoonHour,
        afternoonMinute
    ] =
        afternoon.split(":");


    todayAfternoon.setHours(
        Number(afternoonHour),
        Number(afternoonMinute),
        0,
        0
    );


    if (now < todayMorning) {

        nextFeed.textContent =
            "Morning • " +
            morning;

    } else if (now < todayAfternoon) {

        nextFeed.textContent =
            "Afternoon • " +
            afternoon;

    } else {

        nextFeed.textContent =
            "Tomorrow • " +
            morning;
    }
}


updateNextFeed();


setInterval(
    updateNextFeed,
    30000
);


/* =========================================
   FEED ALARM
========================================= */

let alarmEnabled =
    localStorage.getItem(
        "alarmEnabled"
    ) === "true";


let lastAlarmTime = "";


const alarmButton =
    getElement("alarmButton");

const alarmStatus =
    getElement("alarmStatus");

const alarmMessage =
    getElement("alarmMessage");


function updateAlarmDisplay() {

    if (!alarmButton || !alarmStatus) {
        return;
    }


    if (alarmEnabled) {

        alarmButton.textContent =
            "🔕 Turn Alarm Off";

        alarmStatus.textContent =
            "Alarm is on.";

    } else {

        alarmButton.textContent =
            "🔔 Turn Alarm On";

        alarmStatus.textContent =
            "Alarm is off.";

        if (alarmMessage) {
            alarmMessage.textContent = "";
        }
    }
}


updateAlarmDisplay();


if (alarmButton) {

    alarmButton.addEventListener(
        "click",
        function() {

            alarmEnabled =
                !alarmEnabled;


            localStorage.setItem(
                "alarmEnabled",
                alarmEnabled
            );


            updateAlarmDisplay();
        }
    );
}


/* =========================================
   CHECK FEED ALARM
========================================= */

function checkFeedAlarm() {

    if (!alarmEnabled) {
        return;
    }


    const now =
        new Date();


    const currentTime =
        String(now.getHours())
            .padStart(2, "0") +
        ":" +
        String(now.getMinutes())
            .padStart(2, "0");


    const morning =
        localStorage.getItem(
            "morningFeedTime"
        );

    const afternoon =
        localStorage.getItem(
            "afternoonFeedTime"
        );


    if (
        (
            currentTime === morning ||
            currentTime === afternoon
        ) &&
        lastAlarmTime !== currentTime
    ) {

        if (alarmMessage) {

            alarmMessage.textContent =
                "🐔⏰ It's feeding time!";
        }


        lastAlarmTime =
            currentTime;
    }
}


setInterval(
    checkFeedAlarm,
    1000
);


/* =========================================
   SERVICE WORKER
========================================= */

if ("serviceWorker" in navigator) {

    navigator.serviceWorker
        .register("sw.js")
        .then(function() {

            console.log(
                "Poultry Manager service worker registered."
            );
        })
        .catch(function(error) {

            console.error(
                "Service worker registration failed:",
                error
            );
        });
}


/* =========================================
   NOTIFICATIONS
========================================= */

const notificationButton =
    getElement(
        "enableNotifications"
    );


if (notificationButton) {

    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {

        notificationButton.textContent =
            "✅ Notifications Enabled";

        notificationButton.disabled =
            true;

    } else {

        notificationButton.addEventListener(
            "click",
            async function() {

                if (!("Notification" in window)) {

                    alert(
                        "Notifications are not supported on this device/browser."
                    );

                    return;
                }


                try {

                    const permission =
                        await Notification.requestPermission();


                    if (
                        permission === "granted"
                    ) {

                        await subscribeToPush();


                        notificationButton.textContent =
                            "✅ Notifications Enabled";

                        notificationButton.disabled =
                            true;

                    } else {

                        alert(
                            "Notifications were not enabled."
                        );
                    }

                } catch (error) {

                    console.error(
                        "Notification setup failed:",
                        error
                    );

                    alert(
                        "Notification setup failed."
                    );
                }
            }
        );
    }
}


/* =========================================
   PUSH NOTIFICATION SETUP
========================================= */

async function enablePushNotifications() {

    if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
    ) {

        alert(
            "Push notifications are not supported on this device/browser."
        );

        return;
    }


    const permission =
        await Notification.requestPermission();


    if (permission !== "granted") {

        alert(
            "Notifications were not enabled."
        );

        return;
    }


    await navigator.serviceWorker.ready;

    alert(
        "Notifications permission granted. Push setup is next."
    );
}


/* =========================================
   VAPID KEY
========================================= */

const VAPID_PUBLIC_KEY =
    "BIcVdte-foGuqHPNOv1m9XhBHconqjfIVSNUH7m9FcUlp9aRJn7XT3PT42vBbk9qN2ZPINXisFjOYhTAdoJapOU";


/* =========================================
   SUBSCRIBE TO PUSH
========================================= */

async function subscribeToPush() {

    try {

        const registration =
            await navigator.serviceWorker.ready;


        const existingSubscription =
            await registration.pushManager.getSubscription();


        const subscription =
            existingSubscription ||
            await registration.pushManager.subscribe(
                {
                    userVisibleOnly: true,

                    applicationServerKey:
                        urlBase64ToUint8Array(
                            VAPID_PUBLIC_KEY
                        )
                }
            );


        const response =
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


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Push subscription failed."
            );
        }


        alert(
            result.message ||
            "Push notifications enabled."
        );

    } catch (error) {

        console.error(
            "Push subscription failed:",
            error
        );

        alert(
            "Push subscription failed."
        );
    }
}


/* =========================================
   VAPID CONVERSION
========================================= */

function urlBase64ToUint8Array(
    base64String
) {

    const padding =
        "=".repeat(
            (4 -
                base64String.length % 4) % 4
        );


    const base64 =
        (
            base64String +
            padding
        )
            .replace(/-/g, "+")
            .replace(/_/g, "/");


    const rawData =
        atob(base64);


    return Uint8Array.from(
        [...rawData].map(
            char =>
                char.charCodeAt(0)
        )
    );
}


/* =========================================
   FLOCK
========================================= */

let chickenCountValue =
    Number(
        localStorage.getItem(
            "chickenCount"
        )
    ) || 0;


const chickenCount =
    getElement("chickenCount");

const birdCount =
    getElement("birdCount");

const addChickenButton =
    getElement("addChicken");

const removeChickenButton =
    getElement("removeChicken");

const flockInput =
    getElement("flockInput");

const setFlockButton =
    getElement("setFlockButton");


/* =========================================
   UPDATE FLOCK DISPLAY
========================================= */

function updateFlockDisplay() {

    if (chickenCount) {

        chickenCount.textContent =
            chickenCountValue;
    }


    if (birdCount) {

        birdCount.textContent =
            chickenCountValue;
    }


    updateLayingRate();
}


updateFlockDisplay();


/* =========================================
   ADD CHICKEN
========================================= */

if (addChickenButton) {

    addChickenButton.addEventListener(
        "click",
        function() {

            chickenCountValue++;


            localStorage.setItem(
                "chickenCount",
                chickenCountValue
            );


            updateFlockDisplay();

            saveTodayEggHistory();

            displayEggHistory();
        }
    );
}


/* =========================================
   REMOVE CHICKEN
========================================= */

if (removeChickenButton) {

    removeChickenButton.addEventListener(
        "click",
        function() {

            if (chickenCountValue <= 0) {
                return;
            }


            chickenCountValue--;


            localStorage.setItem(
                "chickenCount",
                chickenCountValue
            );


            updateFlockDisplay();

            saveTodayEggHistory();

            displayEggHistory();
        }
    );
}


/* =========================================
   SET FLOCK SIZE
========================================= */

if (setFlockButton) {

    setFlockButton.addEventListener(
        "click",
        function() {

            const inputValue =
                flockInput.value.trim();


            if (inputValue === "") {
                return;
            }


            const newFlockSize =
                Number(inputValue);


            if (
                !Number.isInteger(
                    newFlockSize
                ) ||
                newFlockSize < 0
            ) {
                return;
            }


            chickenCountValue =
                newFlockSize;


            localStorage.setItem(
                "chickenCount",
                chickenCountValue
            );


            flockInput.value = "";


            updateFlockDisplay();

            saveTodayEggHistory();

            displayEggHistory();
        }
    );
}


/* =========================================
   LAYING RATE
========================================= */

function updateLayingRate() {

    const layingRate =
        getElement("layingRate");

    const overviewLayingRate =
        getElement(
            "overviewLayingRate"
        );


    const flockSize =
        Number(
            localStorage.getItem(
                "chickenCount"
            )
        );


    let displayRate = "0%";


    if (
        flockSize &&
        flockSize > 0
    ) {

        const rate =
            (eggs / flockSize) * 100;


        if (rate >= 100) {

            displayRate =
                "100%+";

        } else {

            displayRate =
                Math.round(rate) + "%";
        }
    }


    if (layingRate) {

        layingRate.textContent =
            displayRate;
    }


    if (overviewLayingRate) {

        overviewLayingRate.textContent =
            displayRate;
    }
}


updateLayingRate();


/* =========================================
   EGG HISTORY
========================================= */

function getEggHistory() {

    return (
        JSON.parse(
            localStorage.getItem(
                "eggHistory"
            )
        ) || {}
    );
}


/* =========================================
   SAVE TODAY'S HISTORY
========================================= */

function saveTodayEggHistory() {

    const history =
        getEggHistory();


    const currentFlock =
        Number(
            localStorage.getItem(
                "chickenCount"
            )
        ) || 0;


    history[today] = {
        eggs: eggs,
        flock: currentFlock
    };


    localStorage.setItem(
        "eggHistory",
        JSON.stringify(history)
    );
}


saveTodayEggHistory();


/* =========================================
   FORMAT HISTORY DATE
========================================= */

function formatHistoryDate(date) {

    if (date === today) {

        return "Today";
    }


    return new Date(
        date + "T00:00:00"
    ).toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );
}


/* =========================================
   CREATE HISTORY ROW
========================================= */

function createHistoryRow(
    date,
    record
) {

    const row =
        document.createElement("div");


    const formattedDate =
        formatHistoryDate(date);


    const eggsForDay =
        typeof record === "object"
            ? Number(record.eggs) || 0
            : Number(record) || 0;


    const flockForDay =
        typeof record === "object"
            ? Number(record.flock) || 0
            : chickenCountValue;


    let rate = 0;


    if (flockForDay > 0) {

        rate =
            Math.round(
                (eggsForDay /
                    flockForDay) *
                    100
            );
    }


    const dateElement =
        document.createElement("strong");


    dateElement.textContent =
        formattedDate;


    const resultElement =
        document.createElement("span");


    resultElement.textContent =
        eggsForDay +
        " eggs • " +
        rate +
        "%";


    row.appendChild(
        dateElement
    );


    row.appendChild(
        resultElement
    );


    return row;
}


/* =========================================
   DISPLAY EGG HISTORY
========================================= */

let showAllHistory = false;


function displayEggHistory() {

    const historyList =
        getElement(
            "eggHistoryList"
        );


    const viewHistoryButton =
        getElement(
            "viewHistoryButton"
        );


    if (!historyList) {
        return;
    }


    const history =
        getEggHistory();


    /*
       Keep today's record current
       while the app is open.
    */

    const currentFlock =
        Number(
            localStorage.getItem(
                "chickenCount"
            )
        ) || 0;


    history[today] = {
        eggs: eggs,
        flock: currentFlock
    };


    const dates =
        Object.keys(history)
            .sort()
            .reverse();


    if (dates.length === 0) {

        historyList.innerHTML =
            '<p class="empty-state">No history yet.</p>';

        if (viewHistoryButton) {
            viewHistoryButton.style.display =
                "none";
        }

        return;
    }


    const visibleDates =
        showAllHistory
            ? dates
            : dates.slice(0, 4);


    historyList.innerHTML = "";


    visibleDates.forEach(
        function(date) {

            const row =
                createHistoryRow(
                    date,
                    history[date]
                );


            historyList.appendChild(
                row
            );
        }
    );


    if (viewHistoryButton) {

        if (dates.length <= 3) {

            viewHistoryButton.style.display =
                "none";

        } else {

            viewHistoryButton.style.display =
                "block";


            viewHistoryButton.textContent =
                showAllHistory
                    ? "Show Less"
                    : "View All History";
        }
    }
}


displayEggHistory();


/* =========================================
   HISTORY BUTTON
========================================= */

const viewHistoryButton =
    getElement(
        "viewHistoryButton"
    );


if (viewHistoryButton) {

    viewHistoryButton.addEventListener(
        "click",
        function() {

            showAllHistory =
                !showAllHistory;


            displayEggHistory();
        }
    );
}


/* =========================================
   INITIAL SYNC
========================================= */

updateEggDisplay();

updateFeedDisplay();

updateFlockDisplay();

updateLayingRate();

updateNextFeed();

updateScheduleStatus();

displayEggHistory();
