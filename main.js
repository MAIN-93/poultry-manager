/* =========================================================
   POULTRY MANAGER
   UNIFIED PRODUCTION MANAGEMENT SYSTEM
   ---------------------------------------------------------
   Corrected Production Management System
   Part 1 of 2
   ========================================================= */

(function () {
    "use strict";

    /* =====================================================
       1. APP CONFIGURATION
       ===================================================== */

    const APP = {
        name: "Poultry Manager",
        version: "3.0.0",

        renderBase:
            "https://poultry-manager-hppo.onrender.com",

        storage: {
            flock: "flockCount",
            eggs: "eggHistory",
            feed: "feed",

            feedUsage:
                "feedUsageHistory",

            feedAdditions:
                "feedAdditionHistory",

            schedule:
                "feedingSchedule",

            alarm:
                "feedAlarmEnabled",

            notifications:
                "notificationsEnabled",

            theme:
                "poultryManagerTheme",

            lastView:
                "poultryManagerLastView",

            automaticBackup:
                "poultryManagerAutomaticBackup",

            lastBackup:
                "poultryManagerLastBackup",

            backupData:
                "poultryManagerAutomaticBackupData",

            alarmTriggered:
                "poultryManagerAlarmTriggered"
        },

        defaults: {
            flock: 5,
            feed: 0,
            morningFeed: "07:00",
            afternoonFeed: "17:00",
            alarm: false,
            notifications: false,
            automaticBackup: false,
            theme: "light"
        }
    };


    /* =====================================================
       2. DOM HELPERS
       ===================================================== */

    const $ = (id) =>
        document.getElementById(id);

    const $$ = (selector) =>
        Array.from(
            document.querySelectorAll(selector)
        );


    /* =====================================================
       3. BASIC UTILITIES
       ===================================================== */

    function safeNumber(value, fallback = 0) {

        const number =
            Number(value);

        return Number.isFinite(number)
            ? number
            : fallback;
    }


    function clamp(
        value,
        minimum,
        maximum
    ) {

        return Math.min(
            maximum,
            Math.max(
                minimum,
                value
            )
        );
    }


    function roundNumber(
        value,
        decimals = 1
    ) {

        const factor =
            Math.pow(
                10,
                decimals
            );

        return (
            Math.round(
                safeNumber(value) *
                factor
            ) / factor
        );
    }


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    function readStorage(
        key,
        fallback = null
    ) {

        try {

            const value =
                localStorage.getItem(key);

            return value === null
                ? fallback
                : value;

        } catch (error) {

            console.error(
                "Poultry Manager storage read error:",
                error
            );

            return fallback;
        }
    }


    function writeStorage(
        key,
        value
    ) {

        try {

            localStorage.setItem(
                key,
                String(value)
            );

            return true;

        } catch (error) {

            console.error(
                "Poultry Manager storage write error:",
                error
            );

            return false;
        }
    }


    function readJSON(
        key,
        fallback
    ) {

        try {

            const raw =
                localStorage.getItem(key);

            if (!raw) {
                return fallback;
            }

            return JSON.parse(raw);

        } catch (error) {

            console.warn(
                "Invalid JSON in storage:",
                key
            );

            return fallback;
        }
    }


    function writeJSON(
        key,
        value
    ) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

            return true;

        } catch (error) {

            console.error(
                "Poultry Manager JSON write error:",
                error
            );

            return false;
        }
    }


    function notify(
        message,
        type = "info"
    ) {

        if (!message) {
            return;
        }

        const existing =
            $("pmToast");

        if (existing) {

            existing.textContent =
                message;

            existing.className =
                "pm-toast pm-toast-" +
                type;

            existing.classList.add(
                "show"
            );

            clearTimeout(
                notify._timer
            );

            notify._timer =
                setTimeout(() => {

                    existing.classList.remove(
                        "show"
                    );

                }, 3000);

            return;
        }

        if (
            type === "error" ||
            type === "warning"
        ) {

            alert(message);

        } else {

            console.log(
                "Poultry Manager:",
                message
            );
        }
    }


    function confirmAction(
        message
    ) {

        return window.confirm(
            message
        );
    }


    function scrollToElement(
        element
    ) {

        if (!element) {
            return;
        }

        element.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }


    /* =====================================================
       4. DATE / TIME UTILITIES
       ===================================================== */

    function getTodayKey() {

        const now =
            new Date();

        const year =
            now.getFullYear();

        const month =
            String(
                now.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                now.getDate()
            ).padStart(2, "0");

        return (
            year +
            "-" +
            month +
            "-" +
            day
        );
    }


    function dateFromKey(
        key
    ) {

        const parts =
            String(key).split("-");

        if (
            parts.length !== 3
        ) {
            return new Date();
        }

        return new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );
    }


    function getDateKeyFromDate(
        date
    ) {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        return (
            year +
            "-" +
            month +
            "-" +
            day
        );
    }


    function getPreviousDateKey(
        dateKey,
        days = 1
    ) {

        const date =
            dateFromKey(
                dateKey
            );

        date.setDate(
            date.getDate() - days
        );

        return getDateKeyFromDate(
            date
        );
    }


    function getRecentDateKeys(
        count = 7
    ) {

        const today =
            dateFromKey(
                getTodayKey()
            );

        const dates = [];

        for (
            let i = count - 1;
            i >= 0;
            i--
        ) {

            const date =
                new Date(today);

            date.setDate(
                today.getDate() - i
            );

            dates.push(
                getDateKeyFromDate(
                    date
                )
            );
        }

        return dates;
    }


    function isToday(
        dateKey
    ) {

        return (
            dateKey ===
            getTodayKey()
        );
    }


    function formatDate(
        dateKey
    ) {

        const date =
            dateFromKey(
                dateKey
            );

        return date.toLocaleDateString(
            undefined,
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );
    }


    function formatShortDate(
        dateKey
    ) {

        const date =
            dateFromKey(
                dateKey
            );

        return date.toLocaleDateString(
            undefined,
            {
                day: "numeric",
                month: "short"
            }
        );
    }


    function formatTime(
        time
    ) {

        if (!time) {
            return "--:--";
        }

        const parts =
            String(time).split(":");

        if (
            parts.length !== 2
        ) {
            return time;
        }

        const hours =
            Number(parts[0]);

        const minutes =
            Number(parts[1]);

        if (
            !Number.isFinite(hours) ||
            !Number.isFinite(minutes)
        ) {
            return time;
        }

        const date =
            new Date();

        date.setHours(
            hours,
            minutes,
            0,
            0
        );

        return date.toLocaleTimeString(
            undefined,
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );
    }


    function timeToMinutes(
        time
    ) {

        if (!time) {
            return null;
        }

        const parts =
            String(time).split(":");

        if (
            parts.length !== 2
        ) {
            return null;
        }

        const hours =
            Number(parts[0]);

        const minutes =
            Number(parts[1]);

        if (
            !Number.isFinite(hours) ||
            !Number.isFinite(minutes)
        ) {
            return null;
        }

        return (
            hours * 60 +
            minutes
        );
    }


    function getMinutesUntilTime(
        time
    ) {

        const target =
            timeToMinutes(
                time
            );

        if (
            target === null
        ) {
            return null;
        }

        const now =
            new Date();

        const current =
            now.getHours() * 60 +
            now.getMinutes();

        let difference =
            target - current;

        if (
            difference < 0
        ) {

            difference += 1440;
        }

        return difference;
    }


    function formatCountdown(
        minutes
    ) {

        if (
            minutes === null ||
            !Number.isFinite(minutes)
        ) {
            return "--";
        }

        if (minutes <= 0) {
            return "Now";
        }

        const hours =
            Math.floor(
                minutes / 60
            );

        const remaining =
            minutes % 60;

        if (hours === 0) {

            return (
                remaining +
                (
                    remaining === 1
                        ? " min"
                        : " mins"
                )
            );
        }

        if (remaining === 0) {

            return (
                hours +
                (
                    hours === 1
                        ? " hr"
                        : " hrs"
                )
            );
        }

        return (
            hours +
            (
                hours === 1
                    ? " hr "
                    : " hrs "
            ) +
            remaining +
            " min"
        );
    }


    /* =====================================================
       5. FLOCK DATA
       ===================================================== */

    function getFlockCount() {

        const stored =
            readStorage(
                APP.storage.flock,
                APP.defaults.flock
            );

        return Math.max(
            0,
            Math.floor(
                safeNumber(
                    stored,
                    APP.defaults.flock
                )
            )
        );
    }


    function setFlockCount(
        count
    ) {

        const flock =
            Math.max(
                0,
                Math.floor(
                    safeNumber(count)
                )
            );

        writeStorage(
            APP.storage.flock,
            flock
        );

        refreshAll();

        scheduleAutomaticBackup();

        return flock;
    }


    /* =====================================================
       6. EGG HISTORY
       ===================================================== */

    function getRawEggHistory() {

        const history =
            readJSON(
                APP.storage.eggs,
                {}
            );

        if (
            !history ||
            typeof history !== "object" ||
            Array.isArray(history)
        ) {

            return {};
        }

        return history;
    }


    function normalizeEggRecord(
        record
    ) {

        if (
            typeof record === "number"
        ) {

            return {
                eggs: Math.max(
                    0,
                    safeNumber(record)
                ),
                flock:
                    getFlockCount()
            };
        }


        if (
            record &&
            typeof record === "object"
        ) {

            return {
                eggs: Math.max(
                    0,
                    safeNumber(
                        record.eggs
                    )
                ),

                flock: Math.max(
                    0,
                    Math.floor(
                        safeNumber(
                            record.flock,
                            getFlockCount()
                        )
                    )
                )
            };
        }


        return {
            eggs: 0,
            flock:
                getFlockCount()
        };
    }


    function getEggHistory() {

        const raw =
            getRawEggHistory();

        const normalized = {};

        Object.keys(raw)
            .forEach(date => {

                normalized[date] =
                    normalizeEggRecord(
                        raw[date]
                    );

            });

        return normalized;
    }


    function saveEggHistory(
        history
    ) {

        return writeJSON(
            APP.storage.eggs,
            history
        );
    }


    function getEggRecord(
        dateKey
    ) {

        const history =
            getEggHistory();

        return (
            history[dateKey] || {
                eggs: 0,
                flock:
                    getFlockCount()
            }
        );
    }


    function getEggsForDate(
        dateKey
    ) {

        return Math.max(
            0,
            safeNumber(
                getEggRecord(
                    dateKey
                ).eggs
            )
        );
    }


    function getTodayEggs() {

        return getEggsForDate(
            getTodayKey()
        );
    }


    function setEggCount(
        count,
        dateKey = getTodayKey()
    ) {

        const history =
            getEggHistory();

        const eggs =
            Math.max(
                0,
                Math.floor(
                    safeNumber(count)
                )
            );

        history[dateKey] = {
            eggs,
            flock:
                getFlockCount()
        };

        saveEggHistory(
            history
        );

        refreshAll();

        scheduleAutomaticBackup();
    }


    function addEggs(
        amount = 1
    ) {

        const quantity =
            Math.max(
                1,
                Math.floor(
                    safeNumber(amount)
                )
            );

        const flock =
            getFlockCount();

        if (
            flock <= 0
        ) {

            notify(
                "Set your flock size before recording eggs.",
                "warning"
            );

            return;
        }

        const current =
            getTodayEggs();

        setEggCount(
            current + quantity
        );
    }


    function removeEggs(
        amount = 1
    ) {

        const quantity =
            Math.max(
                1,
                Math.floor(
                    safeNumber(amount)
                )
            );

        const current =
            getTodayEggs();

        if (
            current <= 0
        ) {

            notify(
                "Today's egg count is already zero.",
                "info"
            );

            return;
        }

        setEggCount(
            Math.max(
                0,
                current - quantity
            )
        );
    }


    function getLayingRate(
        eggs,
        flock = getFlockCount()
    ) {

        const eggCount =
            Math.max(
                0,
                safeNumber(eggs)
            );

        const flockCount =
            Math.max(
                0,
                safeNumber(flock)
            );

        if (
            flockCount <= 0
        ) {
            return 0;
        }

        return (
            eggCount /
            flockCount *
            100
        );
    }


    /* =====================================================
       7. EGG HISTORY UI
       ===================================================== */

    let showAllEggHistory = false;


    function updateEggDisplay() {

        const eggs =
            getTodayEggs();

        const flock =
            getFlockCount();

        const rate =
            getLayingRate(
                eggs,
                flock
            );


        const eggCount =
            $("eggCount");

        if (eggCount) {

            eggCount.textContent =
                eggs;
        }


        const layingRate =
            $("layingRate");

        if (layingRate) {

            layingRate.textContent =
                Math.round(
                    rate
                ) + "%";
        }


        updateEggHistory();
    }


    function updateEggHistory() {

        const list =
            $("eggHistoryList");

        if (!list) {
            return;
        }

        const history =
            getEggHistory();

        const dates =
            Object.keys(history)
                .filter(
                    key =>
                        /^\d{4}-\d{2}-\d{2}$/
                            .test(key)
                )
                .sort(
                    (a, b) =>
                        b.localeCompare(a)
                );


        const visible =
            showAllEggHistory
                ? dates
                : dates.slice(0, 3);


        if (
            visible.length === 0
        ) {

            list.innerHTML = `
                <div class="pm-empty-state">
                    No egg production recorded yet.
                </div>
            `;

        } else {

            list.innerHTML =
                visible.map(
                    date => {

                        const record =
                            history[date];

                        const eggs =
                            safeNumber(
                                record.eggs
                            );

                        const flock =
                            safeNumber(
                                record.flock,
                                getFlockCount()
                            );

                        const rate =
                            getLayingRate(
                                eggs,
                                flock
                            );

                        const label =
                            isToday(date)
                                ? "Today"
                                : formatDate(
                                    date
                                );


                        return `
                            <div class="egg-history-item">
                                <div class="egg-history-date">
                                    ${escapeHTML(
                                        label
                                    )}
                                </div>

                                <div class="egg-history-value">
                                    ${eggs} eggs
                                    <span>
                                        •
                                        ${Math.round(rate)}%
                                    </span>
                                </div>
                            </div>
                        `;

                    }
                )
                .join("");
        }


        const button =
            $("viewHistoryButton");

        if (button) {

            if (
                dates.length <= 3
            ) {

                button.style.display =
                    "none";

            } else {

                button.style.display =
                    "";

                button.textContent =
                    showAllEggHistory
                        ? "Show Less"
                        : "View All History";
            }
        }
    }


    /* =====================================================
       8. PRODUCTION ANALYTICS
       ===================================================== */

    function getProductionStats() {

        const history =
            getEggHistory();

        const dates =
            getRecentDateKeys(
                7
            );

        const values =
            dates.map(
                date => ({
                    date,
                    eggs:
                        getEggsForDate(
                            date
                        ),
                    flock:
                        safeNumber(
                            getEggRecord(
                                date
                            ).flock,
                            getFlockCount()
                        )
                })
            );


        const totalEggs =
            values.reduce(
                (sum, item) =>
                    sum + item.eggs,
                0
            );


        const averageEggs =
            totalEggs /
            dates.length;


        const layingRates =
            values.map(
                item =>
                    getLayingRate(
                        item.eggs,
                        item.flock
                    )
            );


        const averageRate =
            layingRates.length
                ? layingRates.reduce(
                    (sum, value) =>
                        sum + value,
                    0
                ) /
                layingRates.length
                : 0;


        let best =
            values[0] || {
                date:
                    getTodayKey(),
                eggs: 0
            };

        let lowest =
            values[0] || {
                date:
                    getTodayKey(),
                eggs: 0
            };


        values.forEach(
            item => {

                if (
                    item.eggs >
                    best.eggs
                ) {

                    best = item;
                }

                if (
                    item.eggs <
                    lowest.eggs
                ) {

                    lowest = item;
                }

            }
        );


        const previousDates =
            [];

        for (
            let i = 13;
            i >= 7;
            i--
        ) {

            previousDates.push(
                getPreviousDateKey(
                    getTodayKey(),
                    i
                )
            );
        }


        const previousTotal =
            previousDates.reduce(
                (sum, date) =>
                    sum +
                    getEggsForDate(
                        date
                    ),
                0
            );


        const previousAverage =
            previousTotal /
            previousDates.length;


        let change = 0;

        if (
            previousAverage > 0
        ) {

            change =
                (
                    (
                        averageEggs -
                        previousAverage
                    ) /
                    previousAverage
                ) * 100;
        }


        const variance =
            values.reduce(
                (sum, item) => {

                    return (
                        sum +
                        Math.pow(
                            item.eggs -
                            averageEggs,
                            2
                        )
                    );

                },
                0
            ) /
            values.length;


        const standardDeviation =
            Math.sqrt(
                variance
            );


        let consistency =
            100;

        if (
            averageEggs > 0
        ) {

            consistency =
                clamp(
                    100 -
                    (
                        standardDeviation /
                        averageEggs *
                        100
                    ),
                    0,
                    100
                );
        }


        return {
            dates,
            values,
            totalEggs,
            averageEggs,
            averageRate,
            best,
            lowest,
            change,
            consistency,
            history
        };
    }


    function refreshProduction() {

        const stats =
            getProductionStats();


        const sevenDayEggs =
            $("sevenDayEggs");

        if (sevenDayEggs) {

            sevenDayEggs.textContent =
                Math.round(
                    stats.totalEggs
                );
        }


        const averageLayingRate =
            $("averageLayingRate");

        if (averageLayingRate) {

            averageLayingRate.textContent =
                Math.round(
                    stats.averageRate
                ) + "%";
        }


        const bestProductionDay =
            $("bestProductionDay");

        if (bestProductionDay) {

            bestProductionDay.textContent =
                isToday(
                    stats.best.date
                )
                    ? "Today"
                    : formatShortDate(
                        stats.best.date
                    );
        }


        const bestProductionEggs =
            $("bestProductionEggs");

        if (bestProductionEggs) {

            bestProductionEggs.textContent =
                Math.round(
                    stats.best.eggs
                );
        }


        const analyticsEggsPerHen =
            $("analyticsEggsPerHen");

        if (
            analyticsEggsPerHen
        ) {

            const flock =
                getFlockCount();

            const perHen =
                flock > 0
                    ? stats.totalEggs /
                      7 /
                      flock
                    : 0;

            analyticsEggsPerHen.textContent =
                perHen.toFixed(2);
        }


        const analyticsAverage =
            $("analyticsAverage");

        if (
            analyticsAverage
        ) {

            analyticsAverage.textContent =
                stats.averageEggs.toFixed(
                    1
                );
        }


        const analyticsHighestDay =
            $("analyticsHighestDay");

        if (
            analyticsHighestDay
        ) {

            analyticsHighestDay.textContent =
                Math.round(
                    stats.best.eggs
                );
        }


        const analyticsHighestDayDate =
            $("analyticsHighestDayDate");

        if (
            analyticsHighestDayDate
        ) {

            analyticsHighestDayDate.textContent =
                isToday(
                    stats.best.date
                )
                    ? "Today"
                    : formatShortDate(
                        stats.best.date
                    );
        }


        const analyticsLowestDay =
            $("analyticsLowestDay");

        if (
            analyticsLowestDay
        ) {

            analyticsLowestDay.textContent =
                Math.round(
                    stats.lowest.eggs
                );
        }


        const analyticsLowestDayDate =
            $("analyticsLowestDayDate");

        if (
            analyticsLowestDayDate
        ) {

            analyticsLowestDayDate.textContent =
                isToday(
                    stats.lowest.date
                )
                    ? "Today"
                    : formatShortDate(
                        stats.lowest.date
                    );
        }


        const analyticsConsistency =
            $("analyticsConsistency");

        if (
            analyticsConsistency
        ) {

            analyticsConsistency.textContent =
                Math.round(
                    stats.consistency
                ) + "%";
        }


        const analyticsChange =
            $("analyticsChange");

        if (
            analyticsChange
        ) {

            const sign =
                stats.change > 0
                    ? "+"
                    : "";

            analyticsChange.textContent =
                sign +
                stats.change.toFixed(
                    1
                ) +
                "%";
        }


        const insight =
            $("analyticsInsight");

        if (insight) {

            insight.textContent =
                createProductionInsight(
                    stats
                );
        }


        updateProductionTrend(
            stats
        );
    }


    function createProductionInsight(
        stats
    ) {

        if (
            stats.totalEggs === 0
        ) {

            return (
                "Start recording daily egg production to build your production insights."
            );
        }


        if (
            stats.averageRate >= 90
        ) {

            return (
                "Excellent production. Your flock is operating at a very strong laying rate."
            );
        }


        if (
            stats.averageRate >= 70
        ) {

            return (
                "Production is healthy. Keep feed, water and flock management consistent."
            );
        }


        if (
            stats.averageRate >= 50
        ) {

            return (
                "Production is moderate. Watch feed intake, water access and laying consistency."
            );
        }


        return (
            "Production is currently low. Check feed, water, stress, health and environmental conditions."
        );
    }


    /* =====================================================
       9. CHART HELPERS
       ===================================================== */

    /*
     * Your current index.html uses DIV containers for both
     * charts. The drawing engine uses canvas, so we create
     * the canvas INSIDE the existing DIV instead of changing
     * your HTML.
     */

    function getOrCreateChartCanvas(
        container,
        className = ""
    ) {

        if (!container) {
            return null;
        }


        let canvas =
            container.querySelector(
                "canvas"
            );


        if (!canvas) {

            canvas =
                document.createElement(
                    "canvas"
                );

            if (className) {

                canvas.className =
                    className;
            }

            canvas.setAttribute(
                "aria-hidden",
                "true"
            );


            container.innerHTML =
                "";


            container.appendChild(
                canvas
            );
        }


        canvas.style.width =
            "100%";

        canvas.style.height =
            "100%";

        canvas.style.display =
            "block";


        return canvas;
    }


    function prepareCanvasSize(
        canvas,
        minimumWidth = 280,
        minimumHeight = 180
    ) {

        if (!canvas) {
            return null;
        }


        const rect =
            canvas.getBoundingClientRect();


        const width =
            Math.max(
                minimumWidth,
                Math.floor(
                    rect.width ||
                    canvas.parentElement?.clientWidth ||
                    320
                )
            );


        const height =
            Math.max(
                minimumHeight,
                Math.floor(
                    rect.height ||
                    canvas.parentElement?.clientHeight ||
                    minimumHeight
                )
            );


        const pixelRatio =
            window.devicePixelRatio ||
            1;


        canvas.width =
            Math.floor(
                width *
                pixelRatio
            );


        canvas.height =
            Math.floor(
                height *
                pixelRatio
            );


        const context =
            canvas.getContext(
                "2d"
            );


        if (!context) {
            return null;
        }


        context.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );


        context.clearRect(
            0,
            0,
            width,
            height
        );


        return {
            context,
            width,
            height
        };
    }


    /* =====================================================
       10. PRODUCTION TREND CHART
       ===================================================== */

    function updateProductionTrend(
        stats
    ) {

        const container =
            $("productionTrendChart");

        if (!container) {
            return;
        }


        const canvas =
            getOrCreateChartCanvas(
                container,
                "pm-production-chart-canvas"
            );


        const prepared =
            prepareCanvasSize(
                canvas,
                280,
                180
            );


        if (!prepared) {
            return;
        }


        const {
            context,
            width,
            height
        } = prepared;


        const values =
            stats.values.map(
                item =>
                    item.eggs
            );


        const maximum =
            Math.max(
                1,
                ...values
            );


        const padding = {
            top: 22,
            right: 16,
            bottom: 34,
            left: 34
        };


        const chartWidth =
            Math.max(
                1,
                width -
                padding.left -
                padding.right
            );


        const chartHeight =
            Math.max(
                1,
                height -
                padding.top -
                padding.bottom
            );


        const gridLines = 4;


        context.lineWidth =
            1;

        context.strokeStyle =
            "rgba(128,128,128,0.18)";


        for (
            let i = 0;
            i <= gridLines;
            i++
        ) {

            const y =
                padding.top +
                (
                    chartHeight /
                    gridLines *
                    i
                );


            context.beginPath();

            context.moveTo(
                padding.left,
                y
            );

            context.lineTo(
                width -
                padding.right,
                y
            );

            context.stroke();
        }


        if (
            values.length === 0
        ) {
            return;
        }


        const points =
            values.map(
                (value, index) => {

                    const x =
                        values.length === 1
                            ? padding.left +
                              chartWidth / 2
                            : padding.left +
                              (
                                  chartWidth /
                                  (
                                      values.length -
                                      1
                                  )
                              ) *
                              index;


                    const y =
                        padding.top +
                        chartHeight -
                        (
                            value /
                            maximum *
                            chartHeight
                        );


                    return {
                        x,
                        y,
                        value
                    };
                }
            );


        /*
         * Area.
         */

        context.beginPath();

        points.forEach(
            (point, index) => {

                if (index === 0) {

                    context.moveTo(
                        point.x,
                        point.y
                    );

                } else {

                    context.lineTo(
                        point.x,
                        point.y
                    );
                }
            }
        );


        const last =
            points[
                points.length - 1
            ];

        const first =
            points[0];


        context.lineTo(
            last.x,
            padding.top +
            chartHeight
        );

        context.lineTo(
            first.x,
            padding.top +
            chartHeight
        );

        context.closePath();


        context.fillStyle =
            "rgba(80,120,255,0.10)";

        context.fill();


        /*
         * Line.
         */

        context.beginPath();

        points.forEach(
            (point, index) => {

                if (index === 0) {

                    context.moveTo(
                        point.x,
                        point.y
                    );

                } else {

                    context.lineTo(
                        point.x,
                        point.y
                    );
                }
            }
        );


        context.strokeStyle =
            "currentColor";

        context.lineWidth =
            2.5;

        context.stroke();


        /*
         * Points.
         */

        points.forEach(
            point => {

                context.beginPath();

                context.arc(
                    point.x,
                    point.y,
                    4,
                    0,
                    Math.PI * 2
                );

                context.fillStyle =
                    "currentColor";

                context.fill();
            }
        );


        /*
         * Date labels.
         */

        context.fillStyle =
            "rgba(128,128,128,0.85)";

        context.font =
            "11px system-ui, sans-serif";

        context.textAlign =
            "center";


        stats.values.forEach(
            (item, index) => {

                const point =
                    points[index];

                context.fillText(
                    isToday(
                        item.date
                    )
                        ? "Today"
                        : formatShortDate(
                            item.date
                        ),
                    point.x,
                    height - 10
                );
            }
        );


        const maxLabel =
            $("trendMaxLabel");

        if (maxLabel) {

            maxLabel.textContent =
                maximum;
        }


        const midLabel =
            $("trendMidLabel");

        if (midLabel) {

            midLabel.textContent =
                Math.round(
                    maximum / 2
                );
        }
    }


    /* =====================================================
       11. FEED DATA
       ===================================================== */

    function getFeedAmount() {

        return Math.max(
            0,
            roundNumber(
                safeNumber(
                    readStorage(
                        APP.storage.feed,
                        APP.defaults.feed
                    )
                ),
                1
            )
        );
    }


    function setFeedAmount(
        amount
    ) {

        const feed =
            Math.max(
                0,
                roundNumber(
                    safeNumber(amount),
                    1
                )
            );

        writeStorage(
            APP.storage.feed,
            feed
        );

        return feed;
    }


    function getFeedUsageHistory() {

        const history =
            readJSON(
                APP.storage.feedUsage,
                {}
            );


        if (
            !history ||
            typeof history !== "object" ||
            Array.isArray(history)
        ) {

            return {};
        }


        const normalized = {};


        Object.keys(history)
            .forEach(
                date => {

                    normalized[date] =
                        Math.max(
                            0,
                            roundNumber(
                                safeNumber(
                                    history[date]
                                ),
                                1
                            )
                        );
                }
            );


        return normalized;
    }


    function saveFeedUsageHistory(
        history
    ) {

        return writeJSON(
            APP.storage.feedUsage,
            history
        );
    }


    function getTodayFeedUsage() {

        const history =
            getFeedUsageHistory();

        return Math.max(
            0,
            safeNumber(
                history[
                    getTodayKey()
                ]
            )
        );
    }


    function getFeedAdditionHistory() {

        const history =
            readJSON(
                APP.storage.feedAdditions,
                []
            );


        if (
            Array.isArray(history)
        ) {

            return history;
        }


        if (
            history &&
            typeof history === "object"
        ) {

            return Object.values(
                history
            );
        }


        return [];
    }


    function saveFeedAdditionHistory(
        history
    ) {

        return writeJSON(
            APP.storage.feedAdditions,
            history
        );
    }


    /* =====================================================
       12. FEED ADDITION
       ===================================================== */

    function addFeed(
        amount
    ) {

        const quantity =
            roundNumber(
                safeNumber(amount),
                1
            );


        if (
            quantity <= 0
        ) {

            notify(
                "Enter a feed amount greater than 0.",
                "warning"
            );

            return;
        }


        const before =
            getFeedAmount();


        const after =
            roundNumber(
                before +
                quantity,
                1
            );


        setFeedAmount(
            after
        );


        const history =
            getFeedAdditionHistory();


        history.push({
            id:
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .slice(2),

            amount:
                quantity,

            beforeStock:
                before,

            afterStock:
                after,

            timestamp:
                new Date().toISOString()
        });


        while (
            history.length > 30
        ) {

            history.shift();
        }


        saveFeedAdditionHistory(
            history
        );


        const input =
            $("feedInput");

        if (input) {
            input.value = "";
        }


        updateFeedManagement();

        updateFarmOverview();

        scheduleAutomaticBackup();


        notify(
            `${quantity.toFixed(1)} kg feed added.`,
            "success"
        );
    }


    /* =====================================================
       13. UNDO LAST FEED ADDITION
       ===================================================== */

    function undoLastFeedAddition() {

        const history =
            getFeedAdditionHistory();


        if (
            history.length === 0
        ) {

            notify(
                "There is no feed addition to undo.",
                "info"
            );

            return;
        }


        const last =
            history[
                history.length - 1
            ];


        const currentStock =
            getFeedAmount();


        const expectedStock =
            safeNumber(
                last.afterStock
            );


        if (
            Math.abs(
                currentStock -
                expectedStock
            ) > 0.01
        ) {

            notify(
                "The last feed addition can no longer be undone because your feed stock has changed.",
                "warning"
            );

            return;
        }


        const amount =
            Math.max(
                0,
                safeNumber(
                    last.amount
                )
            );


        const newStock =
            Math.max(
                0,
                roundNumber(
                    currentStock -
                    amount,
                    1
                )
            );


        setFeedAmount(
            newStock
        );


        history.pop();

        saveFeedAdditionHistory(
            history
        );


        updateFeedManagement();

        updateFarmOverview();

        scheduleAutomaticBackup();


        notify(
            `${amount.toFixed(1)} kg feed addition undone.`,
            "success"
        );
    }


    /* =====================================================
       14. FEED USAGE
       ===================================================== */

    function useFeed(
        amount
    ) {

        const quantity =
            roundNumber(
                safeNumber(amount),
                1
            );


        if (
            quantity <= 0
        ) {

            notify(
                "Enter a feed amount greater than 0.",
                "warning"
            );

            return;
        }


        const stock =
            getFeedAmount();


        if (
            quantity >
            stock
        ) {

            notify(
                `Not enough feed. Current stock: ${stock.toFixed(1)} kg.`,
                "warning"
            );

            return;
        }


        const history =
            getFeedUsageHistory();


        const today =
            getTodayKey();


        history[today] =
            roundNumber(
                safeNumber(
                    history[today]
                ) +
                quantity,
                1
            );


        saveFeedUsageHistory(
            history
        );


        setFeedAmount(
            stock -
            quantity
        );


        const input =
            $("useFeedInput");

        if (input) {
            input.value = "";
        }


        updateFeedManagement();

        updateFarmOverview();

        scheduleAutomaticBackup();


        notify(
            `${quantity.toFixed(1)} kg feed usage recorded.`,
            "success"
        );
    }


    /* =====================================================
       15. RESET TODAY'S FEED USAGE
       ===================================================== */

    function resetTodayFeedUsage() {

        const today =
            getTodayKey();


        const history =
            getFeedUsageHistory();


        const usage =
            safeNumber(
                history[today]
            );


        if (
            usage <= 0
        ) {

            notify(
                "There is no feed usage recorded for today.",
                "info"
            );

            return;
        }


        const confirmed =
            confirmAction(
                `Reset today's feed usage?\n\n` +
                `Today's recorded usage: ${usage.toFixed(1)} kg\n\n` +
                `That amount will be returned to your current feed stock.`
            );


        if (!confirmed) {
            return;
        }


        const stock =
            getFeedAmount();


        setFeedAmount(
            stock +
            usage
        );


        delete history[today];

        saveFeedUsageHistory(
            history
        );


        saveFeedAdditionHistory(
            []
        );


        updateFeedManagement();

        updateFarmOverview();

        scheduleAutomaticBackup();


        notify(
            "Today's feed usage has been reset.",
            "success"
        );
    }


    /* =====================================================
       16. RESET ENTIRE FEED STOCK
       ===================================================== */

    function resetFeedStock() {

        const currentStock =
            getFeedAmount();


        if (
            currentStock <= 0
        ) {

            notify(
                "Feed stock is already 0.0 kg.",
                "info"
            );

            return;
        }


        const confirmed =
            confirmAction(
                `Reset your entire feed stock?\n\n` +
                `Current stock: ${currentStock.toFixed(1)} kg\n\n` +
                `This will set your current feed inventory to 0.0 kg.\n\n` +
                `Your feed usage history and analytics will remain intact.`
            );


        if (!confirmed) {
            return;
        }


        setFeedAmount(
            0
        );


        

        const input =
            $("feedInput");

        if (input) {
            input.value = "";
        }


        updateFeedManagement();

        updateFarmOverview();

        scheduleAutomaticBackup();


        notify(
            "Feed stock reset to 0.0 kg.",
            "success"
        );
    }


    /* =====================================================
       17. FEED ANALYTICS
       ===================================================== */

  function getFeedStats() {

    const history =
        getFeedUsageHistory();

    const dates =
        getRecentDateKeys(7);

    const usage =
        dates.map(
            date => ({
                date,
                amount:
                    safeNumber(
                        history[date]
                    )
            })
        );

    const totalUsage =
        usage.reduce(
            (sum, item) =>
                sum + item.amount,
            0
        );

    /*
     * Only days with actual recorded feed
     * usage are used to calculate the
     * average daily consumption.
     *
     * This prevents unrecorded days from
     * making the flock appear to consume
     * less feed than it actually does.
     */
    const activeUsageDays =
        usage.filter(
            item =>
                item.amount > 0
        );

    const averageUsage =
        activeUsageDays.length > 0
            ? totalUsage /
              activeUsageDays.length
            : 0;

    const flock =
        getFlockCount();

    const feedPerBird =
        flock > 0
            ? averageUsage / flock
            : 0;

    const stock =
        getFeedAmount();

    /*
     * Estimated number of days the current
     * feed stock will last.
     */
    const daysRemaining =
        averageUsage > 0
            ? stock / averageUsage
            : 0;

    return {
        dates,
        usage,
        totalUsage,
        averageUsage,
        feedPerBird,
        stock,
        daysRemaining,
        activeUsageDays:
            activeUsageDays.length
    };
}


    /* =====================================================
       18. FEED UI
       ===================================================== */

    function updateFeedManagement() {

        const stats =
            getFeedStats();


        const feedAmount =
            $("feedAmount");

        if (feedAmount) {

            feedAmount.textContent =
                stats.stock.toFixed(
                    1
                ) + " kg";
        }


        const feedUsedToday =
            $("feedUsedToday");

        if (feedUsedToday) {

            feedUsedToday.textContent =
                getTodayFeedUsage()
                    .toFixed(1) +
                " kg";
        }


        const feedDailyAverage =
            $("feedDailyAverage");

        if (feedDailyAverage) {

            feedDailyAverage.textContent =
                stats.averageUsage
                    .toFixed(1) +
                " kg";
        }


        const feedDaysRemaining =
            $("feedDaysRemaining");

        if (feedDaysRemaining) {

            feedDaysRemaining.textContent =
                stats.daysRemaining > 0
                    ? stats.daysRemaining
                        .toFixed(1)
                    : "0";
        }


        const feedDaysRemainingText =
            $("feedDaysRemainingText");

        if (
            feedDaysRemainingText
        ) {

            const status =
                getFeedStatus(
                    stats.daysRemaining
                );

            feedDaysRemainingText.textContent =
                status.label;
        }


        const feedPerBird =
            $("feedPerBird");

        if (feedPerBird) {

            feedPerBird.textContent =
                stats.feedPerBird
                    .toFixed(2) +
                " kg";
        }


        const feedSevenDayUsage =
            $("feedSevenDayUsage");

        if (
            feedSevenDayUsage
        ) {

            feedSevenDayUsage.textContent =
                stats.totalUsage
                    .toFixed(1) +
                " kg";
        }


        const feedUsageDays =
            $("feedUsageDays");

        if (feedUsageDays) {

            const activeDays =
                stats.usage.filter(
                    item =>
                        item.amount > 0
                ).length;

            feedUsageDays.textContent =
                activeDays;
        }


        updateFeedProgress(
            stats
        );

        updateFeedConsumptionChart(
            stats
        );

        updateFeedHistory();

        updateFeedActionState();
    }


    function updateFeedProgress(
        stats
    ) {

        const progress =
            $("feedStockProgress");


        const percentageLabel =
            $("feedStockPercentage");


        const badge =
            $("feedStatusBadge");


        const status =
            getFeedStatus(
                stats.daysRemaining
            );


        /*
         * When there is no usage history yet, there is
         * no meaningful consumption-based stock forecast.
         */

        const hasUsage =
            stats.averageUsage > 0;


        const percentage =
            hasUsage
                ? status.percentage
                : 0;


        if (progress) {

            progress.style.width =
                percentage +
                "%";

            progress.setAttribute(
    "aria-valuenow",
    Math.round(
        percentage
    )
);

            progress.setAttribute(
                "aria-valuemin",
                "0"
            );

            progress.setAttribute(
                "aria-valuemax",
                "100"
            );
        }


        if (percentageLabel) {

            percentageLabel.textContent =
                hasUsage
                    ? Math.round(
                        percentage
                    ) + "%"
                    : "—";
        }


        if (badge) {

            badge.classList.remove(
                "feed-status-neutral",
                "feed-status-healthy",
                "feed-status-warning",
                "feed-status-danger"
            );


            if (!hasUsage) {

                badge.classList.add(
                    "feed-status-neutral"
                );

                badge.textContent =
                    "No usage data";

            } else {

                if (
                    status.className ===
                    "healthy"
                ) {

                    badge.classList.add(
                        "feed-status-healthy"
                    );

                } else if (
                    status.className ===
                    "warning"
                ) {

                    badge.classList.add(
                        "feed-status-warning"
                    );

                } else {

                    badge.classList.add(
                        "feed-status-danger"
                    );
                }


                badge.textContent =
                    status.label;
            }
        }
    }


    function updateFeedActionState() {

        const undoButton =
            $("undoFeedButton");


        if (undoButton) {

            const history =
                getFeedAdditionHistory();


            if (
                history.length === 0
            ) {

                undoButton.disabled =
                    true;

            } else {

                const last =
                    history[
                        history.length - 1
                    ];

                const current =
                    getFeedAmount();

                const expected =
                    safeNumber(
                        last.afterStock
                    );

                undoButton.disabled =
                    Math.abs(
                        current -
                        expected
                    ) > 0.01;
            }
        }
    }


    /* =====================================================
       19. FEED CONSUMPTION CHART
       ===================================================== */

    function updateFeedConsumptionChart(
        stats
    ) {

        const container =
            $("feedConsumptionChart");

        if (!container) {
            return;
        }


        const canvas =
            getOrCreateChartCanvas(
                container,
                "pm-feed-chart-canvas"
            );


        const prepared =
            prepareCanvasSize(
                canvas,
                280,
                170
            );


        if (!prepared) {
            return;
        }


        const {
            context,
            width,
            height
        } = prepared;


        const values =
            stats.usage.map(
                item =>
                    item.amount
            );


        const maximum =
            Math.max(
                1,
                ...values
            );


        const padding = {
            top: 16,
            right: 12,
            bottom: 32,
            left: 28
        };


        const chartWidth =
            Math.max(
                1,
                width -
                padding.left -
                padding.right
            );


        const chartHeight =
            Math.max(
                1,
                height -
                padding.top -
                padding.bottom
            );


        context.strokeStyle =
            "rgba(128,128,128,0.18)";

        context.lineWidth =
            1;


        for (
            let i = 0;
            i < 4;
            i++
        ) {

            const y =
                padding.top +
                (
                    chartHeight /
                    3 *
                    i
                );


            context.beginPath();

            context.moveTo(
                padding.left,
                y
            );

            context.lineTo(
                width -
                padding.right,
                y
            );

            context.stroke();
        }


        const points =
            values.map(
                (value, index) => {

                    const x =
                        values.length === 1
                            ? padding.left +
                              chartWidth / 2
                            : padding.left +
                              (
                                  chartWidth /
                                  (
                                      values.length -
                                      1
                                  )
                              ) *
                              index;


                    const y =
                        padding.top +
                        chartHeight -
                        (
                            value /
                            maximum *
                            chartHeight
                        );


                    return {
                        x,
                        y,
                        value
                    };
                }
            );


        if (
            points.length > 0
        ) {

            context.beginPath();

            points.forEach(
                (point, index) => {

                    if (
                        index === 0
                    ) {

                        context.moveTo(
                            point.x,
                            point.y
                        );

                    } else {

                        context.lineTo(
                            point.x,
                            point.y
                        );
                    }
                }
            );


            context.strokeStyle =
                "currentColor";

            context.lineWidth =
                2.5;

            context.stroke();


            points.forEach(
                point => {

                    context.beginPath();

                    context.arc(
                        point.x,
                        point.y,
                        3.5,
                        0,
                        Math.PI * 2
                    );

                    context.fillStyle =
                        "currentColor";

                    context.fill();
                }
            );
        }


        context.fillStyle =
            "rgba(128,128,128,0.85)";

        context.font =
            "11px system-ui, sans-serif";

        context.textAlign =
            "center";


        stats.usage.forEach(
            (item, index) => {

                const point =
                    points[index];

                if (!point) {
                    return;
                }

                context.fillText(
                    isToday(
                        item.date
                    )
                        ? "Today"
                        : formatShortDate(
                            item.date
                        ),
                    point.x,
                    height - 9
                );
            }
        );
    }


    /* =====================================================
       20. FEED HISTORY
       ===================================================== */

    let showAllFeedHistory = false;


    function updateFeedHistory() {

        const list =
            $("feedHistoryList");

        if (!list) {
            return;
        }


        const history =
            getFeedUsageHistory();


        const dates =
            Object.keys(history)
                .filter(
                    key =>
                        /^\d{4}-\d{2}-\d{2}$/
                            .test(key)
                )
                .sort(
                    (a, b) =>
                        b.localeCompare(a)
                );


        const visible =
            showAllFeedHistory
                ? dates
                : dates.slice(
                    0,
                    7
                );


        if (
            visible.length === 0
        ) {

            list.innerHTML = `
                <div class="pm-empty-state">
                    No feed usage recorded yet.
                </div>
            `;

        } else {

            list.innerHTML =
                visible.map(
                    date => {

                        const usage =
                            safeNumber(
                                history[date]
                            );


                        const label =
                            isToday(date)
                                ? "Today"
                                : formatDate(
                                    date
                                );


                        return `
                            <div class="feed-history-item">
                                <div class="feed-history-date">
                                    ${escapeHTML(
                                        label
                                    )}
                                </div>

                                <div class="feed-history-value">
                                    ${usage.toFixed(1)} kg
                                </div>
                            </div>
                        `;
                    }
                )
                .join("");
        }


        const button =
            $("viewFeedHistoryButton");


        if (button) {

            if (
                dates.length <= 7
            ) {

                button.style.display =
                    "none";

            } else {

                button.style.display =
                    "";

                button.textContent =
                    showAllFeedHistory
                        ? "Show Less"
                        : "View All Feed History";
            }
        }
    }


    /* =====================================================
       21. FEED SCHEDULE
       ===================================================== */

    function getFeedSchedule() {

        const stored =
            readJSON(
                APP.storage.schedule,
                null
            );


        if (
            stored &&
            typeof stored === "object"
        ) {

            return {
                morning:
                    stored.morning ||
                    stored.morningTime ||
                    APP.defaults.morningFeed,

                afternoon:
                    stored.afternoon ||
                    stored.afternoonTime ||
                    APP.defaults.afternoonFeed
            };
        }


        const morning =
            readStorage(
                "morningFeedTime",
                APP.defaults.morningFeed
            );


        const afternoon =
            readStorage(
                "afternoonFeedTime",
                APP.defaults.afternoonFeed
            );


        return {
            morning,
            afternoon
        };
    }


    function saveFeedSchedule(
        morning,
        afternoon
    ) {

        const schedule = {
            morning:
                morning ||
                APP.defaults.morningFeed,

            afternoon:
                afternoon ||
                APP.defaults.afternoonFeed
        };


        writeJSON(
            APP.storage.schedule,
            schedule
        );


        writeStorage(
            "morningFeedTime",
            schedule.morning
        );

        writeStorage(
            "afternoonFeedTime",
            schedule.afternoon
        );


        syncScheduleWithServer(
            schedule
        );


        updateNextFeed();

        updateAlarmStatus();

        scheduleAutomaticBackup();
    }


    async function syncScheduleWithServer(
        schedule
    ) {

        try {

            await fetch(
                APP.renderBase +
                "/schedule",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            schedule
                        )
                }
            );

        } catch (error) {

            console.warn(
                "Could not sync feeding schedule with server:",
                error
            );
        }
    }


    function getNextFeed() {

        const schedule =
            getFeedSchedule();


        const now =
            new Date();


        const currentMinutes =
            now.getHours() * 60 +
            now.getMinutes();


        const candidates = [
            {
                label: "Morning",
                time:
                    schedule.morning
            },
            {
                label: "Afternoon",
                time:
                    schedule.afternoon
            }
        ];


        const valid =
            candidates
                .map(item => ({
                    ...item,
                    minutes:
                        timeToMinutes(
                            item.time
                        )
                }))
                .filter(
                    item =>
                        item.minutes !== null
                );


        if (
            valid.length === 0
        ) {

            return null;
        }


        const laterToday =
            valid
                .filter(
                    item =>
                        item.minutes >=
                        currentMinutes
                )
                .sort(
                    (a, b) =>
                        a.minutes -
                        b.minutes
                );


        if (
            laterToday.length > 0
        ) {

            return {
                ...laterToday[0],
                tomorrow: false
            };
        }


        valid.sort(
            (a, b) =>
                a.minutes -
                b.minutes
        );


        return {
            ...valid[0],
            tomorrow: true
        };
    }


    function updateNextFeed() {

        const next =
            getNextFeed();


        const overview =
            $("farmOverviewNextFeed");


        if (overview) {

            overview.textContent =
                next
                    ? formatTime(
                        next.time
                    )
                    : "--";
        }


        const scheduleTime =
            $("nextFeedTime");

        if (scheduleTime) {

            scheduleTime.textContent =
                next
                    ? formatTime(
                        next.time
                    )
                    : "--";
        }


        const countdown =
            $("nextFeedCountdown");

        if (countdown) {

            countdown.textContent =
                next
                    ? formatCountdown(
                        getMinutesUntilTime(
                            next.time
                        )
                    )
                    : "--";
        }
    }


    /* =====================================================
       22. FARM OVERVIEW
       ===================================================== */

    function updateFarmOverview() {

        const flock =
            getFlockCount();


        const eggs =
            getTodayEggs();


        const layingRate =
            getLayingRate(
                eggs,
                flock
            );


        const feed =
            getFeedAmount();


        const next =
            getNextFeed();


        const flockElement =
            $("farmOverviewFlock");

        if (flockElement) {

            flockElement.textContent =
                flock;
        }


        const eggsElement =
            $("farmOverviewEggs");

        if (eggsElement) {

            eggsElement.textContent =
                eggs;
        }


        const rateElement =
            $("farmOverviewLayingRate");

        if (rateElement) {

            rateElement.textContent =
                Math.round(
                    layingRate
                ) +
                "%";
        }


        const feedElement =
            $("farmOverviewFeed");

        if (feedElement) {

            feedElement.textContent =
                feed.toFixed(1) +
                " kg";
        }


        const nextElement =
            $("farmOverviewNextFeed");

        if (nextElement) {

            nextElement.textContent =
                next
                    ? formatTime(
                        next.time
                    )
                    : "--";
        }
    }


    /* =====================================================
       23. QUICK ACTIONS
       ===================================================== */

    function initializeQuickActions() {

        const quickAddEggs =
            $("quickAddEggs");


        const quickFeed =
            $("quickFeed");


        const quickHistory =
            $("quickHistory");


        if (quickAddEggs) {

            quickAddEggs.addEventListener(
                "click",
                () => {

                    addEggs(1);

                    updateFarmOverview();

                }
            );
        }


        if (quickFeed) {

            quickFeed.addEventListener(
                "click",
                () => {

                    const input =
                        $("feedInput");


                    const section =
                        input
                            ? input.closest(
                                ".section"
                            )
                            : null;


                    if (section) {

                        scrollToElement(
                            section
                        );

                    } else {

                        scrollToElement(
                            input
                        );
                    }


                    if (input) {

                        setTimeout(
                            () => {
                                input.focus();
                            },
                            450
                        );
                    }
                }
            );
        }


        if (quickHistory) {

            quickHistory.addEventListener(
                "click",
                () => {

                    const list =
                        $("eggHistoryList");


                    const section =
                        list
                            ? list.closest(
                                ".section"
                            )
                            : null;


                    scrollToElement(
                        section || list
                    );
                }
            );
        }
    }


    /* =====================================================
       24. EGG CONTROLS
       ===================================================== */

    function initializeEggControls() {

        const addButton =
            $("addEggButton");


        const removeButton =
            $("removeEggButton");


        const historyButton =
            $("viewHistoryButton");


        if (addButton) {

            addButton.addEventListener(
                "click",
                () => {

                    addEggs(1);
                }
            );
        }


        if (removeButton) {

            removeButton.addEventListener(
                "click",
                () => {

                    removeEggs(1);
                }
            );
        }


        if (historyButton) {

            historyButton.addEventListener(
                "click",
                () => {

                    showAllEggHistory =
                        !showAllEggHistory;

                    updateEggHistory();
                }
            );
        }
    }


    /* =====================================================
       25. FEED CONTROLS
       ===================================================== */

    function initializeFeedControls() {

        const addButton =
            $("addFeedButton");


        const useButton =
            $("useFeedButton");


        const resetUsageButton =
            $("resetFeedTodayButton");


        const historyButton =
            $("viewFeedHistoryButton");


        if (addButton) {

            addButton.addEventListener(
                "click",
                () => {

                    const input =
                        $("feedInput");


                    addFeed(
                        input
                            ? input.value
                            : 0
                    );
                }
            );
        }


        if (useButton) {

            useButton.addEventListener(
                "click",
                () => {

                    const input =
                        $("useFeedInput");


                    useFeed(
                        input
                            ? input.value
                            : 0
                    );
                }
            );
        }


        if (resetUsageButton) {

            resetUsageButton.addEventListener(
                "click",
                () => {

                    resetTodayFeedUsage();
                }
            );
        }


        if (historyButton) {

            historyButton.addEventListener(
                "click",
                () => {

                    showAllFeedHistory =
                        !showAllFeedHistory;

                    updateFeedHistory();
                }
            );
        }


        const feedInput =
            $("feedInput");


        if (feedInput) {

            feedInput.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        addButton?.click();
                    }
                }
            );
        }


        const useFeedInput =
            $("useFeedInput");


        if (useFeedInput) {

            useFeedInput.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        useButton?.click();
                    }
                }
            );
        }
    }


    /* =====================================================
       26. FEED ACTION BUTTONS
       ===================================================== */

    function ensureFeedActionButtons() {

        const addButton =
            $("addFeedButton");


        if (!addButton) {
            return;
        }


        const actionContent =
            addButton.closest(
                ".feed-action-content"
            );


        const parent =
            actionContent ||
            addButton.parentElement;


        if (!parent) {
            return;
        }


        let undoButton =
            $("undoFeedButton");


        if (!undoButton) {

            undoButton =
                document.createElement(
                    "button"
                );

            undoButton.id =
                "undoFeedButton";

            undoButton.type =
                "button";

            undoButton.className =
                "feed-action-button feed-secondary-button";

            undoButton.textContent =
                "Undo Last Addition";


            parent.appendChild(
                undoButton
            );


            undoButton.addEventListener(
                "click",
                undoLastFeedAddition
            );
        }


        let resetButton =
            $("resetFeedStockButton");


        if (!resetButton) {

            resetButton =
                document.createElement(
                    "button"
                );

            resetButton.id =
                "resetFeedStockButton";

            resetButton.type =
                "button";

            resetButton.className =
                "feed-reset-button";

            resetButton.textContent =
                "Reset Feed Stock";


            parent.appendChild(
                resetButton
            );


            resetButton.addEventListener(
                "click",
                resetFeedStock
            );
        }
    }


    /* =====================================================
       27. ALARM DATA
       ===================================================== */

    function isAlarmEnabled() {

        return (
            readStorage(
                APP.storage.alarm,
                String(
                    APP.defaults.alarm
                )
            ) === "true"
        );
    }


    function setAlarmEnabled(
        enabled
    ) {

        writeStorage(
            APP.storage.alarm,
            Boolean(enabled)
        );


        if (!enabled) {

            writeStorage(
                APP.storage.alarmTriggered,
                ""
            );
        }


        updateAlarmStatus();

        scheduleAutomaticBackup();
    }


    function updateAlarmStatus() {

        const enabled =
            isAlarmEnabled();


        const toggle =
            $("pmAlarmToggle");


        if (toggle) {

            toggle.checked =
                enabled;
        }


        const status =
            $("pmAlarmStatus");


        if (status) {

            status.textContent =
                enabled
                    ? "Enabled"
                    : "Disabled";

            status.classList.toggle(
                "enabled",
                enabled
            );
        }
    }


    /* =====================================================
       28. ALARM CHECK
       ===================================================== */

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
            ).padStart(2, "0") +
            ":" +
            String(
                now.getMinutes()
            ).padStart(2, "0");


        const schedule =
            getFeedSchedule();


        let matched =
            null;


        if (
            currentTime ===
            schedule.morning
        ) {

            matched =
                "morning";

        } else if (
            currentTime ===
            schedule.afternoon
        ) {

            matched =
                "afternoon";
        }


        if (!matched) {
            return;
        }


        const today =
            getTodayKey();


        const triggerKey =
            today +
            "-" +
            matched;


        const lastTriggered =
            readStorage(
                APP.storage.alarmTriggered,
                ""
            );


        if (
            lastTriggered ===
            triggerKey
        ) {

            return;
        }


        writeStorage(
            APP.storage.alarmTriggered,
            triggerKey
        );


        triggerFeedNotification(
            matched
        );
    }


    function triggerFeedNotification(
        period
    ) {

        const title =
            "Poultry Manager";


        const body =
            period === "morning"
                ? "Morning feeding time."
                : "Afternoon feeding time.";


        if (
            "Notification" in window &&
            Notification.permission ===
                "granted"
        ) {

            try {

                new Notification(
                    title,
                    {
                        body,
                        icon:
                            "icon-192.png"
                    }
                );

            } catch (error) {

                console.warn(
                    "Notification could not be displayed:",
                    error
                );
            }
        }


        notify(
            body,
            "info"
        );
    }


    /* =====================================================
       29. NOTIFICATIONS / PUSH
       ===================================================== */

    function notificationsEnabled() {

        return (
            readStorage(
                APP.storage.notifications,
                String(
                    APP.defaults.notifications
                )
            ) === "true"
        );
    }


    function base64ToUint8Array(
        base64String
    ) {

        const padding =
            "=".repeat(
                (
                    4 -
                    base64String.length % 4
                ) % 4
            );


        const base64 =
            (
                base64String +
                padding
            )
                .replace(
                    /-/g,
                    "+"
                )
                .replace(
                    /_/g,
                    "/"
                );


        const rawData =
            window.atob(
                base64
            );


        const outputArray =
            new Uint8Array(
                rawData.length
            );


        for (
            let i = 0;
            i < rawData.length;
            ++i
        ) {

            outputArray[i] =
                rawData.charCodeAt(i);
        }


        return outputArray;
    }


    async function enablePushNotifications() {

        if (
            !("Notification" in window)
        ) {

            notify(
                "This browser does not support notifications.",
                "warning"
            );

            return false;
        }


        if (
            !("serviceWorker" in navigator)
        ) {

            notify(
                "Service workers are not supported here.",
                "warning"
            );

            return false;
        }


        try {

            const permission =
                await Notification.requestPermission();


            if (
                permission !==
                "granted"
            ) {

                notify(
                    "Notification permission was not granted.",
                    "warning"
                );

                return false;
            }


            const registration =
                await getServiceWorkerRegistration();


            if (!registration) {

                notify(
                    "Could not connect to the app notification service.",
                    "warning"
                );

                return false;
            }


            const keyResponse =
                await fetch(
                    APP.renderBase +
                    "/vapid-public-key"
                );


            if (
                !keyResponse.ok
            ) {

                throw new Error(
                    "Could not retrieve notification key."
                );
            }


            const keyData =
                await keyResponse.json();


            const publicKey =
                keyData.publicKey ||
                keyData.key ||
                keyData.vapidPublicKey;


            if (!publicKey) {

                throw new Error(
                    "Notification public key is missing."
                );
            }


            let subscription =
                await registration.pushManager.getSubscription();


            if (!subscription) {

                subscription =
                    await registration.pushManager.subscribe(
                        {
                            userVisibleOnly:
                                true,

                            applicationServerKey:
                                base64ToUint8Array(
                                    publicKey
                                )
                        }
                    );
            }


            const subscribeResponse =
                await fetch(
                    APP.renderBase +
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


            if (
                !subscribeResponse.ok
            ) {

                throw new Error(
                    "Subscription could not be saved."
                );
            }


            writeStorage(
                APP.storage.notifications,
                true
            );


            updateNotificationStatus();

            scheduleAutomaticBackup();


            notify(
                "Notifications are enabled.",
                "success"
            );


            return true;

        } catch (error) {

            console.error(
                "Notification setup failed:",
                error
            );


            notify(
                "Notification setup could not be completed. The app can still use its local alarm.",
                "warning"
            );


            return false;
        }
    }


    async function getServiceWorkerRegistration() {

        if (
            !("serviceWorker" in navigator)
        ) {

            return null;
        }


        const registrations =
            await navigator.serviceWorker.getRegistrations();


        const existing =
            registrations.find(
                registration =>
                    registration.active ||
                    registration.waiting ||
                    registration.installing
            );


        if (existing) {

            return existing;
        }


        const swUrl =
            new URL(
                "sw.js",
                window.location.href
            );


        return navigator.serviceWorker.register(
            swUrl.href
        );
    }


    function updateNotificationStatus() {

        const enabled =
            notificationsEnabled();


        const toggle =
            $("pmNotificationsToggle");


        if (toggle) {

            toggle.checked =
                enabled;
        }


        const button =
            $("pmEnableNotificationsButton");


        if (button) {

            button.textContent =
                enabled
                    ? "Notifications Enabled"
                    : "Enable Notifications";
        }


        const status =
            $("pmNotificationsStatus");


        if (status) {

            status.textContent =
                enabled
                    ? "Notifications are enabled."
                    : "Notifications are not enabled.";

            status.className =
                enabled
                    ? "pm-settings-status success"
                    : "pm-settings-status";
        }
    }


    /* =====================================================
       30. FARM OVERVIEW REFRESH LOOP
       ===================================================== */

    function startFarmOverviewRefresh() {

        updateFarmOverview();

        updateNextFeed();


        if (
            window.__pmOverviewTimer
        ) {

            clearInterval(
                window.__pmOverviewTimer
            );
        }


        window.__pmOverviewTimer =
            setInterval(
                () => {

                    updateFarmOverview();

                    updateNextFeed();

                },
                1000
            );
    }


    /* =====================================================
       31. GLOBAL REFRESH
       ===================================================== */

    function refreshAll() {

        updateFarmOverview();

        updateEggDisplay();

        refreshProduction();

        updateFeedManagement();

        updateNextFeed();

        updateAlarmStatus();

        updateNotificationStatus();
    }


    /* =====================================================
       32. PUBLIC API
       ===================================================== */

    window.updateFarmOverview =
        updateFarmOverview;


    window.PoultryManager = {

        version:
            APP.version,

        refresh:
            refreshAll,

        addEggs,

        removeEggs,

        addFeed,

        useFeed,

        undoLastFeedAddition,

        resetFeedStock,

        resetTodayFeedUsage,

        getFlockCount,

        setFlockCount,

        getTodayEggs,

        getEggHistory,

        getFeedAmount,

        getFeedUsageHistory,

        getFeedSchedule,

        saveFeedSchedule,

        enablePushNotifications
    };


    /*
     * Part 2 continues below.
     */

/* =========================================================
   POULTRY MANAGER
   UNIFIED PRODUCTION MANAGEMENT SYSTEM
   ---------------------------------------------------------
   Part 2 of 2
   SETTINGS, NAVIGATION, BACKUP, THEME & STARTUP
   ========================================================= */


/* =====================================================
   33. SETTINGS VIEW
   ===================================================== */

let settingsView = null;
let settingsInitialized = false;


function createSettingsView() {

    settingsView =
        $("pmSettingsView");


    if (!settingsView) {

        settingsView =
            document.createElement(
                "section"
            );

        settingsView.id =
            "pmSettingsView";

        settingsView.className =
            "pm-settings-view";

        /*
         * Settings MUST start hidden.
         * It is only shown by showSettings().
         */
        settingsView.style.display =
            "none";


        const dashboardView =
            $("pmDashboardView");


        if (
            dashboardView &&
            dashboardView.parentNode
        ) {

            dashboardView.parentNode.insertBefore(
                settingsView,
                dashboardView.nextSibling
            );

        } else {

            document.body.appendChild(
                settingsView
            );
        }

    } else {

        /*
         * If an existing Settings view is found,
         * do not allow it to appear underneath the
         * Dashboard during startup.
         */
        if (
            !settingsView.classList.contains(
                "active"
            )
        ) {

            settingsView.style.display =
                "none";
        }
    }


    if (
        settingsInitialized
    ) {

        return;
    }


    settingsInitialized =
        true;


    settingsView.innerHTML = `
        <div class="pm-settings-header">
            <h2>Settings</h2>

            <p>
                Manage your flock, feeding schedule,
                notifications, appearance and farm data.
            </p>
        </div>


        <div class="pm-settings-grid">

            <!-- FLOCK -->

            <section class="pm-settings-card">

                <div class="pm-settings-card-header">

                    <div class="pm-settings-icon">
                        🐔
                    </div>

                    <div>
                        <h3>Flock Settings</h3>

                        <p>
                            Keep your flock size accurate
                            for production calculations.
                        </p>
                    </div>

                </div>


                <div class="pm-settings-row">

                    <div class="pm-settings-row-info">

                        <strong>
                            Number of layers
                        </strong>

                        <span>
                            Current flock size
                        </span>

                    </div>


                    <input
                        id="pmSettingsFlockInput"
                        class="pm-settings-input"
                        type="number"
                        min="0"
                        step="1"
                    />

                </div>


                <div class="pm-settings-actions">

                    <button
                        id="pmSaveFlockButton"
                        type="button"
                        class="pm-settings-action-button pm-settings-primary"
                    >
                        Save Flock Size
                    </button>

                </div>


                <div
                    id="pmFlockStatus"
                    class="pm-settings-status"
                    aria-live="polite"
                ></div>

            </section>


            <!-- FEEDING SCHEDULE -->

            <section class="pm-settings-card">

                <div class="pm-settings-card-header">

                    <div class="pm-settings-icon">
                        🌾
                    </div>

                    <div>
                        <h3>Feeding Schedule</h3>

                        <p>
                            Set the two daily feeding times
                            used by your farm alarm.
                        </p>
                    </div>

                </div>


                <div class="pm-schedule-grid">

                    <div class="pm-schedule-field">

                        <label
                            for="pmMorningFeedInput"
                        >
                            Morning feeding
                        </label>

                        <input
                            id="pmMorningFeedInput"
                            class="pm-settings-input"
                            type="time"
                        />

                    </div>


                    <div class="pm-schedule-field">

                        <label
                            for="pmAfternoonFeedInput"
                        >
                            Afternoon feeding
                        </label>

                        <input
                            id="pmAfternoonFeedInput"
                            class="pm-settings-input"
                            type="time"
                        />

                    </div>

                </div>


                <div class="pm-settings-actions">

                    <button
                        id="pmSaveScheduleButton"
                        type="button"
                        class="pm-settings-action-button pm-settings-primary"
                    >
                        Save Schedule
                    </button>

                </div>


                <div
                    id="pmScheduleStatus"
                    class="pm-settings-status"
                    aria-live="polite"
                ></div>

            </section>


            <!-- FEED ALARM -->

            <section class="pm-settings-card">

                <div class="pm-settings-card-header">

                    <div class="pm-settings-icon">
                        ⏰
                    </div>

                    <div>
                        <h3>Feed Alarm</h3>

                        <p>
                            Receive an alert when it is
                            time to feed the flock.
                        </p>
                    </div>

                </div>


                <div class="pm-settings-row">

                    <div class="pm-settings-row-info">

                        <strong>
                            Feeding alarm
                        </strong>

                        <span>
                            Uses your saved feeding schedule
                        </span>

                    </div>


                    <input
                        id="pmAlarmToggle"
                        type="checkbox"
                    />

                </div>


                <div
                    id="pmAlarmStatus"
                    class="pm-settings-status"
                    aria-live="polite"
                ></div>

            </section>


            <!-- NOTIFICATIONS -->

            <section class="pm-settings-card">

                <div class="pm-settings-card-header">

                    <div class="pm-settings-icon">
                        🔔
                    </div>

                    <div>
                        <h3>Notifications</h3>

                        <p>
                            Enable device notifications for
                            feeding reminders.
                        </p>
                    </div>

                </div>


                <div class="pm-settings-row">

                    <div class="pm-settings-row-info">

                        <strong>
                            Push notifications
                        </strong>

                        <span>
                            Device notification permission
                        </span>

                    </div>


                    <input
                        id="pmNotificationsToggle"
                        type="checkbox"
                        disabled
                    />

                </div>


                <div class="pm-settings-actions">

                    <button
                        id="pmEnableNotificationsButton"
                        type="button"
                        class="pm-settings-action-button pm-settings-primary"
                    >
                        Enable Notifications
                    </button>

                </div>


                <div
                    id="pmNotificationsStatus"
                    class="pm-settings-status"
                    aria-live="polite"
                ></div>

            </section>


            <!-- APPEARANCE -->

            <section class="pm-settings-card">

                <div class="pm-settings-card-header">

                    <div class="pm-settings-icon">
                        🎨
                    </div>

                    <div>
                        <h3>Appearance</h3>

                        <p>
                            Choose how Poultry Manager
                            looks on your device.
                        </p>

                    </div>

                </div>


                <div class="pm-settings-row">

                    <div class="pm-settings-row-info">

                        <strong>
                            Theme
                        </strong>

                        <span>
                            Light or dark appearance
                        </span>

                    </div>


                    <select
                        id="pmThemeSelect"
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


            <!-- BACKUP -->

            <section class="pm-settings-card pm-settings-card-wide">

                <div class="pm-settings-card-header">

                    <div class="pm-settings-icon">
                        💾
                    </div>

                    <div>
                        <h3>Data Backup</h3>

                        <p>
                            Protect your Poultry Manager
                            records by exporting or restoring
                            your farm data.
                        </p>
                    </div>

                </div>


                <div class="pm-settings-row">

                    <div class="pm-settings-row-info">

                        <strong>
                            Automatic backup
                        </strong>

                        <span>
                            Save a local backup whenever
                            important farm data changes.
                        </span>

                    </div>


                    <input
                        id="pmAutomaticBackupToggle"
                        type="checkbox"
                    />

                </div>


                <div class="pm-settings-actions">

                    <button
                        id="pmExportBackupButton"
                        type="button"
                        class="pm-settings-action-button pm-settings-primary"
                    >
                        Export Backup
                    </button>


                    <button
                        id="pmImportBackupButton"
                        type="button"
                        class="pm-settings-action-button pm-settings-secondary"
                    >
                        Restore Backup
                    </button>

                    <input
                        id="pmBackupFileInput"
                        type="file"
                        accept=".json,application/json"
                        hidden
                    />

                </div>


                <div
                    id="pmBackupStatus"
                    class="pm-settings-status"
                    aria-live="polite"
                ></div>

            </section>


            <!-- ABOUT -->

            <section class="pm-settings-card pm-settings-card-wide">

                <div class="pm-settings-card-header">

                    <div class="pm-settings-icon">
                        ℹ️
                    </div>

                    <div>
                        <h3>About Poultry Manager</h3>

                        <p>
                            Your personal poultry production
                            management system.
                        </p>
                    </div>

                </div>


                <div class="pm-about">

                    <div class="pm-about-brand">

                        <div class="pm-about-logo">
                            PM
                        </div>

                        <div>

                            <strong>
                                Poultry Manager
                            </strong>

                            <span>
                                Production Management System
                            </span>

                        </div>

                    </div>


                    <p class="pm-about-description">
                        Track your flock, egg production,
                        feed inventory, feeding schedule
                        and production performance from
                        one place.
                    </p>


                    <div class="pm-settings-divider"></div>


                    <div class="pm-settings-row">

                        <div class="pm-settings-row-info">

                            <strong>
                                Version
                            </strong>

                            <span>
                                Production Architecture
                            </span>

                        </div>


                        <span class="pm-settings-badge enabled">
                            <span class="pm-settings-badge-dot"></span>
                            ${escapeHTML(APP.version)}
                        </span>

                    </div>

                </div>

            </section>

        </div>
    `;


    /*
     * Settings must remain hidden after the HTML is
     * generated. showSettings() is responsible for
     * displaying it.
     */
    settingsView.classList.remove(
        "active"
    );

    settingsView.style.display =
        "none";


    initializeSettingsEvents();

    refreshSettings();
}


/* =====================================================
   34. SETTINGS REFRESH
   ===================================================== */

function refreshSettings() {

    createSettingsView();


    const flockInput =
        $("pmSettingsFlockInput");


    if (flockInput) {

        flockInput.value =
            getFlockCount();
    }


    const schedule =
        getFeedSchedule();


    const morningInput =
        $("pmMorningFeedInput");


    if (morningInput) {

        morningInput.value =
            schedule.morning;
    }


    const afternoonInput =
        $("pmAfternoonFeedInput");


    if (afternoonInput) {

        afternoonInput.value =
            schedule.afternoon;
    }


    const alarmToggle =
        $("pmAlarmToggle");


    if (alarmToggle) {

        alarmToggle.checked =
            isAlarmEnabled();
    }


    const automaticBackupToggle =
        $("pmAutomaticBackupToggle");


    if (
        automaticBackupToggle
    ) {

        automaticBackupToggle.checked =
            isAutomaticBackupEnabled();
    }


    const themeSelect =
        $("pmThemeSelect");


    if (themeSelect) {

        themeSelect.value =
            getTheme();
    }


    updateAlarmStatus();

    updateNotificationStatus();

    updateBackupStatus();
}


/* =====================================================
   35. SETTINGS EVENTS
   ===================================================== */

function initializeSettingsEvents() {

    const saveFlockButton =
        $("pmSaveFlockButton");


    if (saveFlockButton) {

        saveFlockButton.addEventListener(
            "click",
            () => {

                const input =
                    $("pmSettingsFlockInput");


                const value =
                    Math.max(
                        0,
                        Math.floor(
                            safeNumber(
                                input
                                    ? input.value
                                    : 0
                            )
                        )
                    );


                setFlockCount(
                    value
                );


                const status =
                    $("pmFlockStatus");


                if (status) {

                    status.textContent =
                        `Flock size saved: ${value} birds.`;

                    status.className =
                        "pm-settings-status success";
                }
            }
        );
    }


    const saveScheduleButton =
        $("pmSaveScheduleButton");


    if (
        saveScheduleButton
    ) {

        saveScheduleButton.addEventListener(
            "click",
            () => {

                const morning =
                    $("pmMorningFeedInput")
                        ?.value;


                const afternoon =
                    $("pmAfternoonFeedInput")
                        ?.value;


                if (
                    !morning ||
                    !afternoon
                ) {

                    const status =
                        $("pmScheduleStatus");


                    if (status) {

                        status.textContent =
                            "Please select both feeding times.";

                        status.className =
                            "pm-settings-status error";
                    }

                    return;
                }


                saveFeedSchedule(
                    morning,
                    afternoon
                );


                const status =
                    $("pmScheduleStatus");


                if (status) {

                    status.textContent =
                        "Feeding schedule saved.";

                    status.className =
                        "pm-settings-status success";
                }
            }
        );
    }


    const alarmToggle =
        $("pmAlarmToggle");


    if (alarmToggle) {

        alarmToggle.addEventListener(
            "change",
            () => {

                setAlarmEnabled(
                    alarmToggle.checked
                );


                const status =
                    $("pmAlarmStatus");


                if (status) {

                    status.textContent =
                        alarmToggle.checked
                            ? "Feed alarm enabled."
                            : "Feed alarm disabled.";

                    status.className =
                        "pm-settings-status success";
                }
            }
        );
    }


    const notificationButton =
        $("pmEnableNotificationsButton");


    if (
        notificationButton
    ) {

        notificationButton.addEventListener(
            "click",
            async () => {

                notificationButton.disabled =
                    true;


                notificationButton.textContent =
                    "Setting Up...";


                await enablePushNotifications();


                notificationButton.disabled =
                    false;


                updateNotificationStatus();
            }
        );
    }


    const themeSelect =
        $("pmThemeSelect");


    if (themeSelect) {

        themeSelect.addEventListener(
            "change",
            () => {

                setTheme(
                    themeSelect.value
                );
            }
        );
    }


    const automaticBackupToggle =
        $("pmAutomaticBackupToggle");


    if (
        automaticBackupToggle
    ) {

        automaticBackupToggle.addEventListener(
            "change",
            () => {

                setAutomaticBackupEnabled(
                    automaticBackupToggle.checked
                );

                updateBackupStatus();
            }
        );
    }


    const exportButton =
        $("pmExportBackupButton");


    if (exportButton) {

        exportButton.addEventListener(
            "click",
            exportBackup
        );
    }


    const importButton =
        $("pmImportBackupButton");


    if (importButton) {

        importButton.addEventListener(
            "click",
            () => {

                const fileInput =
                    $("pmBackupFileInput");

                fileInput?.click();
            }
        );
    }


    const fileInput =
        $("pmBackupFileInput");


    if (fileInput) {

        fileInput.addEventListener(
            "change",
            event => {

                const file =
                    event.target.files?.[0];


                if (file) {

                    restoreBackupFromFile(
                        file
                    );
                }

                event.target.value =
                    "";
            }
        );
    }
}


/* =====================================================
   36. NAVIGATION
   ===================================================== */

let dashboardButton = null;
let settingsButton = null;


function createNavigation() {

    let navigation =
        $("pmAppNavigation");


    if (!navigation) {

        navigation =
            document.createElement(
                "nav"
            );

        navigation.id =
            "pmAppNavigation";

        navigation.className =
            "app-navigation";


        const header =
            document.querySelector(
                "header"
            );


        const dashboardView =
            $("pmDashboardView");


        if (
            header &&
            header.parentNode
        ) {

            header.parentNode.insertBefore(
                navigation,
                dashboardView ||
                header.nextSibling
            );

        } else if (
            dashboardView &&
            dashboardView.parentNode
        ) {

            dashboardView.parentNode.insertBefore(
                navigation,
                dashboardView
            );

        } else {

            document.body.prepend(
                navigation
            );
        }
    }


    if (
        $("pmDashboardButton") &&
        $("pmSettingsButton")
    ) {

        dashboardButton =
            $("pmDashboardButton");

        settingsButton =
            $("pmSettingsButton");

        return;
    }


    navigation.innerHTML = `
        <button
            id="pmDashboardButton"
            type="button"
            class="active"
        >
            Dashboard
        </button>

        <button
            id="pmSettingsButton"
            type="button"
        >
            Settings
        </button>
    `;


    dashboardButton =
        $("pmDashboardButton");


    settingsButton =
        $("pmSettingsButton");


    dashboardButton?.addEventListener(
        "click",
        showDashboard
    );


    settingsButton?.addEventListener(
        "click",
        showSettings
    );
}


/* =====================================================
   37. VIEW CONTROL
   ===================================================== */

function setDashboardVisibility(
    visible
) {

    const dashboardView =
        $("pmDashboardView");


    if (!dashboardView) {

        console.error(
            "Poultry Manager: #pmDashboardView not found."
        );

        return;
    }


    dashboardView.style.display =
        visible
            ? ""
            : "none";


    dashboardView.setAttribute(
        "aria-hidden",
        visible
            ? "false"
            : "true"
    );
}


function setSettingsVisibility(
    visible
) {

    if (!settingsView) {
        createSettingsView();
    }


    if (!settingsView) {
        return;
    }


    settingsView.classList.toggle(
        "active",
        visible
    );


    settingsView.style.display =
        visible
            ? ""
            : "none";


    settingsView.setAttribute(
        "aria-hidden",
        visible
            ? "false"
            : "true"
    );
}


function showDashboard() {

    /*
     * Dashboard and Settings are always mutually
     * exclusive.
     */

    setSettingsVisibility(
        false
    );


    setDashboardVisibility(
        true
    );


    dashboardButton?.classList.add(
        "active"
    );


    settingsButton?.classList.remove(
        "active"
    );


    writeStorage(
        APP.storage.lastView,
        "dashboard"
    );


    refreshAll();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function showSettings() {

    createSettingsView();


    setDashboardVisibility(
        false
    );


    setSettingsVisibility(
        true
    );


    dashboardButton?.classList.remove(
        "active"
    );


    settingsButton?.classList.add(
        "active"
    );


    writeStorage(
        APP.storage.lastView,
        "settings"
    );


    refreshSettings();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =====================================================
   38. THEME
   ===================================================== */

function getTheme() {

    const saved =
        readStorage(
            APP.storage.theme,
            APP.defaults.theme
        );


    return (
        saved === "dark"
            ? "dark"
            : "light"
    );
}


function setTheme(
    theme
) {

    const selected =
        theme === "dark"
            ? "dark"
            : "light";


    document.documentElement.setAttribute(
        "data-theme",
        selected
    );


    writeStorage(
        APP.storage.theme,
        selected
    );


    const themeSelect =
        $("pmThemeSelect");


    if (themeSelect) {

        themeSelect.value =
            selected;
    }


    scheduleAutomaticBackup();
}


function initializeTheme() {

    setTheme(
        getTheme()
    );
}


/* =====================================================
   39. AUTOMATIC BACKUP
   ===================================================== */

function isAutomaticBackupEnabled() {

    return (
        readStorage(
            APP.storage.automaticBackup,
            String(
                APP.defaults.automaticBackup
            )
        ) === "true"
    );
}


function setAutomaticBackupEnabled(
    enabled
) {

    writeStorage(
        APP.storage.automaticBackup,
        Boolean(enabled)
    );


    if (enabled) {

        createAutomaticBackup();
    }


    scheduleAutomaticBackup();
}


function collectAllStorage() {

    const storage = {};


    try {

        for (
            let i = 0;
            i < localStorage.length;
            i++
        ) {

            const key =
                localStorage.key(i);


            if (
                key === null
            ) {
                continue;
            }


            storage[key] =
                localStorage.getItem(
                    key
                );
        }

    } catch (error) {

        console.error(
            "Could not collect local storage:",
            error
        );
    }


    return storage;
}


function createBackupObject() {

    return {
        app:
            APP.name,

        version:
            APP.version,

        exportedAt:
            new Date().toISOString(),

        storage:
            collectAllStorage()
    };
}


function createAutomaticBackup() {

    if (
        !isAutomaticBackupEnabled()
    ) {
        return;
    }


    const backup =
        createBackupObject();


    writeJSON(
        APP.storage.backupData,
        backup
    );


    writeStorage(
        APP.storage.lastBackup,
        backup.exportedAt
    );
}


function scheduleAutomaticBackup() {

    if (
        !isAutomaticBackupEnabled()
    ) {
        return;
    }


    clearTimeout(
        scheduleAutomaticBackup._timer
    );


    scheduleAutomaticBackup._timer =
        setTimeout(
            createAutomaticBackup,
            800
        );
}


function updateBackupStatus() {

    const status =
        $("pmBackupStatus");


    if (!status) {
        return;
    }


    const enabled =
        isAutomaticBackupEnabled();


    const lastBackup =
        readStorage(
            APP.storage.lastBackup,
            ""
        );


    if (!enabled) {

        status.textContent =
            "Automatic backup is disabled.";

        status.className =
            "pm-settings-status";

        return;
    }


    if (!lastBackup) {

        status.textContent =
            "Automatic backup is enabled. No backup has been created yet.";

        status.className =
            "pm-settings-status";

        return;
    }


    const date =
        new Date(
            lastBackup
        );


    const formatted =
        Number.isNaN(
            date.getTime()
        )
            ? lastBackup
            : date.toLocaleString();


    status.textContent =
        "Last automatic backup: " +
        formatted;


    status.className =
        "pm-settings-status success";
}


/* =====================================================
   40. EXPORT BACKUP
   ===================================================== */

function exportBackup() {

    try {

        const backup =
            createBackupObject();


        const json =
            JSON.stringify(
                backup,
                null,
                2
            );


        const blob =
            new Blob(
                [json],
                {
                    type:
                        "application/json"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        const date =
            getTodayKey();


        link.href =
            url;


        link.download =
            "poultry-manager-backup-" +
            date +
            ".json";


        document.body.appendChild(
            link
        );


        link.click();

        link.remove();


        URL.revokeObjectURL(
            url
        );


        writeStorage(
            APP.storage.lastBackup,
            backup.exportedAt
        );


        updateBackupStatus();


        notify(
            "Backup exported successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Backup export failed:",
            error
        );


        notify(
            "Backup export failed.",
            "error"
        );
    }
}


/* =====================================================
   41. RESTORE BACKUP
   ===================================================== */

function restoreBackupFromFile(
    file
) {

    if (!file) {
        return;
    }


    const reader =
        new FileReader();


    reader.onload =
        event => {

            try {

                const backup =
                    JSON.parse(
                        event.target.result
                    );


                if (
                    !backup ||
                    backup.app !==
                        APP.name
                ) {

                    throw new Error(
                        "This is not a valid Poultry Manager backup."
                    );
                }


                if (
                    !backup.storage ||
                    typeof backup.storage !==
                        "object"
                ) {

                    throw new Error(
                        "Backup storage data is missing."
                    );
                }


                const confirmed =
                    confirmAction(
                        "Restore this Poultry Manager backup?\n\n" +
                        "Your current saved farm data will be replaced by the backup."
                    );


                if (!confirmed) {
                    return;
                }


                localStorage.clear();


                Object.keys(
                    backup.storage
                )
                .forEach(
                    key => {

                        const value =
                            backup.storage[key];


                        if (
                            value !== null &&
                            value !== undefined
                        ) {

                            localStorage.setItem(
                                key,
                                value
                            );
                        }
                    }
                );


                notify(
                    "Backup restored. Poultry Manager will reload.",
                    "success"
                );


                setTimeout(
                    () => {
                        window.location.reload();
                    },
                    700
                );

            } catch (error) {

                console.error(
                    "Backup restore failed:",
                    error
                );


                const status =
                    $("pmBackupStatus");


                if (status) {

                    status.textContent =
                        error.message ||
                        "Could not restore this backup.";

                    status.className =
                        "pm-settings-status error";
                }
            }
        };


    reader.onerror =
        () => {

            notify(
                "Could not read the backup file.",
                "error"
            );
        };


    reader.readAsText(
        file
    );
}


/* =====================================================
   42. LEGACY DASHBOARD BACKUP CLEANUP
   ===================================================== */

function hideLegacyBackupSection() {

    const possibleSelectors = [
        "#dataBackupSection",
        "#backupSection",
        ".dashboard-backup-section",
        ".legacy-backup-section"
    ];


    possibleSelectors.forEach(
        selector => {

            $$(selector)
                .forEach(
                    element => {

                        if (
                            element.closest(
                                "#pmSettingsView"
                            )
                        ) {
                            return;
                        }


                        element.style.display =
                            "none";
                    }
                );
        }
    );
}


/* =====================================================
   43. APP SHELL POLISH
   ===================================================== */

function initializeAppShell() {

    const header =
        document.querySelector(
            "header"
        );


    if (header) {

        header.setAttribute(
            "role",
            "banner"
        );
    }


    const main =
        document.querySelector(
            "main"
        );


    if (main) {

        main.setAttribute(
            "role",
            "main"
        );
    }


    $$("button")
        .forEach(
            button => {

                if (
                    !button.getAttribute(
                        "type"
                    )
                ) {

                    button.setAttribute(
                        "type",
                        "button"
                    );
                }
            }
        );


    /*
     * Hide any obsolete dashboard backup block
     * without affecting Settings.
     */
    hideLegacyBackupSection();
}


/* =====================================================
   44. CHART RESIZE
   ===================================================== */

function initializeChartResize() {

    let resizeTimer =
        null;


    window.addEventListener(
        "resize",
        () => {

            clearTimeout(
                resizeTimer
            );


            resizeTimer =
                setTimeout(
                    () => {

                        refreshProduction();

                        updateFeedManagement();

                    },
                    150
                );
        }
    );
}


/* =====================================================
   45. HEADER DATE
   ===================================================== */

function updateHeaderDate() {

    const possibleIds = [
        "currentDate",
        "headerDate",
        "todayDate",
        "pmCurrentDate"
    ];


    const date =
        new Date();


    const formatted =
        date.toLocaleDateString(
            undefined,
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    possibleIds.forEach(
        id => {

            const element =
                $(id);


            if (element) {

                element.textContent =
                    formatted;
            }
        }
    );
}


/* =====================================================
   46. MIDNIGHT ROLLOVER
   ===================================================== */

let lastKnownDate =
    getTodayKey();


function checkMidnightRollover() {

    const currentDate =
        getTodayKey();


    if (
        currentDate !==
        lastKnownDate
    ) {

        lastKnownDate =
            currentDate;


        writeStorage(
            APP.storage.alarmTriggered,
            ""
        );


        updateHeaderDate();

        refreshAll();

        scheduleAutomaticBackup();
    }
}


/* =====================================================
   47. SERVICE WORKER
   ===================================================== */

async function initializeServiceWorker() {

    if (
        !("serviceWorker" in navigator)
    ) {

        return null;
    }


    try {

        const swUrl =
            new URL(
                "sw.js",
                window.location.href
            );


        const registration =
            await navigator.serviceWorker.register(
                swUrl.href
            );


        console.log(
            "Poultry Manager service worker registered:",
            registration.scope
        );


        return registration;

    } catch (error) {

        console.warn(
            "Poultry Manager service worker registration failed:",
            error
        );


        return null;
    }
}


/* =====================================================
   48. PWA INSTALL / UPDATE SUPPORT
   ===================================================== */

function initializePWAHints() {

    window.addEventListener(
        "beforeinstallprompt",
        event => {

            window.__pmInstallPrompt =
                event;

            event.preventDefault();
        }
    );


    window.addEventListener(
        "appinstalled",
        () => {

            window.__pmInstallPrompt =
                null;

            console.log(
                "Poultry Manager installed."
            );
        }
    );
}


/* =====================================================
   49. RESTORE LAST VIEW
   ===================================================== */

function restoreLastView() {

    /*
     * Dashboard is deliberately the startup view.
     *
     * The previous implementation could reopen Settings
     * underneath or alongside the Dashboard when the saved
     * lastView value was "settings".
     *
     * Navigation still remembers the selected view while
     * the app is running, but a fresh launch always starts
     * cleanly on Dashboard.
     */

    showDashboard();
}


/* =====================================================
   50. KEYBOARD ACCESSIBILITY
   ===================================================== */

function initializeKeyboardSupport() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {
                return;
            }


            const activeElement =
                document.activeElement;


            if (
                activeElement &&
                typeof activeElement.blur ===
                    "function"
            ) {

                activeElement.blur();
            }
        }
    );
}


/* =====================================================
   51. DATA SAFETY NORMALIZATION
   ===================================================== */

function normalizeStoredData() {

    /*
     * Flock.
     *
     * IMPORTANT:
     * Do not overwrite an existing flock value,
     * including an intentional 0.
     */

    const flock =
        getFlockCount();


    if (
        localStorage.getItem(
            APP.storage.flock
        ) === null
    ) {

        writeStorage(
            APP.storage.flock,
            flock
        );
    }


    /*
     * Feed.
     */

    const feed =
        getFeedAmount();


    if (
        localStorage.getItem(
            APP.storage.feed
        ) === null
    ) {

        writeStorage(
            APP.storage.feed,
            feed
        );
    }


    /*
     * Egg history.
     */

    const eggHistory =
        getRawEggHistory();


    if (
        Object.keys(
            eggHistory
        ).length > 0
    ) {

        const normalized =
            getEggHistory();


        saveEggHistory(
            normalized
        );
    }


    /*
     * Feed usage.
     */

    const feedHistory =
        getFeedUsageHistory();


    saveFeedUsageHistory(
        feedHistory
    );


    /*
     * Feed additions.
     */

    const additionHistory =
        getFeedAdditionHistory();


    saveFeedAdditionHistory(
        additionHistory
    );
}


/* =====================================================
   52. INITIALIZE DEFAULT SCHEDULE
   ===================================================== */

function initializeDefaultSchedule() {

    const schedule =
        getFeedSchedule();


    if (
        !schedule.morning ||
        !schedule.afternoon
    ) {

        saveFeedSchedule(
            APP.defaults.morningFeed,
            APP.defaults.afternoonFeed
        );
    }
}


/* =====================================================
   53. INITIALIZE INPUT VALUES
   ===================================================== */

function initializeInputDefaults() {

    const flockInput =
        $("pmSettingsFlockInput");


    if (flockInput) {

        flockInput.value =
            getFlockCount();
    }


    const schedule =
        getFeedSchedule();


    const morningInput =
        $("pmMorningFeedInput");


    if (morningInput) {

        morningInput.value =
            schedule.morning;
    }


    const afternoonInput =
        $("pmAfternoonFeedInput");


    if (afternoonInput) {

        afternoonInput.value =
            schedule.afternoon;
    }
}


/* =====================================================
   54. GLOBAL PERIODIC REFRESH
   ===================================================== */

function startGlobalRefresh() {

    if (
        window.__pmGlobalRefreshTimer
    ) {

        clearInterval(
            window.__pmGlobalRefreshTimer
        );
    }


    window.__pmGlobalRefreshTimer =
        setInterval(
            () => {

                checkMidnightRollover();

                updateFarmOverview();

                updateNextFeed();

                updateFeedManagement();

                checkFeedAlarm();

            },
            1000
        );
}


/* =====================================================
   55. APPLICATION INITIALIZATION
   ===================================================== */

let applicationInitialized =
    false;


async function initializeApplication() {

    if (
        applicationInitialized
    ) {

        return;
    }


    applicationInitialized =
        true;


    console.log(
        `Poultry Manager ${APP.version} starting...`
    );


    /*
     * Existing data first.
     */

    normalizeStoredData();

    initializeDefaultSchedule();


    /*
     * Build the application shell.
     */

    createNavigation();

    createSettingsView();


    /*
     * Theme.
     */

    initializeTheme();


    /*
     * Core controls.
     */

    initializeEggControls();

    initializeFeedControls();

    ensureFeedActionButtons();

    initializeQuickActions();


    /*
     * Settings.
     */

    initializeInputDefaults();

    refreshSettings();


    /*
     * Other application systems.
     */

    initializeAppShell();

    initializeChartResize();

    initializeKeyboardSupport();

    initializePWAHints();

    updateHeaderDate();


    /*
     * Service worker.
     */

    await initializeServiceWorker();


    /*
     * Initial data refresh.
     */

    refreshAll();


    /*
     * Begin live updates.
     */

    startFarmOverviewRefresh();

    startGlobalRefresh();


    /*
     * Always establish a clean Dashboard startup.
     */

    setSettingsVisibility(
        false
    );

    setDashboardVisibility(
        true
    );


    dashboardButton?.classList.add(
        "active"
    );

    settingsButton?.classList.remove(
        "active"
    );


    /*
     * Do not write "settings" back into lastView
     * during startup.
     */

    writeStorage(
        APP.storage.lastView,
        "dashboard"
    );


    /*
     * Automatic backup.
     */

    if (
        isAutomaticBackupEnabled()
    ) {

        createAutomaticBackup();
    }


    console.log(
        "Poultry Manager initialized successfully."
    );
}


/* =====================================================
   56. STARTUP
   ===================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApplication,
        {
            once: true
        }
    );

} else {

    initializeApplication();
}


/* =====================================================
   57. FINAL PUBLIC API
   ===================================================== */

window.PoultryManager =
    Object.assign(
        window.PoultryManager || {},
        {

            showDashboard,

            showSettings,

            refreshSettings,

            updateFarmOverview,

            refreshAll,

            exportBackup,

            restoreBackupFromFile,

            setTheme,

            getTheme,

            setAutomaticBackupEnabled,

            createAutomaticBackup,

            getNextFeed,

            checkFeedAlarm

        }
    );


/* =====================================================
   END OF POULTRY MANAGER
   ===================================================== */

})();