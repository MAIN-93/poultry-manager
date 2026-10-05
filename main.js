/* =========================================================
   POULTRY MANAGER
   COMPLETE PRODUCTION MANAGEMENT SYSTEM
   =========================================================

   VERSION
   ---------------------------------------------------------
   Poultry Manager — Production Architecture Rebuild

   PURPOSE
   ---------------------------------------------------------
   This file is the central application controller for the
   Poultry Manager web application.

   DESIGN PRINCIPLES
   ---------------------------------------------------------
   1. One source of truth for application data.
   2. Safe localStorage handling.
   3. Existing saved data is preserved.
   4. Dashboard and Settings are separate views.
   5. No duplicated feature systems.
   6. No unnecessary global variables.
   7. Optional DOM elements never crash the application.
   8. Works on mobile and desktop.
   9. Designed for GitHub Pages + Render backend.
   10. Existing Poultry Manager storage keys are preserved.

   ========================================================= */


/* =========================================================
   1. APPLICATION CONFIGURATION
   ========================================================= */

(function () {

    "use strict";

    const APP = {

        name: "Poultry Manager",

        version: "2.0.0",

        storage: {
            flock: "flockCount",
            eggs: "eggHistory",
            feed: "feed",
            feedAdditions: "feedAdditionHistory",
            feedUsage: "feedUsageHistory",
            schedule: "feedSchedule",
            alarm: "feedAlarmEnabled",
            notifications: "poultryManagerNotificationsEnabled",
            theme: "poultryManagerTheme",
            lastView: "poultryManagerLastView",
            automaticBackup: "poultryManagerAutomaticBackup",
            backupData: "poultryManagerAutomaticBackupData",
            lastBackup: "poultryManagerLastBackup"
        },

        backend: {
            base:
                "https://poultry-manager-hppo.onrender.com",

            vapid:
                "/vapid-public-key",

            subscribe:
                "/subscribe",

            schedule:
                "/schedule",

            testPush:
                "/send-test"
        },

        limits: {

            eggHistoryVisible: 3,

            eggMaximumPerDay: 999,

            flockMaximum: 100000,

            feedMaximum: 100000,

            feedMinimum: 0,

            feedDecimals: 1,

            usageDecimals: 1,

            backupDebounce: 1500,

            chartDays: 7

        },

        defaults: {

            flock: 0,

            feed: 0,

            morningFeed: "07:00",

            afternoonFeed: "14:00",

            theme: "light",

            view: "dashboard",

            alarm: false,

            automaticBackup: true

        }

    };


    /* =====================================================
       2. SMALL UTILITY FUNCTIONS
       ===================================================== */

    function $(id) {
        return document.getElementById(id);
    }


    function $all(selector) {
        return Array.from(
            document.querySelectorAll(selector)
        );
    }


    function exists(element) {
        return !!element;
    }


    function clampNumber(value, minimum, maximum) {

        const number = Number(value);

        if (!Number.isFinite(number)) {
            return minimum;
        }

        return Math.min(
            maximum,
            Math.max(minimum, number)
        );
    }


    function roundNumber(value, decimals = 1) {

        const factor = Math.pow(10, decimals);

        return Math.round(
            (Number(value) || 0) * factor
        ) / factor;
    }


    function safeNumber(value, fallback = 0) {

        const number = Number(value);

        return Number.isFinite(number)
            ? number
            : fallback;
    }


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function sleep(milliseconds) {

        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });

    }


    function formatKg(value) {

        return `${roundNumber(value, 1).toFixed(1)} kg`;

    }


    function formatEggs(value) {

        const eggs = Math.max(
            0,
            Math.round(safeNumber(value))
        );

        return `${eggs} egg${eggs === 1 ? "" : "s"}`;

    }


    function percentage(value) {

        const number = clampNumber(
            value,
            0,
            100
        );

        return `${Math.round(number)}%`;

    }


    function notify(message) {

        if (!message) return;

        /*
         * Keep feedback lightweight.
         *
         * If a future toast system is added to the HTML,
         * this function can use it automatically.
         */

        let toast =
            document.getElementById(
                "pmToast"
            );

        if (!toast) {

            toast =
                document.createElement(
                    "div"
                );

            toast.id = "pmToast";

            toast.className =
                "pm-toast";

            document.body.appendChild(
                toast
            );

        }

        toast.textContent =
            message;

        toast.classList.add(
            "show"
        );

        clearTimeout(
            toast.__hideTimer
        );

        toast.__hideTimer =
            setTimeout(() => {

                toast.classList.remove(
                    "show"
                );

            }, 2600);

    }


    function confirmAction(message) {

        try {

            return window.confirm(
                message
            );

        } catch {

            return false;

        }

    }


    function scrollToElement(
        element,
        offset = 80
    ) {

        if (!element) return;

        const rect =
            element.getBoundingClientRect();

        const position =
            window.scrollY +
            rect.top -
            offset;

        window.scrollTo({

            top: Math.max(
                0,
                position
            ),

            behavior: "smooth"

        });

    }


    /* =====================================================
       3. DATE SYSTEM
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

        return `${year}-${month}-${day}`;

    }


    function getDateKeyFromDate(date) {

        if (!(date instanceof Date)) {
            date = new Date(date);
        }

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "";
        }

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

        return `${year}-${month}-${day}`;

    }


    function parseDateKey(key) {

        if (
            typeof key !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(key)
        ) {
            return null;
        }

        const parts =
            key.split("-")
                .map(Number);

        const date =
            new Date(
                parts[0],
                parts[1] - 1,
                parts[2]
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return null;
        }

        return date;

    }


    function formatDate(
        key,
        options = {}
    ) {

        const date =
            parseDateKey(key);

        if (!date) {
            return key || "";
        }

        return date.toLocaleDateString(
            undefined,
            {
                month:
                    options.month ||
                    "short",

                day:
                    options.day ||
                    "numeric",

                year:
                    options.year ||
                    undefined
            }
        );

    }


    function formatFullDate(key) {

        const date =
            parseDateKey(key);

        if (!date) {
            return key || "";
        }

        return date.toLocaleDateString(
            undefined,
            {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );

    }


    function getLastNDates(
        count
    ) {

        const dates = [];

        const now =
            new Date();

        for (
            let index = count - 1;
            index >= 0;
            index--
        ) {

            const date =
                new Date(now);

            date.setDate(
                now.getDate() - index
            );

            dates.push(
                getDateKeyFromDate(
                    date
                )
            );

        }

        return dates;

    }


    function isToday(key) {

        return key ===
            getTodayKey();

    }


    function getDayDifference(
        olderKey,
        newerKey
    ) {

        const older =
            parseDateKey(
                olderKey
            );

        const newer =
            parseDateKey(
                newerKey
            );

        if (!older || !newer) {
            return 0;
        }

        return Math.round(
            (
                newer.getTime() -
                older.getTime()
            ) /
            86400000
        );

    }


    /* =====================================================
       4. SAFE LOCAL STORAGE
       ===================================================== */

    function readStorage(
        key,
        fallback = null
    ) {

        try {

            const value =
                localStorage.getItem(
                    key
                );

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
                value
            );

            scheduleAutomaticBackup();

            return true;

        } catch (error) {

            console.error(
                "Poultry Manager storage write error:",
                error
            );

            return false;

        }

    }


    function removeStorage(key) {

        try {

            localStorage.removeItem(
                key
            );

            scheduleAutomaticBackup();

            return true;

        } catch (error) {

            console.error(
                "Poultry Manager storage remove error:",
                error
            );

            return false;

        }

    }


    function readJSON(
        key,
        fallback
    ) {

        const raw =
            readStorage(
                key,
                null
            );

        if (raw === null) {
            return fallback;
        }

        try {

            return JSON.parse(
                raw
            );

        } catch (error) {

            console.warn(
                `Invalid JSON in ${key}. Using fallback.`,
                error
            );

            return fallback;

        }

    }


    function writeJSON(
        key,
        value
    ) {

        try {

            return writeStorage(
                key,
                JSON.stringify(
                    value
                )
            );

        } catch (error) {

            console.error(
                "JSON storage error:",
                error
            );

            return false;

        }

    }


    /* =====================================================
       5. FLOCK DATA
       ===================================================== */

    function getFlockCount() {

        return clampNumber(
            readStorage(
                APP.storage.flock,
                APP.defaults.flock
            ),
            0,
            APP.limits.flockMaximum
        );

    }


    function saveFlockCount(
        value
    ) {

        const flock =
            Math.round(
                clampNumber(
                    value,
                    0,
                    APP.limits.flockMaximum
                )
            );

        writeStorage(
            APP.storage.flock,
            String(flock)
        );

        return flock;

    }


    /* =====================================================
       6. EGG HISTORY NORMALIZATION
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


    /*
     * Older versions of Poultry Manager could store:
     *
     * "2026-10-03": 2
     *
     * Newer versions can store:
     *
     * "2026-10-03": {
     *     eggs: 2,
     *     flock: 5
     * }
     *
     * Both are supported.
     */

    function normalizeEggRecord(
        value
    ) {

        if (
            typeof value ===
            "number"
        ) {

            return {

                eggs: Math.max(
                    0,
                    Math.round(value)
                ),

                flock:
                    getFlockCount()

            };

        }


        if (
            value &&
            typeof value ===
            "object"
        ) {

            return {

                eggs: Math.max(
                    0,
                    Math.round(
                        safeNumber(
                            value.eggs
                        )
                    )
                ),

                flock: Math.max(
                    0,
                    Math.round(
                        safeNumber(
                            value.flock,
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

        const normalized =
            {};

        Object.keys(raw)
            .forEach(key => {

                normalized[key] =
                    normalizeEggRecord(
                        raw[key]
                    );

            });

        return normalized;

    }


    function saveEggHistory(
        history
    ) {

        const clean =
            {};

        if (
            history &&
            typeof history ===
            "object"
        ) {

            Object.keys(history)
                .forEach(key => {

                    if (
                        !/^\d{4}-\d{2}-\d{2}$/
                            .test(key)
                    ) {
                        return;
                    }

                    clean[key] =
                        normalizeEggRecord(
                            history[key]
                        );

                });

        }

        writeJSON(
            APP.storage.eggs,
            clean
        );

        return clean;

    }


    function getEggRecord(
        dateKey
    ) {

        const history =
            getEggHistory();

        return normalizeEggRecord(
            history[dateKey]
        );

    }


    function getEggCountForDate(
        dateKey
    ) {

        return getEggRecord(
            dateKey
        ).eggs;

    }


    function getTodayEggs() {

        return getEggCountForDate(
            getTodayKey()
        );

    }


    function saveTodayEggs(
        eggs
    ) {

        const today =
            getTodayKey();

        const history =
            getEggHistory();

        history[today] = {

            eggs: Math.max(
                0,
                Math.min(
                    APP.limits.eggMaximumPerDay,
                    Math.round(
                        safeNumber(eggs)
                    )
                )
            ),

            flock:
                getFlockCount()

        };

        saveEggHistory(
            history
        );

        return history[today].eggs;

    }


    function addEggs(
        amount = 1
    ) {

        const quantity =
            Math.max(
                1,
                Math.round(
                    safeNumber(
                        amount,
                        1
                    )
                )
            );

        const current =
            getTodayEggs();

        const next =
            Math.min(
                APP.limits.eggMaximumPerDay,
                current + quantity
            );

        saveTodayEggs(
            next
        );

        refreshProduction();

        notify(
            `${quantity} egg${quantity === 1 ? "" : "s"} added.`
        );

        return next;

    }


    function removeEggs(
        amount = 1
    ) {

        const quantity =
            Math.max(
                1,
                Math.round(
                    safeNumber(
                        amount,
                        1
                    )
                )
            );

        const current =
            getTodayEggs();

        if (current <= 0) {

            notify(
                "There are no eggs recorded for today."
            );

            return 0;

        }

        const next =
            Math.max(
                0,
                current - quantity
            );

        saveTodayEggs(
            next
        );

        refreshProduction();

        notify(
            `${quantity} egg${quantity === 1 ? "" : "s"} removed.`
        );

        return next;

    }


    /* =====================================================
       7. LAYING RATE
       ===================================================== */

    function getLayingRateForDate(
        dateKey
    ) {

        const flock =
            getEggRecord(
                dateKey
            ).flock ||
            getFlockCount();

        const eggs =
            getEggCountForDate(
                dateKey
            );

        if (flock <= 0) {
            return 0;
        }

        return clampNumber(
            (eggs / flock) * 100,
            0,
            100
        );

    }


    function getTodayLayingRate() {

        return getLayingRateForDate(
            getTodayKey()
        );

    }


    /* =====================================================
       8. PRODUCTION SUMMARY
       ===================================================== */

    function getProductionStats(
        days = 7
    ) {

        const dates =
            getLastNDates(
                days
            );

        const records =
            dates.map(
                date => {

                    const eggs =
                        getEggCountForDate(
                            date
                        );

                    const flock =
                        getEggRecord(
                            date
                        ).flock ||
                        getFlockCount();

                    const rate =
                        flock > 0
                            ? (
                                eggs /
                                flock
                            ) * 100
                            : 0;

                    return {

                        date,

                        eggs,

                        flock,

                        rate:
                            clampNumber(
                                rate,
                                0,
                                100
                            )

                    };

                }
            );


        const totalEggs =
            records.reduce(
                (sum, item) =>
                    sum + item.eggs,
                0
            );


        const averageRate =
            records.length > 0
                ? records.reduce(
                    (sum, item) =>
                        sum + item.rate,
                    0
                ) / records.length
                : 0;


        const best =
            records.reduce(
                (current, item) =>
                    item.eggs >
                    current.eggs
                        ? item
                        : current,
                records[0] || {
                    eggs: 0,
                    date: getTodayKey()
                }
            );


        const lowest =
            records.reduce(
                (current, item) =>
                    item.eggs <
                    current.eggs
                        ? item
                        : current,
                records[0] || {
                    eggs: 0,
                    date: getTodayKey()
                }
            );


        const eggsPerHen =
            records.length > 0
                ? totalEggs /
                    records.length /
                    Math.max(
                        1,
                        getFlockCount()
                    )
                : 0;


        return {

            dates,

            records,

            totalEggs,

            averageRate,

            best,

            lowest,

            eggsPerHen

        };

    }


    /* =====================================================
       9. PRODUCTION INSIGHT ENGINE
       ===================================================== */

    function getProductionInsight() {

        const stats =
            getProductionStats(
                APP.limits.chartDays
            );

        const today =
            stats.records[
                stats.records.length - 1
            ] || {
                eggs: 0,
                rate: 0
            };


        const previous =
            stats.records[
                stats.records.length - 2
            ] || {
                eggs: 0,
                rate: 0
            };


        const difference =
            today.eggs -
            previous.eggs;


        if (
            getFlockCount() <= 0
        ) {

            return {

                text:
                    "Add your flock size in Settings to unlock production insights.",

                type:
                    "neutral"

            };

        }


        if (
            today.eggs === 0
        ) {

            return {

                text:
                    "No eggs have been recorded today yet. Keep monitoring the flock.",

                type:
                    "neutral"

            };

        }


        if (
            today.rate >= 90
        ) {

            return {

                text:
                    "Excellent production today. Your flock is performing at a very strong laying rate.",

                type:
                    "positive"

            };

        }


        if (
            today.rate >= 70
        ) {

            return {

                text:
                    "Good production today. Keep feed, water, lighting and flock conditions consistent.",

                type:
                    "positive"

            };

        }


        if (
            difference > 0
        ) {

            return {

                text:
                    "Production is improving compared with the previous day.",

                type:
                    "positive"

            };

        }


        if (
            difference < 0
        ) {

            return {

                text:
                    "Production is lower than the previous day. Check feed intake, water and flock conditions.",

                type:
                    "warning"

            };

        }


        return {

            text:
                "Production is currently stable. Continue monitoring the flock daily.",

            type:
                "neutral"

        };

    }


    /* =====================================================
       10. FEED STOCK
       ===================================================== */

    function getFeedAmount() {

        return roundNumber(
            clampNumber(
                readStorage(
                    APP.storage.feed,
                    APP.defaults.feed
                ),
                APP.limits.feedMinimum,
                APP.limits.feedMaximum
            ),
            APP.limits.feedDecimals
        );

    }


    function saveFeedAmount(
        amount
    ) {

        const feed =
            roundNumber(
                clampNumber(
                    amount,
                    APP.limits.feedMinimum,
                    APP.limits.feedMaximum
                ),
                APP.limits.feedDecimals
            );

        writeStorage(
            APP.storage.feed,
            String(feed)
        );

        return feed;

    }


    /* =====================================================
       11. FEED ADDITION HISTORY
       ===================================================== */

    function getFeedAdditionHistory() {

        const history =
            readJSON(
                APP.storage.feedAdditions,
                []
            );

        if (
            !Array.isArray(history)
        ) {
            return [];
        }

        return history
            .filter(item =>
                item &&
                typeof item ===
                "object"
            )
            .map(item => ({

                id:
                    String(
                        item.id ||
                        `${Date.now()}-${Math.random()}`
                    ),

                amount:
                    roundNumber(
                        Math.max(
                            0,
                            safeNumber(
                                item.amount
                            )
                        ),
                        1
                    ),

                date:
                    item.date ||
                    getTodayKey(),

                timestamp:
                    safeNumber(
                        item.timestamp,
                        Date.now()
                    ),

                stockAfter:
                    roundNumber(
                        Math.max(
                            0,
                            safeNumber(
                                item.stockAfter
                            )
                        ),
                        1
                    )

            }))
            .sort(
                (a, b) =>
                    b.timestamp -
                    a.timestamp
            );

    }


    function saveFeedAdditionHistory(
        history
    ) {

        const clean =
            Array.isArray(history)
                ? history.slice(0, 100)
                : [];

        writeJSON(
            APP.storage.feedAdditions,
            clean
        );

        return clean;

    }


    function getLastFeedAddition() {

        const history =
            getFeedAdditionHistory();

        return history[0] || null;

    }


    function recordFeedAddition(
        amount,
        stockAfter
    ) {

        const history =
            getFeedAdditionHistory();

        history.unshift({

            id:
                `${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`,

            amount:
                roundNumber(
                    amount,
                    1
                ),

            date:
                getTodayKey(),

            timestamp:
                Date.now(),

            stockAfter:
                roundNumber(
                    stockAfter,
                    1
                )

        });

        saveFeedAdditionHistory(
            history
        );

    }


    function clearFeedAdditionHistory() {

        removeStorage(
            APP.storage.feedAdditions
        );

    }


    /* =====================================================
       12. FEED USAGE HISTORY
       ===================================================== */

    function getFeedUsageHistory() {

        const history =
            readJSON(
                APP.storage.feedUsage,
                {}
            );

        if (
            !history ||
            typeof history !==
            "object" ||
            Array.isArray(history)
        ) {

            return {};

        }

        const clean =
            {};

        Object.keys(history)
            .forEach(key => {

                clean[key] =
                    roundNumber(
                        Math.max(
                            0,
                            safeNumber(
                                history[key]
                            )
                        ),
                        1
                    );

            });

        return clean;

    }


    function saveFeedUsageHistory(
        history
    ) {

        writeJSON(
            APP.storage.feedUsage,
            history || {}
        );

    }


    function getFeedUsageForDate(
        dateKey
    ) {

        const history =
            getFeedUsageHistory();

        return roundNumber(
            history[dateKey] || 0,
            1
        );

    }


    function saveFeedUsageForDate(
        dateKey,
        amount
    ) {

        const history =
            getFeedUsageHistory();

        const value =
            roundNumber(
                Math.max(
                    0,
                    safeNumber(
                        amount
                    )
                ),
                1
            );

        if (value <= 0) {

            delete history[
                dateKey
            ];

        } else {

            history[
                dateKey
            ] = value;

        }

        saveFeedUsageHistory(
            history
        );

        return value;

    }


    function getTodayFeedUsage() {

        return getFeedUsageForDate(
            getTodayKey()
        );

    }


    function resetTodayFeedUsage() {

        const today =
            getTodayKey();

        const usage =
            getTodayFeedUsage();

        if (usage <= 0) {

            notify(
                "Today's feed usage is already 0.0 kg."
            );

            return;

        }


        const confirmed =
            confirmAction(
                `Reset today's feed usage?\n\nCurrent usage: ${usage.toFixed(
                    1
                )} kg\n\nThis will return the recorded amount to your current feed stock.`
            );


        if (!confirmed) {
            return;
        }


        saveFeedUsageForDate(
            today,
            0
        );


        saveFeedAmount(
            getFeedAmount() +
            usage
        );


        clearFeedAdditionHistory();

        refreshFeed();

        notify(
            "Today's feed usage has been reset."
        );

    }


    /* =====================================================
       13. ADD FEED
       ===================================================== */

    function addFeed(
        amount
    ) {

        const quantity =
            roundNumber(
                Math.max(
                    0,
                    safeNumber(
                        amount
                    )
                ),
                1
            );


        if (
            quantity <= 0
        ) {

            notify(
                "Enter a feed amount greater than 0."
            );

            return;

        }


        const current =
            getFeedAmount();


        const next =
            roundNumber(
                current +
                quantity,
                1
            );


        saveFeedAmount(
            next
        );


        recordFeedAddition(
            quantity,
            next
        );


        refreshFeed();


        notify(
            `${quantity.toFixed(
                1
            )} kg of feed added.`
        );

    }


    /* =====================================================
       14. UNDO LAST FEED ADDITION
       ===================================================== */

    function undoLastFeedAddition() {

        const last =
            getLastFeedAddition();


        if (!last) {

            notify(
                "There is no feed addition to undo."
            );

            return;

        }


        const current =
            getFeedAmount();


        /*
         * Only undo the addition if the stock still matches
         * the stock level recorded immediately after it.
         *
         * This prevents an old addition from being undone
         * after feed has already been used or another addition
         * has occurred.
         */

        const expected =
            roundNumber(
                last.stockAfter,
                1
            );


        if (
            Math.abs(
                current -
                expected
            ) > 0.01
        ) {

            notify(
                "The last feed addition can no longer be undone because the stock has changed."
            );

            return;

        }


        const confirmed =
            confirmAction(
                `Undo the last feed addition?\n\nAdded: ${last.amount.toFixed(
                    1
                )} kg\nCurrent stock: ${current.toFixed(
                    1
                )} kg`
            );


        if (!confirmed) {
            return;
        }


        const next =
            roundNumber(
                Math.max(
                    0,
                    current -
                    last.amount
                ),
                1
            );


        saveFeedAmount(
            next
        );


        const history =
            getFeedAdditionHistory()
                .filter(
                    item =>
                        item.id !==
                        last.id
                );


        saveFeedAdditionHistory(
            history
        );


        refreshFeed();


        notify(
            "Last feed addition was undone."
        );

    }


    /* =====================================================
       15. RESET ENTIRE FEED STOCK
       ===================================================== */

    function resetFeedStock() {

        const current =
            getFeedAmount();


        if (
            current <= 0
        ) {

            notify(
                "Feed stock is already 0.0 kg."
            );

            return;

        }


        const confirmed =
            confirmAction(
                `Reset your entire feed stock?\n\nCurrent stock: ${current.toFixed(
                    1
                )} kg\n\nThis will set your current feed inventory to 0.0 kg.\n\nYour feed usage history and analytics will remain intact.`
            );


        if (!confirmed) {
            return;
        }


        saveFeedAmount(
            0
        );


        /*
         * Old additions must not remain undoable after a full
         * stock reset.
         */

        clearFeedAdditionHistory();


        const input =
            $("feedInput");

        if (input) {
            input.value = "";
        }


        refreshFeed();


        notify(
            "Feed stock has been reset to 0.0 kg."
        );

    }


    /* =====================================================
       16. RECORD FEED USAGE
       ===================================================== */

    function recordFeedUsage(
        amount
    ) {

        const quantity =
            roundNumber(
                Math.max(
                    0,
                    safeNumber(
                        amount
                    )
                ),
                1
            );


        if (
            quantity <= 0
        ) {

            notify(
                "Enter a feed usage amount greater than 0."
            );

            return;

        }


        const currentStock =
            getFeedAmount();


        if (
            currentStock <= 0
        ) {

            notify(
                "There is no feed available in stock."
            );

            return;

        }


        if (
            quantity >
            currentStock
        ) {

            notify(
                `Only ${currentStock.toFixed(
                    1
                )} kg is currently available.`
            );

            return;

        }


        const nextStock =
            roundNumber(
                currentStock -
                quantity,
                1
            );


        saveFeedAmount(
            nextStock
        );


        const today =
            getTodayKey();


        const currentUsage =
            getFeedUsageForDate(
                today
            );


        saveFeedUsageForDate(
            today,
            currentUsage +
            quantity
        );


        clearFeedAdditionHistory();


        const input =
            $("useFeedInput");

        if (input) {
            input.value = "";
        }


        refreshFeed();


        notify(
            `${quantity.toFixed(
                1
            )} kg feed usage recorded.`
        );

    }


    /* =====================================================
       17. FEED ANALYTICS
       ===================================================== */

    function getFeedStats(
        days = 7
    ) {

        const dates =
            getLastNDates(
                days
            );


        const usageHistory =
            getFeedUsageHistory();


        const records =
            dates.map(
                date => ({

                    date,

                    usage:
                        roundNumber(
                            usageHistory[
                                date
                            ] || 0,
                            1
                        )

                })
            );


        const totalUsage =
            records.reduce(
                (sum, record) =>
                    sum +
                    record.usage,
                0
            );


        const averageUsage =
            records.length
                ? totalUsage /
                    records.length
                : 0;


        const flock =
            getFlockCount();


        const feedPerBird =
            flock > 0
                ? averageUsage /
                    flock
                : 0;


        const usageDays =
            records.filter(
                record =>
                    record.usage > 0
            ).length;


        return {

            dates,

            records,

            totalUsage:
                roundNumber(
                    totalUsage,
                    1
                ),

            averageUsage:
                roundNumber(
                    averageUsage,
                    1
                ),

            feedPerBird:
                roundNumber(
                    feedPerBird,
                    3
                ),

            usageDays

        };

    }


    /* =====================================================
       18. FEED STOCK STATUS
       ===================================================== */

    function getFeedStatus() {

        const stock =
            getFeedAmount();


        const stats =
            getFeedStats(
                7
            );


        const average =
            stats.averageUsage;


        let daysRemaining =
            0;


        if (
            average > 0
        ) {

            daysRemaining =
                stock /
                average;

        }


        let status =
            "healthy";


        if (
            stock <= 0
        ) {

            status =
                "empty";

        } else if (
            daysRemaining <= 2
        ) {

            status =
                "critical";

        } else if (
            daysRemaining <= 5
        ) {

            status =
                "warning";

        }


        return {

            stock,

            average,

            daysRemaining:

                Number.isFinite(
                    daysRemaining
                )
                    ? daysRemaining
                    : 0,

            status

        };

    }


    /* =====================================================
       19. FEED SCHEDULE
       ===================================================== */

    function getFeedSchedule() {

        const saved =
            readJSON(
                APP.storage.schedule,
                null
            );


        if (
            saved &&
            typeof saved ===
            "object"
        ) {

            return {

                morning:
                    typeof saved.morning ===
                    "string"
                        ? saved.morning
                        : APP.defaults
                            .morningFeed,

                afternoon:
                    typeof saved.afternoon ===
                    "string"
                        ? saved.afternoon
                        : APP.defaults
                            .afternoonFeed

            };

        }


        return {

            morning:
                APP.defaults
                    .morningFeed,

            afternoon:
                APP.defaults
                    .afternoonFeed

        };

    }


    function isValidTime(
        value
    ) {

        return (
            typeof value ===
            "string" &&
            /^\d{2}:\d{2}$/.test(
                value
            )
        );

    }


    function saveFeedSchedule(
        morning,
        afternoon,
        sync = true
    ) {

        const schedule = {

            morning:
                isValidTime(
                    morning
                )
                    ? morning
                    : APP.defaults
                        .morningFeed,

            afternoon:
                isValidTime(
                    afternoon
                )
                    ? afternoon
                    : APP.defaults
                        .afternoonFeed

        };


        writeJSON(
            APP.storage.schedule,
            schedule
        );


        updateNextFeed();


        if (sync) {

            syncScheduleToServer(
                schedule
            );

        }


        return schedule;

    }


    async function syncScheduleToServer(
        schedule
    ) {

        try {

            const response =
                await fetch(
                    APP.backend.base +
                    APP.backend.schedule,
                    {

                        method:
                            "POST",

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


            if (!response.ok) {

                throw new Error(
                    `Schedule sync failed: ${response.status}`
                );

            }


            console.log(
                "Poultry Manager: schedule synced."
            );


        } catch (error) {

            /*
             * Schedule still remains locally saved.
             * Render may simply be sleeping on the free plan.
             */

            console.warn(
                "Poultry Manager: schedule sync unavailable.",
                error
            );

        }

    }


    /* =====================================================
       20. NEXT FEED CALCULATION
       ===================================================== */

    function getMinutesFromTime(
        time
    ) {

        if (
            !isValidTime(
                time
            )
        ) {

            return null;

        }


        const [
            hours,
            minutes
        ] =
            time
                .split(":")
                .map(Number);


        return (
            hours * 60 +
            minutes
        );

    }


    function getNextFeedInfo() {

        const schedule =
            getFeedSchedule();


        const now =
            new Date();


        const currentMinutes =
            now.getHours() * 60 +
            now.getMinutes();


        const morningMinutes =
            getMinutesFromTime(
                schedule.morning
            );


        const afternoonMinutes =
            getMinutesFromTime(
                schedule.afternoon
            );


        const options = [];


        if (
            morningMinutes !== null &&
            morningMinutes >
            currentMinutes
        ) {

            options.push({

                type:
                    "morning",

                time:
                    schedule.morning,

                minutes:
                    morningMinutes

            });

        }


        if (
            afternoonMinutes !== null &&
            afternoonMinutes >
            currentMinutes
        ) {

            options.push({

                type:
                    "afternoon",

                time:
                    schedule.afternoon,

                minutes:
                    afternoonMinutes

            });

        }


        if (
            options.length === 0
        ) {

            if (
                morningMinutes !==
                null
            ) {

                options.push({

                    type:
                        "morning",

                    time:
                        schedule.morning,

                    minutes:
                        morningMinutes +
                        1440

                });

            }


            if (
                afternoonMinutes !==
                null
            ) {

                options.push({

                    type:
                        "afternoon",

                    time:
                        schedule.afternoon,

                    minutes:
                        afternoonMinutes +
                        1440

                });

            }

        }


        options.sort(
            (a, b) =>
                a.minutes -
                b.minutes
        );


        const next =
            options[0];


        if (!next) {

            return null;

        }


        let difference =
            next.minutes -
            currentMinutes;


        if (
            difference < 0
        ) {

            difference +=
                1440;

        }


        return {

            ...next,

            minutesUntil:
                difference

        };

    }


    function formatCountdown(
        minutes
    ) {

        const safe =
            Math.max(
                0,
                Math.round(
                    safeNumber(
                        minutes
                    )
                )
            );


        if (
            safe < 60
        ) {

            return `${safe} min`;

        }


        const hours =
            Math.floor(
                safe / 60
            );


        const remaining =
            safe % 60;


        if (
            remaining === 0
        ) {

            return `${hours} hr`;

        }


        return `${hours} hr ${remaining} min`;

    }


    /* =====================================================
       21. FEED ALARM
       ===================================================== */

    function isFeedAlarmEnabled() {

        return (
            readStorage(
                APP.storage.alarm,
                APP.defaults.alarm
            ) === "true"
        );

    }


    function setFeedAlarmEnabled(
        enabled
    ) {

        writeStorage(
            APP.storage.alarm,
            enabled
                ? "true"
                : "false"
        );

        updateAlarmUI();

    }


    function updateAlarmUI() {

        const enabled =
            isFeedAlarmEnabled();


        const alarmButton =
            $("feedAlarmButton");


        if (alarmButton) {

            alarmButton.textContent =
                enabled
                    ? "Disable Feed Alarm"
                    : "Enable Feed Alarm";

        }


        const settingsToggle =
            $("pmAlarmToggle");


        if (settingsToggle) {

            settingsToggle.checked =
                enabled;

        }

    }


    let lastAlarmMinute = null;


    function checkFeedAlarm() {

        if (
            !isFeedAlarmEnabled()
        ) {

            return;

        }


        const now =
            new Date();


        const currentTime =
            `${String(
                now.getHours()
            ).padStart(2, "0")}:${String(
                now.getMinutes()
            ).padStart(2, "0")}`;


        const schedule =
            getFeedSchedule();


        if (
            currentTime !==
            schedule.morning &&
            currentTime !==
            schedule.afternoon
        ) {

            return;

        }


        const alarmKey =
            `${getTodayKey()}-${currentTime}`;


        if (
            lastAlarmMinute ===
            alarmKey
        ) {

            return;

        }


        lastAlarmMinute =
            alarmKey;


        showFeedAlarmMessage();


        sendFeedNotification(
            "🐔 Feeding Time",
            "It is time to feed your flock."
        );

    }


    function showFeedAlarmMessage() {

        notify(
            "🐔⏰ It’s feeding time!"
        );

        const button =
            $("feedAlarmButton");


        if (button) {

            button.classList.add(
                "pm-alarm-active"
            );


            setTimeout(
                () => {

                    button.classList.remove(
                        "pm-alarm-active"
                    );

                },
                5000
            );

        }

    }


    /* =====================================================
       22. PUSH NOTIFICATIONS
       ===================================================== */

    function urlBase64ToUint8Array(
        base64String
    ) {

        const padding =
            "=".repeat(
                (
                    4 -
                    (
                        base64String.length %
                        4
                    )
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
            let index = 0;
            index < rawData.length;
            ++index
        ) {

            outputArray[index] =
                rawData.charCodeAt(
                    index
                );

        }


        return outputArray;

    }


    async function registerServiceWorker() {

        if (
            !("serviceWorker" in
                navigator)
        ) {

            console.warn(
                "Service workers are not supported."
            );

            return null;

        }


        try {

            /*
             * Relative registration is important because the
             * app may live at:
             *
             * /poultry-manager/
             *
             * rather than at the domain root.
             */

            const swURL =
                new URL(
                    "sw.js",
                    window.location.href
                );


            const registration =
                await navigator.serviceWorker
                    .register(
                        swURL.href
                    );


            console.log(
                "Poultry Manager service worker registered:",
                registration.scope
            );


            return registration;

        } catch (error) {

            console.error(
                "Service worker registration failed:",
                error
            );

            return null;

        }

    }


    async function getVapidPublicKey() {

        const response =
            await fetch(
                APP.backend.base +
                APP.backend.vapid
            );


        if (!response.ok) {

            throw new Error(
                "Unable to retrieve notification key."
            );

        }


        const data =
            await response.json();


        return (
            data.publicKey ||
            data.key ||
            data.vapidPublicKey
        );

    }


    async function enablePushNotifications() {

        if (
            !("Notification" in
                window)
        ) {

            notify(
                "This browser does not support notifications."
            );

            return false;

        }


        if (
            !("serviceWorker" in
                navigator)
        ) {

            notify(
                "This browser does not support service workers."
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
                    "Notification permission was not granted."
                );

                return false;

            }


            const registration =
                await registerServiceWorker();


            if (!registration) {

                return false;

            }


            const vapidKey =
                await getVapidPublicKey();


            if (!vapidKey) {

                throw new Error(
                    "VAPID public key was not returned."
                );

            }


            let subscription =
                await registration.pushManager
                    .getSubscription();


            if (!subscription) {

                subscription =
                    await registration.pushManager
                        .subscribe({

                            userVisibleOnly:
                                true,

                            applicationServerKey:
                                urlBase64ToUint8Array(
                                    vapidKey
                                )

                        });

            }


            const response =
                await fetch(
                    APP.backend.base +
                    APP.backend.subscribe,
                    {

                        method:
                            "POST",

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


            if (!response.ok) {

                throw new Error(
                    `Subscription failed: ${response.status}`
                );

            }


            writeStorage(
                APP.storage.notifications,
                "true"
            );


            updateNotificationUI();


            notify(
                "Push notifications are enabled."
            );


            return true;

        } catch (error) {

            console.error(
                "Push notification setup failed:",
                error
            );


            notify(
                "Notification setup could not be completed."
            );


            return false;

        }

    }


    function sendFeedNotification(
        title,
        body
    ) {

        /*
         * The server handles scheduled push delivery.
         *
         * This local function intentionally does not try to
         * manufacture browser notifications without permission.
         */

        if (
            !("Notification" in
                window)
        ) {

            return;

        }


        if (
            Notification.permission !==
            "granted"
        ) {

            return;

        }


        /*
         * If the page is currently open, provide immediate
         * feedback locally as well.
         */

        try {

            new Notification(
                title,
                {
                    body
                }
            );

        } catch (error) {

            console.warn(
                "Local notification unavailable:",
                error
            );

        }

    }


    function updateNotificationUI() {

        const toggle =
            $("pmNotificationsToggle");


        if (!toggle) {
            return;
        }


        toggle.checked =
            readStorage(
                APP.storage.notifications,
                "false"
            ) === "true";

    }


    /* =====================================================
       23. DASHBOARD DOM REFERENCES
       ===================================================== */

    function getDashboardElements() {

        return {

            farmFlock:
                $("farmOverviewFlock"),

            farmEggs:
                $("farmOverviewEggs"),

            farmRate:
                $("farmOverviewLayingRate"),

            farmFeed:
                $("farmOverviewFeed"),

            farmNextFeed:
                $("farmOverviewNextFeed"),


            eggCount:
                $("eggCount"),

            layingRate:
                $("layingRate"),

            eggHistory:
                $("eggHistoryList"),


            sevenDayEggs:
                $("sevenDayEggs"),

            averageLayingRate:
                $("averageLayingRate"),

            bestProductionDay:
                $("bestProductionDay"),

            bestProductionEggs:
                $("bestProductionEggs"),


            trendMaxLabel:
                $("trendMaxLabel"),

            trendMidLabel:
                $("trendMidLabel"),

            trendChart:
                $("productionTrendChart"),


            analyticsEggsPerHen:
                $("analyticsEggsPerHen"),

            analyticsAverage:
                $("analyticsAverage"),

            analyticsHighestDay:
                $("analyticsHighestDay"),

            analyticsHighestDayDate:
                $("analyticsHighestDayDate"),

            analyticsLowestDay:
                $("analyticsLowestDay"),

            analyticsLowestDayDate:
                $("analyticsLowestDayDate"),

            analyticsConsistency:
                $("analyticsConsistency"),

            analyticsChange:
                $("analyticsChange"),

            analyticsInsight:
                $("analyticsInsight"),


            feedAmount:
                $("feedAmount"),

            feedUsedToday:
                $("feedUsedToday"),

            feedDailyAverage:
                $("feedDailyAverage"),

            feedDaysRemaining:
                $("feedDaysRemaining"),

            feedDaysRemainingText:
                $("feedDaysRemainingText"),

            feedSevenDayUsage:
                $("feedSevenDayUsage"),

            feedUsageDays:
                $("feedUsageDays"),

            feedPerBird:
                $("feedPerBird"),

            feedChart:
                $("feedConsumptionChart"),

            feedHistory:
                $("feedHistoryList"),


            feedInput:
                $("feedInput"),

            useFeedInput:
                $("useFeedInput"),

            addFeedButton:
                $("addFeedButton"),

            useFeedButton:
                $("useFeedButton"),

            resetFeedTodayButton:
                $("resetFeedTodayButton"),

            viewFeedHistoryButton:
                $("viewFeedHistoryButton"),


            addEggButton:
                $("addEggButton"),

            removeEggButton:
                $("removeEggButton"),

            viewHistoryButton:
                $("viewHistoryButton"),


            feedAlarmButton:
                $("feedAlarmButton")

        };

    }


    /* =====================================================
       24. FARM OVERVIEW
       ===================================================== */

    function updateFarmOverview() {

        const elements =
            getDashboardElements();


        const flock =
            getFlockCount();


        const eggs =
            getTodayEggs();


        const rate =
            getTodayLayingRate();


        const feed =
            getFeedAmount();


        const next =
            getNextFeedInfo();


        if (
            elements.farmFlock
        ) {

            elements.farmFlock.textContent =
                String(
                    Math.round(
                        flock
                    )
                );

        }


        if (
            elements.farmEggs
        ) {

            elements.farmEggs.textContent =
                String(
                    Math.round(
                        eggs
                    )
                );

        }


        if (
            elements.farmRate
        ) {

            elements.farmRate.textContent =
                percentage(
                    rate
                );

        }


        if (
            elements.farmFeed
        ) {

            elements.farmFeed.textContent =
                formatKg(
                    feed
                );

        }


        if (
            elements.farmNextFeed
        ) {

            if (next) {

                elements.farmNextFeed.textContent =
                    `${next.time} · ${formatCountdown(
                        next.minutesUntil
                    )}`;

            } else {

                elements.farmNextFeed.textContent =
                    "Not scheduled";

            }

        }

    }


    /* =====================================================
       25. EGG DISPLAY
       ===================================================== */

    let showAllEggHistory = false;


    function updateEggProductionDisplay() {

        const elements =
            getDashboardElements();


        const eggs =
            getTodayEggs();


        const rate =
            getTodayLayingRate();


        if (
            elements.eggCount
        ) {

            elements.eggCount.textContent =
                String(
                    eggs
                );

        }


        if (
            elements.layingRate
        ) {

            elements.layingRate.textContent =
                percentage(
                    rate
                );

        }

    }


    function updateEggHistoryDisplay() {

        const elements =
            getDashboardElements();


        const list =
            elements.eggHistory;


        if (!list) {
            return;
        }


        const history =
            getEggHistory();


        const dates =
            Object.keys(
                history
            )
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
                : dates.slice(
                    0,
                    APP.limits
                        .eggHistoryVisible
                );


        if (
            visible.length === 0
        ) {

            list.innerHTML = `
                <div class="pm-empty-state">
                    No egg production history yet.
                </div>
            `;

            updateHistoryButton(
                dates.length
            );

            return;

        }


        list.innerHTML =
            visible.map(
                date => {

                    const record =
                        normalizeEggRecord(
                            history[date]
                        );


                    const flock =
                        record.flock ||
                        getFlockCount();


                    const rate =
                        flock > 0
                            ? (
                                record.eggs /
                                flock
                            ) * 100
                            : 0;


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
                                ${record.eggs}
                                egg${record.eggs === 1 ? "" : "s"}
                                •
                                ${Math.round(
                                    clampNumber(
                                        rate,
                                        0,
                                        100
                                    )
                                )}%
                            </div>
                        </div>
                    `;

                }
            )
            .join("");


        updateHistoryButton(
            dates.length
        );

    }


    function updateHistoryButton(
        total
    ) {

        const button =
            $("viewHistoryButton");


        if (!button) {
            return;
        }


        if (
            total <=
            APP.limits
                .eggHistoryVisible
        ) {

            button.style.display =
                "none";

            return;

        }


        button.style.display =
            "";


        button.textContent =
            showAllEggHistory
                ? "Show Less"
                : "View All History";

    }


    /* =====================================================
       26. PRODUCTION SUMMARY DISPLAY
       ===================================================== */

    function updateProductionSummary() {

        const elements =
            getDashboardElements();


        const stats =
            getProductionStats(
                7
            );


        if (
            elements.sevenDayEggs
        ) {

            elements.sevenDayEggs.textContent =
                String(
                    stats.totalEggs
                );

        }


        if (
            elements.averageLayingRate
        ) {

            elements.averageLayingRate.textContent =
                percentage(
                    stats.averageRate
                );

        }


        if (
            elements.bestProductionDay
        ) {

            elements.bestProductionDay.textContent =
                isToday(
                    stats.best.date
                )
                    ? "Today"
                    : formatDate(
                        stats.best.date
                    );

        }


        if (
            elements.bestProductionEggs
        ) {

            elements.bestProductionEggs.textContent =
                formatEggs(
                    stats.best.eggs
                );

        }

    }


    /* =====================================================
       27. PRODUCTION TREND
       ===================================================== */

    function updateProductionTrend() {

        const elements =
            getDashboardElements();


        const canvas =
            elements.trendChart;


        if (!canvas) {
            return;
        }


        const stats =
            getProductionStats(
                7
            );


        const values =
            stats.records.map(
                item =>
                    item.eggs
            );


        const maximum =
            Math.max(
                1,
                ...values
            );


        const middle =
            Math.round(
                maximum / 2
            );


        if (
            elements.trendMaxLabel
        ) {

            elements.trendMaxLabel.textContent =
                String(
                    maximum
                );

        }


        if (
            elements.trendMidLabel
        ) {

            elements.trendMidLabel.textContent =
                String(
                    middle
                );

        }


        drawSimpleChart(
            canvas,
            stats.records,
            "eggs"
        );

    }


    /* =====================================================
       28. PRODUCTION ANALYTICS
       ===================================================== */

    function updateProductionAnalytics() {

        const elements =
            getDashboardElements();


        const stats =
            getProductionStats(
                7
            );


        const today =
            stats.records[
                stats.records.length - 1
            ] || {
                eggs: 0
            };


        const previous =
            stats.records[
                stats.records.length - 2
            ] || {
                eggs: 0
            };


        const change =
            today.eggs -
            previous.eggs;


        const consistency =
            calculateProductionConsistency(
                stats.records
            );


        if (
            elements.analyticsEggsPerHen
        ) {

            elements.analyticsEggsPerHen.textContent =
                stats.eggsPerHen
                    .toFixed(2);

        }


        if (
            elements.analyticsAverage
        ) {

            elements.analyticsAverage.textContent =
                `${stats.averageRate.toFixed(
                    0
                )}%`;

        }


        if (
            elements.analyticsHighestDay
        ) {

            elements.analyticsHighestDay.textContent =
                String(
                    stats.best.eggs
                );

        }


        if (
            elements.analyticsHighestDayDate
        ) {

            elements.analyticsHighestDayDate.textContent =
                isToday(
                    stats.best.date
                )
                    ? "Today"
                    : formatDate(
                        stats.best.date
                    );

        }


        if (
            elements.analyticsLowestDay
        ) {

            elements.analyticsLowestDay.textContent =
                String(
                    stats.lowest.eggs
                );

        }


        if (
            elements.analyticsLowestDayDate
        ) {

            elements.analyticsLowestDayDate.textContent =
                isToday(
                    stats.lowest.date
                )
                    ? "Today"
                    : formatDate(
                        stats.lowest.date
                    );

        }


        if (
            elements.analyticsConsistency
        ) {

            elements.analyticsConsistency.textContent =
                `${consistency}%`;

        }


        if (
            elements.analyticsChange
        ) {

            const prefix =
                change > 0
                    ? "+"
                    : "";

            elements.analyticsChange.textContent =
                `${prefix}${change}`;

        }


        if (
            elements.analyticsInsight
        ) {

            const insight =
                getProductionInsight();


            elements.analyticsInsight.textContent =
                insight.text;

            elements.analyticsInsight.dataset.type =
                insight.type;

        }

    }


    function calculateProductionConsistency(
        records
    ) {

        const values =
            records
                .map(
                    record =>
                        safeNumber(
                            record.eggs
                        )
                );


        if (
            values.length < 2
        ) {

            return 100;

        }


        const average =
            values.reduce(
                (sum, value) =>
                    sum + value,
                0
            ) /
            values.length;


        if (
            average <= 0
        ) {

            return 0;

        }


        const variance =
            values.reduce(
                (sum, value) =>
                    sum +
                    Math.pow(
                        value -
                        average,
                        2
                    ),
                0
            ) /
            values.length;


        const standardDeviation =
            Math.sqrt(
                variance
            );


        const coefficient =
            standardDeviation /
            average;


        return Math.round(
            clampNumber(
                100 -
                (
                    coefficient *
                    100
                ),
                0,
                100
            )
        );

    }


    /* =====================================================
       29. CANVAS CHART ENGINE
       ===================================================== */

    function prepareCanvas(
        canvas
    ) {

        if (
            !canvas ||
            !canvas.getContext
        ) {

            return null;

        }


        const rect =
            canvas.getBoundingClientRect();


        const width =
            Math.max(
                260,
                Math.round(
                    rect.width ||
                    canvas.clientWidth ||
                    320
                )
            );


        const height =
            Math.max(
                150,
                Math.round(
                    rect.height ||
                    canvas.clientHeight ||
                    200
                )
            );


        const ratio =
            window.devicePixelRatio ||
            1;


        canvas.width =
            width * ratio;


        canvas.height =
            height * ratio;


        const context =
            canvas.getContext(
                "2d"
            );


        if (!context) {
            return null;
        }


        context.setTransform(
            ratio,
            0,
            0,
            ratio,
            0,
            0
        );


        return {

            context,

            width,

            height

        };

    }


    function drawSimpleChart(
        canvas,
        records,
        property
    ) {

        const prepared =
            prepareCanvas(
                canvas
            );


        if (!prepared) {
            return;
        }


        const {
            context,
            width,
            height
        } =
            prepared;


        context.clearRect(
            0,
            0,
            width,
            height
        );


        const padding = {

            top: 18,

            right: 14,

            bottom: 32,

            left: 28

        };


        const chartWidth =
            width -
            padding.left -
            padding.right;


        const chartHeight =
            height -
            padding.top -
            padding.bottom;


        const values =
            records.map(
                record =>
                    Math.max(
                        0,
                        safeNumber(
                            record[
                                property
                            ]
                        )
                    )
            );


        const maxValue =
            Math.max(
                1,
                ...values
            );


        /*
         * Grid.
         */

        context.beginPath();

        for (
            let row = 0;
            row <= 4;
            row++
        ) {

            const y =
                padding.top +
                (
                    chartHeight *
                    row /
                    4
                );


            context.moveTo(
                padding.left,
                y
            );


            context.lineTo(
                width -
                padding.right,
                y
            );

        }


        context.strokeStyle =
            "rgba(128,128,128,0.20)";

        context.lineWidth =
            1;

        context.stroke();


        /*
         * No data.
         */

        if (
            values.every(
                value =>
                    value === 0
            )
        ) {

            context.fillStyle =
                "rgba(128,128,128,0.70)";

            context.font =
                "13px system-ui";

            context.textAlign =
                "center";

            context.fillText(
                "No production data yet",
                width / 2,
                height / 2
            );

            return;

        }


        const points =
            values.map(
                (value, index) => {

                    const x =
                        records.length <= 1
                            ? padding.left +
                                chartWidth / 2
                            : padding.left +
                                (
                                    chartWidth *
                                    index /
                                    (
                                        records.length -
                                        1
                                    )
                                );


                    const y =
                        padding.top +
                        chartHeight -
                        (
                            value /
                            maxValue
                        ) *
                        chartHeight;


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

        context.moveTo(
            points[0].x,
            padding.top +
            chartHeight
        );


        points.forEach(
            point => {

                context.lineTo(
                    point.x,
                    point.y
                );

            }
        );


        context.lineTo(
            points[
                points.length - 1
            ].x,
            padding.top +
            chartHeight
        );


        context.closePath();


        context.fillStyle =
            "rgba(100,100,100,0.08)";

        context.fill();


        /*
         * Line.
         */

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
            2;

        context.stroke();


        /*
         * Points and labels.
         */

        points.forEach(
            (point, index) => {

                context.beginPath();

                context.arc(
                    point.x,
                    point.y,
                    3,
                    0,
                    Math.PI * 2
                );


                context.fillStyle =
                    "currentColor";

                context.fill();


                const record =
                    records[index];


                const label =
                    isToday(
                        record.date
                    )
                        ? "Today"
                        : formatDate(
                            record.date,
                            {
                                month: "short",
                                day: "numeric"
                            }
                        );


                context.font =
                    "10px system-ui";

                context.textAlign =
                    "center";

                context.fillStyle =
                    "rgba(128,128,128,0.85)";


                context.fillText(
                    label,
                    point.x,
                    height - 10
                );

            }
        );

    }


    /* =====================================================
       30. FEED MANAGEMENT DISPLAY
       ===================================================== */

    function updateFeedDisplay() {

        const elements =
            getDashboardElements();


        const feed =
            getFeedAmount();


        const usage =
            getTodayFeedUsage();


        const stats =
            getFeedStats(
                7
            );


        const status =
            getFeedStatus();


        if (
            elements.feedAmount
        ) {

            elements.feedAmount.textContent =
                formatKg(
                    feed
                );

        }


        if (
            elements.feedUsedToday
        ) {

            elements.feedUsedToday.textContent =
                formatKg(
                    usage
                );

        }


        if (
            elements.feedDailyAverage
        ) {

            elements.feedDailyAverage.textContent =
                formatKg(
                    stats.averageUsage
                );

        }


        if (
            elements.feedDaysRemaining
        ) {

            elements.feedDaysRemaining.textContent =
                status.daysRemaining > 0
                    ? status.daysRemaining
                        .toFixed(1)
                    : "0";

        }


        if (
            elements.feedDaysRemainingText
        ) {

            if (
                status.stock <= 0
            ) {

                elements.feedDaysRemainingText.textContent =
                    "Out of feed";

            } else if (
                status.daysRemaining <= 2
            ) {

                elements.feedDaysRemainingText.textContent =
                    "Feed is critically low";

            } else if (
                status.daysRemaining <= 5
            ) {

                elements.feedDaysRemainingText.textContent =
                    "Feed is running low";

            } else {

                elements.feedDaysRemainingText.textContent =
                    "Stock level is healthy";

            }

        }


        if (
            elements.feedSevenDayUsage
        ) {

            elements.feedSevenDayUsage.textContent =
                formatKg(
                    stats.totalUsage
                );

        }


        if (
            elements.feedUsageDays
        ) {

            elements.feedUsageDays.textContent =
                String(
                    stats.usageDays
                );

        }


        if (
            elements.feedPerBird
        ) {

            elements.feedPerBird.textContent =
                `${stats.feedPerBird.toFixed(
                    3
                )} kg`;

        }


        updateFeedStatusClasses(
            status
        );


        updateFeedChart();

        updateFeedHistory();

    }


    function updateFeedStatusClasses(
        status
    ) {

        const targets =
            $all(
                ".feed-status, .feed-stock-status"
            );


        targets.forEach(
            element => {

                element.dataset.status =
                    status.status;

            }
        );

    }


    /* =====================================================
       31. FEED CHART
       ===================================================== */

    function updateFeedChart() {

        const canvas =
            $("feedConsumptionChart");


        if (!canvas) {
            return;
        }


        const stats =
            getFeedStats(
                7
            );


        drawSimpleChart(
            canvas,
            stats.records,
            "usage"
        );

    }


    /* =====================================================
       32. FEED HISTORY
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
            Object.keys(
                history
            )
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
                            history[
                                date
                            ] || 0;


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
                                    ${usage.toFixed(
                                        1
                                    )} kg
                                </div>
                            </div>
                        `;

                    }
                )
                .join("");

        }


        const button =
            $("viewFeedHistoryButton");


        if (
            button
        ) {

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
       33. COMPLETE PRODUCTION REFRESH
       ===================================================== */

    function refreshProduction() {

        updateEggProductionDisplay();

        updateEggHistoryDisplay();

        updateProductionSummary();

        updateProductionTrend();

        updateProductionAnalytics();

        updateFarmOverview();

        updateQuickActionState();

    }


    /* =====================================================
       34. COMPLETE FEED REFRESH
       ===================================================== */

    function refreshFeed() {

        updateFeedDisplay();

        updateFarmOverview();

        updateNextFeed();

        updateQuickActionState();

    }


    /* =====================================================
       35. NEXT FEED UI
       ===================================================== */

    function updateNextFeed() {

        const info =
            getNextFeedInfo();


        const elements =
            getDashboardElements();


        if (
            elements.farmNextFeed
        ) {

            if (info) {

                elements.farmNextFeed.textContent =
                    `${info.time} · ${formatCountdown(
                        info.minutesUntil
                    )}`;

            } else {

                elements.farmNextFeed.textContent =
                    "Not scheduled";

            }

        }


        const dashboardNext =
            $("nextFeedDisplay");


        if (
            dashboardNext
        ) {

            if (info) {

                dashboardNext.textContent =
                    `${info.time} · ${formatCountdown(
                        info.minutesUntil
                    )}`;

            } else {

                dashboardNext.textContent =
                    "Not scheduled";

            }

        }

    }


    /* =====================================================
       36. QUICK ACTIONS
       ===================================================== */

    function initializeQuickActions() {

        const addEgg =
            $("quickAddEggs");


        const feed =
            $("quickFeed");


        const history =
            $("quickHistory");


        if (
            addEgg
        ) {

            addEgg.addEventListener(
                "click",
                () => {

                    addEggs(1);

                    const eggSection =
                        $("eggCount");

                    scrollToElement(
                        eggSection
                            ?.closest(
                                ".section"
                            ) ||
                        eggSection
                    );

                }
            );

        }


        if (
            feed
        ) {

            feed.addEventListener(
                "click",
                () => {

                    const feedInput =
                        $("feedInput");


                    const feedSection =
                        feedInput
                            ?.closest(
                                ".section"
                            ) ||
                        feedInput;


                    scrollToElement(
                        feedSection
                    );


                    setTimeout(
                        () => {

                            if (
                                feedInput
                            ) {

                                feedInput.focus();

                            }

                        },
                        450
                    );

                }
            );

        }


        if (
            history
        ) {

            history.addEventListener(
                "click",
                () => {

                    const historyList =
                        $("eggHistoryList");


                    const section =
                        historyList
                            ?.closest(
                                ".section"
                            ) ||
                        historyList;


                    scrollToElement(
                        section
                    );

                }
            );

        }

    }


    function updateQuickActionState() {

        const button =
            $("quickAddEggs");


        if (!button) {
            return;
        }


        const flock =
            getFlockCount();


        if (
            flock <= 0
        ) {

            button.dataset.disabled =
                "true";

            button.title =
                "Set your flock size first.";

        } else {

            button.dataset.disabled =
                "false";

            button.title =
                "Record one egg.";

        }

    }


    /* =====================================================
       37. EGG BUTTON EVENTS
       ===================================================== */

    function initializeEggControls() {

        const elements =
            getDashboardElements();


        if (
            elements.addEggButton
        ) {

            elements.addEggButton.addEventListener(
                "click",
                () => {

                    addEggs(1);

                }
            );

        }


        if (
            elements.removeEggButton
        ) {

            elements.removeEggButton.addEventListener(
                "click",
                () => {

                    removeEggs(1);

                }
            );

        }


        if (
            elements.viewHistoryButton
        ) {

            elements.viewHistoryButton.addEventListener(
                "click",
                () => {

                    showAllEggHistory =
                        !showAllEggHistory;


                    updateEggHistoryDisplay();

                }
            );

        }

    }


    /* =====================================================
       38. FEED BUTTON EVENTS
       ===================================================== */

    function initializeFeedControls() {

        const elements =
            getDashboardElements();


        if (
            elements.addFeedButton
        ) {

            elements.addFeedButton.addEventListener(
                "click",
                () => {

                    const input =
                        elements.feedInput;


                    const amount =
                        safeNumber(
                            input?.value
                        );


                    addFeed(
                        amount
                    );


                    if (input) {
                        input.value = "";
                    }

                }
            );

        }


        if (
            elements.useFeedButton
        ) {

            elements.useFeedButton.addEventListener(
                "click",
                () => {

                    const input =
                        elements.useFeedInput;


                    const amount =
                        safeNumber(
                            input?.value
                        );


                    recordFeedUsage(
                        amount
                    );

                }
            );

        }


        if (
            elements.resetFeedTodayButton
        ) {

            elements.resetFeedTodayButton.addEventListener(
                "click",
                resetTodayFeedUsage
            );

        }


        if (
            elements.viewFeedHistoryButton
        ) {

            elements.viewFeedHistoryButton.addEventListener(
                "click",
                () => {

                    showAllFeedHistory =
                        !showAllFeedHistory;


                    updateFeedHistory();

                }
            );

        }


        /*
         * Enter key shortcuts.
         */

        if (
            elements.feedInput
        ) {

            elements.feedInput.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        elements.addFeedButton
                            ?.click();

                    }

                }
            );

        }


        if (
            elements.useFeedInput
        ) {

            elements.useFeedInput.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        elements.useFeedButton
                            ?.click();

                    }

                }
            );

        }

    }


    function resetTodayFeedUsage() {

        resetTodayFeedUsageInternal();

    }


    function resetTodayFeedUsageInternal() {

        const today =
            getTodayKey();


        const usage =
            getTodayFeedUsage();


        if (
            usage <= 0
        ) {

            notify(
                "Today's feed usage is already 0.0 kg."
            );

            return;

        }


        const confirmed =
            confirmAction(
                `Reset today's feed usage?\n\nCurrent usage: ${usage.toFixed(
                    1
                )} kg\n\nThe amount will be returned to your current feed stock.`
            );


        if (!confirmed) {
            return;
        }


        saveFeedUsageForDate(
            today,
            0
        );


        saveFeedAmount(
            getFeedAmount() +
            usage
        );


        clearFeedAdditionHistory();


        refreshFeed();


        notify(
            "Today's feed usage has been reset."
        );

    }


    /* =====================================================
       39. DYNAMIC FEED MANAGEMENT ACTIONS
       ===================================================== */

    function ensureFeedActionButtons() {

        const feedInput =
            $("feedInput");


        if (!feedInput) {
            return;
        }


        const container =
            feedInput.parentElement;


        if (!container) {
            return;
        }


        if (
            !document.getElementById(
                "undoFeedAdditionButton"
            )
        ) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.id =
                "undoFeedAdditionButton";


            button.className =
                "feed-reset-button";


            button.textContent =
                "Undo Last Addition";


            button.addEventListener(
                "click",
                undoLastFeedAddition
            );


            container.appendChild(
                button
            );

        }


        if (
            !document.getElementById(
                "resetFeedStockButton"
            )
        ) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.id =
                "resetFeedStockButton";


            button.className =
                "feed-reset-button";


            button.textContent =
                "Reset Feed Stock";


            button.addEventListener(
                "click",
                resetFeedStock
            );


            container.appendChild(
                button
            );

        }

    }


    /* =====================================================
       40. SETTINGS SYSTEM
       ===================================================== */

    function createSettingsView() {

        let settingsView =
            $("pmSettingsView");


        if (
            settingsView
        ) {

            return settingsView;

        }


        settingsView =
            document.createElement(
                "main"
            );


        settingsView.id =
            "pmSettingsView";


        settingsView.className =
            "pm-settings-view";


        settingsView.innerHTML = `

            <section class="section pm-settings-section">

                <div class="pm-settings-header">

                    <div>

                        <span class="pm-settings-eyebrow">
                            FARM CONTROL
                        </span>

                        <h2>
                            Settings
                        </h2>

                        <p>
                            Manage your flock, feeding,
                            alarms, notifications and
                            app preferences.
                        </p>

                    </div>

                </div>


                <div class="pm-settings-card">

                    <div class="pm-settings-card-header">

                        <div>

                            <h3>
                                Flock Settings
                            </h3>

                            <p>
                                Set the number of birds
                                currently in your flock.
                            </p>

                        </div>

                    </div>


                    <div class="pm-settings-control-row">

                        <label
                            for="pmSettingsFlockInput"
                        >
                            Flock Size
                        </label>

                        <input
                            id="pmSettingsFlockInput"
                            class="pm-settings-input"
                            type="number"
                            min="0"
                            max="100000"
                            step="1"
                            inputmode="numeric"
                        >

                    </div>


                    <button
                        type="button"
                        id="pmSaveFlockButton"
                        class="pm-settings-primary-button"
                    >
                        Save Flock Settings
                    </button>

                </div>


                <div class="pm-settings-card">

                    <div class="pm-settings-card-header">

                        <div>

                            <h3>
                                Feeding Schedule
                            </h3>

                            <p>
                                Set your regular morning
                                and afternoon feeding times.
                            </p>

                        </div>

                    </div>


                    <div class="pm-settings-control-row">

                        <label
                            for="pmMorningFeedInput"
                        >
                            Morning Feeding
                        </label>

                        <input
                            id="pmMorningFeedInput"
                            class="pm-settings-input"
                            type="time"
                        >

                    </div>


                    <div class="pm-settings-control-row">

                        <label
                            for="pmAfternoonFeedInput"
                        >
                            Afternoon Feeding
                        </label>

                        <input
                            id="pmAfternoonFeedInput"
                            class="pm-settings-input"
                            type="time"
                        >

                    </div>


                    <button
                        type="button"
                        id="pmSaveScheduleButton"
                        class="pm-settings-primary-button"
                    >
                        Save Feeding Schedule
                    </button>

                </div>


                <div class="pm-settings-card">

                    <div class="pm-settings-card-header">

                        <div>

                            <h3>
                                Feed Alarm
                            </h3>

                            <p>
                                Get an alert when it is time
                                for your scheduled feeding.
                            </p>

                        </div>

                        <label class="pm-toggle">

                            <input
                                id="pmAlarmToggle"
                                type="checkbox"
                            >

                            <span class="pm-toggle-slider"></span>

                        </label>

                    </div>

                </div>


                <div class="pm-settings-card">

                    <div class="pm-settings-card-header">

                        <div>

                            <h3>
                                Notifications
                            </h3>

                            <p>
                                Enable push notifications
                                for feeding reminders.
                            </p>

                        </div>

                        <label class="pm-toggle">

                            <input
                                id="pmNotificationsToggle"
                                type="checkbox"
                            >

                            <span class="pm-toggle-slider"></span>

                        </label>

                    </div>


                    <button
                        type="button"
                        id="pmEnableNotificationsButton"
                        class="pm-settings-primary-button"
                    >
                        Enable Notifications
                    </button>

                </div>


                <div class="pm-settings-card">

                    <div class="pm-settings-card-header">

                        <div>

                            <h3>
                                App Preferences
                            </h3>

                            <p>
                                Customize how Poultry Manager
                                looks and behaves.
                            </p>

                        </div>

                    </div>


                    <div class="pm-settings-control-row">

                        <label
                            for="pmThemeSelect"
                        >
                            Theme
                        </label>

                        <select
                            id="pmThemeSelect"
                            class="pm-settings-input"
                        >

                            <option value="light">
                                Light
                            </option>

                            <option value="dark">
                                Dark
                            </option>

                        </select>

                    </div>


                    <div class="pm-settings-control-row">

                        <div>

                            <strong>
                                Automatic Backup
                            </strong>

                            <p>
                                Keep a local safety copy
                                of your app data.
                            </p>

                        </div>

                        <label class="pm-toggle">

                            <input
                                id="pmAutomaticBackupToggle"
                                type="checkbox"
                            >

                            <span class="pm-toggle-slider"></span>

                        </label>

                    </div>

                </div>


                <div class="pm-settings-card">

                    <div class="pm-settings-card-header">

                        <div>

                            <h3>
                                Data Backup
                            </h3>

                            <p>
                                Export your farm data or
                                restore a previous backup.
                            </p>

                        </div>

                    </div>


                    <div class="pm-settings-actions">

                        <button
                            type="button"
                            id="pmExportBackupButton"
                            class="pm-settings-primary-button"
                        >
                            Export Backup
                        </button>

                        <button
                            type="button"
                            id="pmImportBackupButton"
                            class="pm-settings-secondary-button"
                        >
                            Restore Backup
                        </button>

                        <input
                            id="pmBackupFileInput"
                            type="file"
                            accept="application/json,.json"
                            hidden
                        >

                    </div>


                    <div
                        id="pmBackupStatus"
                        class="pm-backup-status"
                    ></div>

                </div>


                <div class="pm-settings-card">

                    <div class="pm-settings-card-header">

                        <div>

                            <h3>
                                About Poultry Manager
                            </h3>

                            <p>
                                A farm management dashboard
                                designed for practical daily
                                poultry operations.
                            </p>

                        </div>

                    </div>


                    <div class="pm-about-details">

                        <div>
                            <span>
                                Application
                            </span>

                            <strong>
                                Poultry Manager
                            </strong>
                        </div>

                        <div>
                            <span>
                                Version
                            </span>

                            <strong>
                                ${escapeHTML(
                                    APP.version
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Storage
                            </span>

                            <strong>
                                Local + Cloud Services
                            </strong>
                        </div>

                    </div>

                </div>

            </section>

        `;


        const dashboard =
            $("pmDashboardView");


        if (
            dashboard
        ) {

            dashboard.insertAdjacentElement(
                "afterend",
                settingsView
            );

        } else {

            document.body.appendChild(
                settingsView
            );

        }


        return settingsView;

    }


    /* =====================================================
       41. APP NAVIGATION
       ===================================================== */

    function createNavigation() {

        let navigation =
            $("pmAppNavigation");


        if (
            navigation
        ) {

            return navigation;

        }


        const header =
            document.querySelector(
                ".app-header"
            );


        if (!header) {

            return null;

        }


        navigation =
            document.createElement(
                "nav"
            );


        navigation.id =
            "pmAppNavigation";


        navigation.className =
            "pm-app-navigation";


        navigation.innerHTML = `

            <button
                type="button"
                id="pmDashboardButton"
                class="pm-nav-button active"
            >
                Dashboard
            </button>

            <button
                type="button"
                id="pmSettingsButton"
                class="pm-nav-button"
            >
                Settings
            </button>

        `;


        header.appendChild(
            navigation
        );


        return navigation;

    }


    function getNavigationButtons() {

        return {

            dashboard:
                $("pmDashboardButton"),

            settings:
                $("pmSettingsButton")

        };

    }


    function setDashboardVisible(
        visible
    ) {

        const dashboard =
            $("pmDashboardView");


        if (!dashboard) {
            return;
        }


        dashboard.style.display =
            visible
                ? ""
                : "none";

    }


    function setSettingsVisible(
        visible
    ) {

        const settings =
            $("pmSettingsView");


        if (!settings) {
            return;
        }


        settings.style.display =
            visible
                ? ""
                : "none";


        if (visible) {

            settings.classList.add(
                "active"
            );

        } else {

            settings.classList.remove(
                "active"
            );

        }

    }


    function showDashboard() {

        const buttons =
            getNavigationButtons();


        setDashboardVisible(
            true
        );


        setSettingsVisible(
            false
        );


        buttons.dashboard
            ?.classList
            .add(
                "active"
            );


        buttons.settings
            ?.classList
            .remove(
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

        const buttons =
            getNavigationButtons();


        setDashboardVisible(
            false
        );


        setSettingsVisible(
            true
        );


        buttons.dashboard
            ?.classList
            .remove(
                "active"
            );


        buttons.settings
            ?.classList
            .add(
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


    function initializeNavigation() {

        createNavigation();

        createSettingsView();


        const buttons =
            getNavigationButtons();


        buttons.dashboard
            ?.addEventListener(
                "click",
                showDashboard
            );


        buttons.settings
            ?.addEventListener(
                "click",
                showSettings
            );


        const savedView =
            readStorage(
                APP.storage.lastView,
                APP.defaults.view
            );


        if (
            savedView ===
            "settings"
        ) {

            showSettings();

        } else {

            showDashboard();

        }

    }


    /* =====================================================
       42. SETTINGS REFRESH
       ===================================================== */

    function refreshSettings() {

        const flockInput =
            $("pmSettingsFlockInput");


        if (
            flockInput
        ) {

            flockInput.value =
                String(
                    Math.round(
                        getFlockCount()
                    )
                );

        }


        const schedule =
            getFeedSchedule();


        const morning =
            $("pmMorningFeedInput");


        const afternoon =
            $("pmAfternoonFeedInput");


        if (morning) {

            morning.value =
                schedule.morning;

        }


        if (afternoon) {

            afternoon.value =
                schedule.afternoon;

        }


        const themeSelect =
            $("pmThemeSelect");


        if (themeSelect) {

            themeSelect.value =
                getTheme();

        }


        const backupToggle =
            $("pmAutomaticBackupToggle");


        if (backupToggle) {

            backupToggle.checked =
                isAutomaticBackupEnabled();

        }


        updateAlarmUI();

        updateNotificationUI();

        updateBackupStatus();

    }


    /* =====================================================
       43. FLOCK SETTINGS
       ===================================================== */

    function saveFlockSettings() {

        const input =
            $("pmSettingsFlockInput");


        if (!input) {
            return;
        }


        const value =
            safeNumber(
                input.value
            );


        if (
            value < 0
        ) {

            notify(
                "Flock size cannot be negative."
            );

            return;

        }


        const flock =
            saveFlockCount(
                value
            );


        /*
         * Update today's egg record so the laying rate uses
         * the current flock size.
         */

        const today =
            getTodayKey();


        const history =
            getEggHistory();


        if (
            history[today]
        ) {

            history[today] = {

                eggs:
                    getTodayEggs(),

                flock

            };


            saveEggHistory(
                history
            );

        }


        refreshAll();


        notify(
            `Flock size saved: ${flock} bird${flock === 1 ? "" : "s"}.`
        );

    }


    /* =====================================================
       44. SCHEDULE SETTINGS
       ===================================================== */

    function saveScheduleSettings() {

        const morning =
            $("pmMorningFeedInput")
                ?.value;


        const afternoon =
            $("pmAfternoonFeedInput")
                ?.value;


        if (
            !isValidTime(
                morning
            ) ||
            !isValidTime(
                afternoon
            )
        ) {

            notify(
                "Please select both feeding times."
            );

            return;

        }


        saveFeedSchedule(
            morning,
            afternoon,
            true
        );


        notify(
            "Feeding schedule saved."
        );


        refreshAll();

    }


    /* =====================================================
       45. THEME SYSTEM
       ===================================================== */

    function getTheme() {

        const saved =
            readStorage(
                APP.storage.theme,
                APP.defaults.theme
            );


        return saved === "dark"
            ? "dark"
            : "light";

    }


    function applyTheme(
        theme
    ) {

        const safeTheme =
            theme === "dark"
                ? "dark"
                : "light";


        document.documentElement
            .setAttribute(
                "data-theme",
                safeTheme
            );


        writeStorage(
            APP.storage.theme,
            safeTheme
        );


        const select =
            $("pmThemeSelect");


        if (select) {

            select.value =
                safeTheme;

        }

    }


    /* =====================================================
       46. AUTOMATIC BACKUP
       ===================================================== */

    let automaticBackupTimer =
        null;


    function isAutomaticBackupEnabled() {

        const stored =
            readStorage(
                APP.storage.automaticBackup,
                null
            );


        if (
            stored === null
        ) {

            return APP.defaults
                .automaticBackup;

        }


        return stored ===
            "true";

    }


    function setAutomaticBackupEnabled(
        enabled
    ) {

        writeStorage(
            APP.storage.automaticBackup,
            enabled
                ? "true"
                : "false"
        );


        if (!enabled) {

            clearTimeout(
                automaticBackupTimer
            );

        } else {

            scheduleAutomaticBackup();

        }

    }


    function collectBackupData() {

        const data = {

            app:
                APP.name,

            version:
                APP.version,

            exportedAt:
                new Date()
                    .toISOString(),

            storage: {}

        };


        /*
         * Export all Poultry Manager-related keys.
         */

        Object.keys(
            localStorage
        ).forEach(
            key => {

                if (
                    key ===
                    APP.storage.backupData
                ) {
                    return;
                }

                /*
                 * Include existing application data.
                 * This also keeps compatibility with future
                 * Poultry Manager settings.
                 */

                if (
                    key.startsWith(
                        "poultryManager"
                    ) ||
                    key ===
                        APP.storage.flock ||
                    key ===
                        APP.storage.eggs ||
                    key ===
                        APP.storage.feed ||
                    key ===
                        APP.storage.feedAdditions ||
                    key ===
                        APP.storage.feedUsage ||
                    key ===
                        APP.storage.schedule ||
                    key ===
                        APP.storage.alarm
                ) {

                    data.storage[key] =
                        localStorage.getItem(
                            key
                        );

                }

            }
        );


        return data;

    }


    function createAutomaticBackup() {

        if (
            !isAutomaticBackupEnabled()
        ) {

            return;

        }


        try {

            const backup =
                collectBackupData();


            writeJSON(
                APP.storage.backupData,
                backup
            );


            /*
             * Avoid recursively scheduling through
             * writeJSON by directly storing the timestamp.
             */

            localStorage.setItem(
                APP.storage.lastBackup,
                new Date()
                    .toISOString()
            );


        } catch (error) {

            console.warn(
                "Automatic backup failed:",
                error
            );

        }

    }


    function scheduleAutomaticBackup() {

        if (
            !isAutomaticBackupEnabled()
        ) {

            return;

        }


        clearTimeout(
            automaticBackupTimer
        );


        automaticBackupTimer =
            setTimeout(
                () => {

                    createAutomaticBackup();

                },
                APP.limits
                    .backupDebounce
            );

    }


    function updateBackupStatus() {

        const status =
            $("pmBackupStatus");


        if (!status) {
            return;
        }


        const last =
            readStorage(
                APP.storage.lastBackup,
                null
            );


        if (!last) {

            status.textContent =
                "No automatic backup has been created yet.";

            return;

        }


        const date =
            new Date(
                last
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            status.textContent =
                "Automatic backup available.";

            return;

        }


        status.textContent =
            `Last automatic backup: ${date.toLocaleString()}`;

    }


    /* =====================================================
       47. MANUAL BACKUP EXPORT
       ===================================================== */

    function exportBackup() {

        const data =
            collectBackupData();


        const json =
            JSON.stringify(
                data,
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


        const anchor =
            document.createElement(
                "a"
            );


        anchor.href =
            url;


        anchor.download =
            `poultry-manager-backup-${getTodayKey()}.json`;


        document.body.appendChild(
            anchor
        );


        anchor.click();


        anchor.remove();


        setTimeout(
            () => {

                URL.revokeObjectURL(
                    url
                );

            },
            1000
        );


        notify(
            "Backup exported successfully."
        );

    }


    /* =====================================================
       48. BACKUP RESTORE
       ===================================================== */

    async function restoreBackupFile(
        file
    ) {

        if (!file) {
            return;
        }


        try {

            const text =
                await file.text();


            const data =
                JSON.parse(
                    text
                );


            if (
                !data ||
                data.app !==
                APP.name ||
                !data.storage ||
                typeof data.storage !==
                "object"
            ) {

                throw new Error(
                    "This is not a valid Poultry Manager backup."
                );

            }


            const confirmed =
                confirmAction(
                    "Restore this Poultry Manager backup?\n\nYour current saved app data will be replaced by the backup.\n\nThe page will reload after restoration."
                );


            if (!confirmed) {
                return;
            }


            const storage =
                data.storage;


            Object.keys(
                storage
            ).forEach(
                key => {

                    if (
                        key ===
                        APP.storage.backupData
                    ) {
                        return;
                    }


                    const value =
                        storage[key];


                    if (
                        typeof value ===
                        "string"
                    ) {

                        localStorage.setItem(
                            key,
                            value
                        );

                    }

                }
            );


            notify(
                "Backup restored. Reloading Poultry Manager..."
            );


            await sleep(
                800
            );


            window.location.reload();

        } catch (error) {

            console.error(
                "Backup restore error:",
                error
            );


            notify(
                "The selected backup could not be restored."
            );

        }

    }


    /* =====================================================
       49. SETTINGS EVENTS
       ===================================================== */

    function initializeSettingsControls() {

        const flockButton =
            $("pmSaveFlockButton");


        const scheduleButton =
            $("pmSaveScheduleButton");


        const alarmToggle =
            $("pmAlarmToggle");


        const notificationToggle =
            $("pmNotificationsToggle");


        const notificationButton =
            $("pmEnableNotificationsButton");


        const themeSelect =
            $("pmThemeSelect");


        const backupToggle =
            $("pmAutomaticBackupToggle");


        const exportButton =
            $("pmExportBackupButton");


        const importButton =
            $("pmImportBackupButton");


        const fileInput =
            $("pmBackupFileInput");


        flockButton
            ?.addEventListener(
                "click",
                saveFlockSettings
            );


        scheduleButton
            ?.addEventListener(
                "click",
                saveScheduleSettings
            );


        alarmToggle
            ?.addEventListener(
                "change",
                event => {

                    setFeedAlarmEnabled(
                        event.target.checked
                    );

                }
            );


        notificationToggle
            ?.addEventListener(
                "change",
                async event => {

                    if (
                        event.target.checked
                    ) {

                        const success =
                            await enablePushNotifications();


                        if (!success) {

                            event.target.checked =
                                false;

                        }

                    } else {

                        writeStorage(
                            APP.storage.notifications,
                            "false"
                        );

                    }

                }
            );


        notificationButton
            ?.addEventListener(
                "click",
                enablePushNotifications
            );


        themeSelect
            ?.addEventListener(
                "change",
                event => {

                    applyTheme(
                        event.target.value
                    );

                    notify(
                        "Theme updated."
                    );

                }
            );


        backupToggle
            ?.addEventListener(
                "change",
                event => {

                    setAutomaticBackupEnabled(
                        event.target.checked
                    );


                    notify(
                        event.target.checked
                            ? "Automatic backup enabled."
                            : "Automatic backup disabled."
                    );

                }
            );


        exportButton
            ?.addEventListener(
                "click",
                exportBackup
            );


        importButton
            ?.addEventListener(
                "click",
                () => {

                    fileInput?.click();

                }
            );


        fileInput
            ?.addEventListener(
                "change",
                event => {

                    const file =
                        event.target.files?.[0];


                    if (file) {

                        restoreBackupFile(
                            file
                        );

                    }


                    event.target.value =
                        "";

                }
            );

    }


    /* =====================================================
       50. OLD DASHBOARD BACKUP CLEANUP
       ===================================================== */

    function hideLegacyBackupSection() {

        const possibleSelectors = [

            "#backupSection",

            "#dataBackupSection",

            ".backup-section"

        ];


        possibleSelectors.forEach(
            selector => {

                $all(
                    selector
                ).forEach(
                    element => {

                        /*
                         * Only hide legacy backup UI.
                         * The new Settings backup system
                         * remains visible.
                         */

                        if (
                            !element.closest(
                                "#pmSettingsView"
                            )
                        ) {

                            element.style.display =
                                "none";

                        }

                    }
                );

            }
        );

    }


    /* =====================================================
       51. APP SHELL POLISH
       ===================================================== */

    function initializeAppShell() {

        const app =
            document.querySelector(
                ".app"
            );


        if (
            app
        ) {

            app.classList.add(
                "pm-app-ready"
            );

        }


        /*
         * Add light press feedback to interactive controls.
         */

        $all(
            "button"
        ).forEach(
            button => {

                button.addEventListener(
                    "pointerdown",
                    () => {

                        button.classList.add(
                            "pm-pressed"
                        );

                    }
                );


                button.addEventListener(
                    "pointerup",
                    () => {

                        button.classList.remove(
                            "pm-pressed"
                        );

                    }
                );


                button.addEventListener(
                    "pointercancel",
                    () => {

                        button.classList.remove(
                            "pm-pressed"
                        );

                    }
                );


                button.addEventListener(
                    "pointerleave",
                    () => {

                        button.classList.remove(
                            "pm-pressed"
                        );

                    }
                );

            }
        );

    }


    /* =====================================================
       52. RESPONSIVE CHART REFRESH
       ===================================================== */

    let chartResizeTimer =
        null;


    function initializeChartResize() {

        window.addEventListener(
            "resize",
            () => {

                clearTimeout(
                    chartResizeTimer
                );


                chartResizeTimer =
                    setTimeout(
                        () => {

                            updateProductionTrend();

                            updateFeedChart();

                        },
                        180
                    );

            }
        );

    }


    /* =====================================================
       53. MIDNIGHT / DAY CHANGE PROTECTION
       ===================================================== */

    let lastKnownDate =
        getTodayKey();


    function checkDateRollover() {

        const currentDate =
            getTodayKey();


        if (
            currentDate ===
            lastKnownDate
        ) {

            return;

        }


        lastKnownDate =
            currentDate;


        /*
         * A new day automatically starts with zero eggs and
         * zero feed usage because those values are keyed by
         * date.
         */

        refreshAll();


        notify(
            "A new day has started. Poultry Manager has updated today's records."
        );

    }


    /* =====================================================
       54. LIVE APPLICATION CLOCK
       ===================================================== */

    function updateHeaderDate() {

        const dateElement =
            document.getElementById(
                "currentDate"
            );


        if (!dateElement) {
            return;
        }


        const now =
            new Date();


        dateElement.textContent =
            now.toLocaleDateString(
                undefined,
                {
                    weekday:
                        "long",

                    month:
                        "long",

                    day:
                        "numeric",

                    year:
                        "numeric"

                }
            );

    }


    /* =====================================================
       55. GLOBAL REFRESH
       ===================================================== */

    function refreshAll() {

        updateHeaderDate();

        updateFarmOverview();

        refreshProduction();

        refreshFeed();

        updateNextFeed();

        updateAlarmUI();

        updateNotificationUI();

        updateQuickActionState();

    }


    /* =====================================================
       56. APPLICATION INITIALIZATION
       ===================================================== */

    async function initializePoultryManager() {

        console.log(
            `${APP.name} ${APP.version} starting...`
        );


        /*
         * Apply theme before the rest of the UI settles.
         */

        applyTheme(
            getTheme()
        );


        /*
         * Create Settings and navigation.
         */

        createNavigation();

        createSettingsView();

        initializeNavigation();


        /*
         * Existing dashboard controls.
         */

        initializeEggControls();

        initializeFeedControls();

        initializeQuickActions();


        /*
         * Dynamic feed action buttons.
         */

        ensureFeedActionButtons();


        /*
         * Settings controls.
         */

        initializeSettingsControls();


        /*
         * Legacy dashboard backup cleanup.
         */

        hideLegacyBackupSection();


        /*
         * App shell.
         */

        initializeAppShell();


        /*
         * Charts.
         */

        initializeChartResize();


        /*
         * Initial application state.
         */

        refreshAll();

        refreshSettings();


        /*
         * Service worker.
         */

        await registerServiceWorker();


        /*
         * Initial automatic backup.
         */

        if (
            isAutomaticBackupEnabled()
        ) {

            createAutomaticBackup();

        }


        /*
         * Timed application maintenance.
         */

        setInterval(
            () => {

                updateHeaderDate();

                updateNextFeed();

                checkFeedAlarm();

                checkDateRollover();

            },
            1000
        );


        /*
         * Less frequent complete refresh.
         */

        setInterval(
            () => {

                refreshAll();

            },
            5000
        );


        console.log(
            `${APP.name} is ready.`
        );

    }


    /* =====================================================
       57. PUBLIC APPLICATION API
       ===================================================== */

    /*
     * Only expose a small controlled API.
     *
     * This allows Quick Actions, future modules and debugging
     * tools to use the application without scattering dozens
     * of functions into window.
     */

    window.PoultryManager = {

        version:
            APP.version,

        addEgg:
            addEggs,

        removeEgg:
            removeEggs,

        addFeed,

        recordFeedUsage,

        undoLastFeedAddition,

        resetFeedStock,

        resetTodayFeedUsage,

        showDashboard,

        showSettings,

        refresh:
            refreshAll,

        getFlockCount,

        getTodayEggs,

        getTodayLayingRate,

        getFeedAmount,

        getTodayFeedUsage

    };


    /*
     * Compatibility export.
     *
     * Existing page code or previously added UI may call
     * window.updateFarmOverview().
     */

    window.updateFarmOverview =
        updateFarmOverview;


    /* =====================================================
       58. START APPLICATION SAFELY
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializePoultryManager,
            {
                once: true
            }
        );

    } else {

        initializePoultryManager();

    }


})();

/* =========================================================
   POULTRY MANAGER
   PART 2 — SETTINGS, NAVIGATION, BACKUP, POLISH & SAFETY
   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       BASIC HELPERS
       ===================================================== */

    const $ = (id) => document.getElementById(id);

    const storageGet = (key, fallback = null) => {

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
    };


    const storageSet = (key, value) => {

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
    };


    const readJSON = (key, fallback = {}) => {

        try {

            const raw =
                localStorage.getItem(key);

            if (!raw) {
                return fallback;
            }

            return JSON.parse(raw);

        } catch (error) {

            return fallback;
        }
    };


    const writeJSON = (key, value) => {

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
    };


    /* =====================================================
       APP REFERENCES
       ===================================================== */

    const PM =
        window.PoultryManager || {};

    const SETTINGS_VIEW_KEY =
        "poultryManagerLastView";

    const THEME_KEY =
        "poultryManagerTheme";

    const FLOCK_KEY =
        "flockCount";

    const EGG_HISTORY_KEY =
        "eggHistory";

    const FEED_KEY =
        "feed";

    const FEED_USAGE_KEY =
        "feedUsageHistory";

    const SCHEDULE_KEY =
        "feedingSchedule";

    const ALARM_KEY =
        "feedAlarmEnabled";

    const NOTIFICATION_KEY =
        "notificationsEnabled";


    /* =====================================================
       DATE HELPERS
       ===================================================== */

    function getTodayKey() {

        const date =
            new Date();

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

        return `${year}-${month}-${day}`;
    }


    function formatDate(dateString) {

        if (!dateString) {
            return "";
        }

        const parts =
            String(dateString).split("-");

        if (parts.length !== 3) {
            return dateString;
        }

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }


    function getTodayEggs() {

        const history =
            readJSON(
                EGG_HISTORY_KEY,
                {}
            );

        const today =
            getTodayKey();

        const record =
            history[today];

        if (
            typeof record ===
            "number"
        ) {

            return Math.max(
                0,
                Number(record) || 0
            );
        }

        if (
            record &&
            typeof record ===
            "object"
        ) {

            return Math.max(
                0,
                Number(record.eggs) || 0
            );
        }

        return 0;
    }


    function getFlockCount() {

        return Math.max(
            0,
            Number(
                storageGet(
                    FLOCK_KEY,
                    0
                )
            ) || 0
        );
    }


    function getFeedStock() {

        return Math.max(
            0,
            Number(
                storageGet(
                    FEED_KEY,
                    0
                )
            ) || 0
        );
    }


    /* =====================================================
       DASHBOARD / SETTINGS REFERENCES
       ===================================================== */

    let dashboardView =
        $("pmDashboardView");

    let settingsView =
        $("pmSettingsView");

    let dashboardButton =
        $("dashboardNavButton") ||
        $("dashboardButton");

    let settingsButton =
        $("settingsNavButton") ||
        $("settingsButton");


    function findNavigationButton(type) {

        const selectors =
            type === "dashboard"

                ? [
                    "#dashboardNavButton",
                    "#dashboardButton",
                    "[data-view='dashboard']",
                    "[data-nav='dashboard']",
                    ".dashboard-nav-button"
                ]

                : [
                    "#settingsNavButton",
                    "#settingsButton",
                    "[data-view='settings']",
                    "[data-nav='settings']",
                    ".settings-nav-button"
                ];

        for (
            const selector
            of selectors
        ) {

            const element =
                document.querySelector(
                    selector
                );

            if (element) {
                return element;
            }
        }

        return null;
    }


    function refreshViewReferences() {

        dashboardView =
            $("pmDashboardView");

        settingsView =
            $("pmSettingsView");

        dashboardButton =
            dashboardButton ||
            findNavigationButton(
                "dashboard"
            );

        settingsButton =
            settingsButton ||
            findNavigationButton(
                "settings"
            );
    }


    /* =====================================================
       VIEW CONTROL
       ===================================================== */

    function hideDashboard() {

        refreshViewReferences();

        if (!dashboardView) {
            return;
        }

        dashboardView.style.display =
            "none";

        dashboardView.setAttribute(
            "aria-hidden",
            "true"
        );
    }


    function showDashboardElement() {

        refreshViewReferences();

        if (!dashboardView) {
            return;
        }

        dashboardView.style.display =
            "";

        dashboardView.removeAttribute(
            "aria-hidden"
        );
    }


    function hideSettings() {

        refreshViewReferences();

        if (!settingsView) {
            return;
        }

        settingsView.style.display =
            "none";

        settingsView.classList.remove(
            "active"
        );

        settingsView.setAttribute(
            "aria-hidden",
            "true"
        );
    }


    function showSettingsElement() {

        refreshViewReferences();

        if (!settingsView) {
            return;
        }

        settingsView.style.display =
            "";

        settingsView.classList.add(
            "active"
        );

        settingsView.removeAttribute(
            "aria-hidden"
        );
    }


    function updateNavigationButtons(
        currentView
    ) {

        refreshViewReferences();

        if (dashboardButton) {

            dashboardButton.classList.toggle(
                "active",
                currentView ===
                "dashboard"
            );

            dashboardButton.setAttribute(
                "aria-current",
                currentView ===
                "dashboard"
                    ? "page"
                    : "false"
            );
        }


        if (settingsButton) {

            settingsButton.classList.toggle(
                "active",
                currentView ===
                "settings"
            );

            settingsButton.setAttribute(
                "aria-current",
                currentView ===
                "settings"
                    ? "page"
                    : "false"
            );
        }
    }


    function showDashboard() {

        showDashboardElement();
        hideSettings();

        updateNavigationButtons(
            "dashboard"
        );

        storageSet(
            SETTINGS_VIEW_KEY,
            "dashboard"
        );

        if (
            typeof window.updateFarmOverview ===
            "function"
        ) {

            window.updateFarmOverview();
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    function showSettings() {

        hideDashboard();
        showSettingsElement();

        updateNavigationButtons(
            "settings"
        );

        storageSet(
            SETTINGS_VIEW_KEY,
            "settings"
        );

        refreshSettingsUI();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    function setupNavigation() {

        refreshViewReferences();

        if (dashboardButton) {

            dashboardButton.onclick =
                function (event) {

                    event.preventDefault();

                    showDashboard();
                };
        }


        if (settingsButton) {

            settingsButton.onclick =
                function (event) {

                    event.preventDefault();

                    showSettings();
                };
        }
    }


    /* =====================================================
       SETTINGS CONTAINER
       ===================================================== */

    function ensureSettingsView() {

        let view =
            $("pmSettingsView");

        if (view) {
            return view;
        }

        view =
            document.createElement(
                "section"
            );

        view.id =
            "pmSettingsView";

        view.className =
            "pm-settings-view";

        view.style.display =
            "none";

        const dashboard =
            $("pmDashboardView");

        if (dashboard) {

            dashboard.parentNode.insertBefore(
                view,
                dashboard.nextSibling
            );

        } else {

            document.body.appendChild(
                view
            );
        }

        settingsView =
            view;

        return view;
    }


    /* =====================================================
       SETTINGS HTML
       ===================================================== */

    function createSettingsHTML() {

        return `

        <div class="pm-settings-shell">

            <div class="pm-settings-header">

                <div>

                    <span class="pm-settings-eyebrow">
                        POULTRY MANAGER
                    </span>

                    <h2>
                        Settings
                    </h2>

                    <p>
                        Manage your flock,
                        feeding system,
                        notifications and app preferences.
                    </p>

                </div>

                <button
                    type="button"
                    id="pmSettingsBackButton"
                    class="pm-settings-back-button"
                >
                    ← Dashboard
                </button>

            </div>


            <!-- =========================================
                 FLOCK SETTINGS
                 ========================================= -->

            <div
                class="pm-settings-card"
                id="pmSettingsFlockCard"
            >

                <div class="pm-settings-card-heading">

                    <div>

                        <span class="pm-settings-icon">
                            🐔
                        </span>

                        <div>

                            <h3>
                                Flock Settings
                            </h3>

                            <p>
                                Keep your flock size accurate.
                            </p>

                        </div>

                    </div>

                </div>


                <div class="pm-settings-row">

                    <div>

                        <strong>
                            Number of birds
                        </strong>

                        <span>
                            Used to calculate laying rate.
                        </span>

                    </div>

                    <input
                        id="pmSettingsFlockInput"
                        class="pm-settings-input"
                        type="number"
                        min="0"
                        step="1"
                        inputmode="numeric"
                    >

                </div>


                <button
                    type="button"
                    id="pmSettingsSaveFlock"
                    class="pm-settings-primary-button"
                >
                    Save Flock Size
                </button>

            </div>


            <!-- =========================================
                 FEEDING SCHEDULE
                 ========================================= -->

            <div
                class="pm-settings-card"
                id="pmSettingsScheduleCard"
            >

                <div class="pm-settings-card-heading">

                    <div>

                        <span class="pm-settings-icon">
                            🕐
                        </span>

                        <div>

                            <h3>
                                Feeding Schedule
                            </h3>

                            <p>
                                Set your morning and afternoon feeding times.
                            </p>

                        </div>

                    </div>

                </div>


                <div class="pm-settings-time-grid">

                    <label>

                        <span>
                            Morning Feed
                        </span>

                        <input
                            type="time"
                            id="pmSettingsMorningTime"
                        >

                    </label>


                    <label>

                        <span>
                            Afternoon Feed
                        </span>

                        <input
                            type="time"
                            id="pmSettingsAfternoonTime"
                        >

                    </label>

                </div>


                <button
                    type="button"
                    id="pmSettingsSaveSchedule"
                    class="pm-settings-primary-button"
                >
                    Save Feeding Schedule
                </button>

                <p
                    id="pmSettingsScheduleStatus"
                    class="pm-settings-status"
                ></p>

            </div>


            <!-- =========================================
                 FEED ALARM
                 ========================================= -->

            <div
                class="pm-settings-card"
            >

                <div class="pm-settings-card-heading">

                    <div>

                        <span class="pm-settings-icon">
                            🔔
                        </span>

                        <div>

                            <h3>
                                Feed Alarm
                            </h3>

                            <p>
                                Receive reminders when it is time to feed.
                            </p>

                        </div>

                    </div>

                    <label class="pm-settings-switch">

                        <input
                            type="checkbox"
                            id="pmSettingsAlarmToggle"
                        >

                        <span
                            class="pm-settings-slider"
                        ></span>

                    </label>

                </div>

                <p
                    id="pmSettingsAlarmStatus"
                    class="pm-settings-status"
                ></p>

            </div>


            <!-- =========================================
                 NOTIFICATIONS
                 ========================================= -->

            <div
                class="pm-settings-card"
            >

                <div class="pm-settings-card-heading">

                    <div>

                        <span class="pm-settings-icon">
                            📲
                        </span>

                        <div>

                            <h3>
                                Notifications
                            </h3>

                            <p>
                                Connect this device to Poultry Manager notifications.
                            </p>

                        </div>

                    </div>

                </div>


                <button
                    type="button"
                    id="pmSettingsNotificationsButton"
                    class="pm-settings-primary-button"
                >
                    Enable Notifications
                </button>

                <p
                    id="pmSettingsNotificationStatus"
                    class="pm-settings-status"
                ></p>

            </div>


            <!-- =========================================
                 APP PREFERENCES
                 ========================================= -->

            <div
                class="pm-settings-card"
            >

                <div class="pm-settings-card-heading">

                    <div>

                        <span class="pm-settings-icon">
                            🎨
                        </span>

                        <div>

                            <h3>
                                App Preferences
                            </h3>

                            <p>
                                Personalize how Poultry Manager looks.
                            </p>

                        </div>

                    </div>

                </div>


                <div class="pm-settings-row">

                    <div>

                        <strong>
                            Dark Mode
                        </strong>

                        <span>
                            Use a darker interface.
                        </span>

                    </div>

                    <label class="pm-settings-switch">

                        <input
                            type="checkbox"
                            id="pmSettingsThemeToggle"
                        >

                        <span
                            class="pm-settings-slider"
                        ></span>

                    </label>

                </div>

            </div>


            <!-- =========================================
                 DATA BACKUP
                 ========================================= -->

            <div
                class="pm-settings-card"
            >

                <div class="pm-settings-card-heading">

                    <div>

                        <span class="pm-settings-icon">
                            💾
                        </span>

                        <div>

                            <h3>
                                Data Backup
                            </h3>

                            <p>
                                Protect your Poultry Manager records.
                            </p>

                        </div>

                    </div>

                </div>


                <div class="pm-settings-button-grid">

                    <button
                        type="button"
                        id="pmSettingsExportButton"
                        class="pm-settings-secondary-button"
                    >
                        Export Backup
                    </button>

                    <button
                        type="button"
                        id="pmSettingsRestoreButton"
                        class="pm-settings-secondary-button"
                    >
                        Restore Backup
                    </button>

                </div>


                <input
                    type="file"
                    id="pmSettingsRestoreInput"
                    accept=".json,application/json"
                    hidden
                >

                <p
                    class="pm-settings-status"
                >
                    Export your records before changing devices or browsers.
                </p>

            </div>


            <!-- =========================================
                 ABOUT
                 ========================================= -->

            <div
                class="pm-settings-card pm-settings-about-card"
            >

                <div class="pm-settings-card-heading">

                    <div>

                        <span class="pm-settings-icon">
                            ℹ️
                        </span>

                        <div>

                            <h3>
                                About Poultry Manager
                            </h3>

                            <p>
                                Your flock. Your records. Your farm.
                            </p>

                        </div>

                    </div>

                </div>


                <div class="pm-settings-about-content">

                    <strong>
                        Poultry Manager
                    </strong>

                    <span>
                        Production management system
                    </span>

                    <span>
                        Built for practical poultry keeping.
                    </span>

                </div>

            </div>

        </div>

        `;
    }


    function buildSettingsView() {

        const view =
            ensureSettingsView();

        if (!view) {
            return;
        }

        if (
            !view.querySelector(
                ".pm-settings-shell"
            )
        ) {

            view.innerHTML =
                createSettingsHTML();
        }

        bindSettingsControls();
    }


    /* =====================================================
       FLOCK SETTINGS
       ===================================================== */

    function refreshFlockSetting() {

        const input =
            $("pmSettingsFlockInput");

        if (!input) {
            return;
        }

        input.value =
            String(
                getFlockCount()
            );
    }


    function saveFlockSetting() {

        const input =
            $("pmSettingsFlockInput");

        if (!input) {
            return;
        }

        let flock =
            Number(input.value);

        if (!Number.isFinite(flock)) {
            flock = 0;
        }

        flock =
            Math.max(
                0,
                Math.floor(flock)
            );

        storageSet(
            FLOCK_KEY,
            flock
        );

        input.value =
            String(flock);


        if (
            typeof window.updateFarmOverview ===
            "function"
        ) {

            window.updateFarmOverview();
        }


        if (
            typeof PM.refreshAll ===
            "function"
        ) {

            PM.refreshAll();
        }


        const status =
            input.parentElement
                ?.parentElement
                ?.nextElementSibling
                ?.nextElementSibling;

        if (status) {

            status.textContent =
                "Flock size saved.";

            setTimeout(
                () => {

                    if (
                        status.textContent ===
                        "Flock size saved."
                    ) {

                        status.textContent =
                            "";
                    }

                },
                2500
            );
        }
    }


    /* =====================================================
       SCHEDULE SETTINGS
       ===================================================== */

    function getScheduleData() {

        const saved =
            readJSON(
                SCHEDULE_KEY,
                null
            );

        if (
            saved &&
            typeof saved ===
            "object"
        ) {

            return {
                morning:
                    saved.morning ||
                    saved.morningTime ||
                    "07:00",

                afternoon:
                    saved.afternoon ||
                    saved.afternoonTime ||
                    "17:00"
            };
        }

        return {
            morning: "07:00",
            afternoon: "17:00"
        };
    }


    function refreshScheduleSetting() {

        const morning =
            $("pmSettingsMorningTime");

        const afternoon =
            $("pmSettingsAfternoonTime");

        if (!morning || !afternoon) {
            return;
        }

        const schedule =
            getScheduleData();

        morning.value =
            schedule.morning;

        afternoon.value =
            schedule.afternoon;
    }


    async function saveScheduleSetting() {

        const morning =
            $("pmSettingsMorningTime");

        const afternoon =
            $("pmSettingsAfternoonTime");

        const status =
            $("pmSettingsScheduleStatus");

        if (!morning || !afternoon) {
            return;
        }

        const schedule = {

            morning:
                morning.value ||
                "07:00",

            afternoon:
                afternoon.value ||
                "17:00"

        };


        writeJSON(
            SCHEDULE_KEY,
            schedule
        );


        if (status) {

            status.textContent =
                "Saving schedule...";
        }


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

                        body:
                            JSON.stringify(
                                schedule
                            )
                    }
                );


            if (
                response.ok
            ) {

                if (status) {

                    status.textContent =
                        "Schedule saved successfully.";
                }

            } else {

                if (status) {

                    status.textContent =
                        "Saved on this device. Server sync unavailable.";
                }
            }

        } catch (error) {

            if (status) {

                status.textContent =
                    "Saved on this device. Server sync unavailable.";
            }

        }


        if (
            typeof PM.refreshAll ===
            "function"
        ) {

            PM.refreshAll();
        }

        if (
            typeof window.updateFarmOverview ===
            "function"
        ) {

            window.updateFarmOverview();
        }


        setTimeout(
            () => {

                if (status) {
                    status.textContent = "";
                }

            },
            3500
        );
    }


    /* =====================================================
       ALARM SETTINGS
       ===================================================== */

    function isAlarmEnabled() {

        return (
            storageGet(
                ALARM_KEY,
                "false"
            ) === "true"
        );
    }


    function refreshAlarmSetting() {

        const toggle =
            $("pmSettingsAlarmToggle");

        const status =
            $("pmSettingsAlarmStatus");

        if (!toggle) {
            return;
        }

        toggle.checked =
            isAlarmEnabled();


        if (status) {

            status.textContent =
                toggle.checked
                    ? "Feed alarm is enabled."
                    : "Feed alarm is currently off.";
        }
    }


    function toggleAlarm() {

        const toggle =
            $("pmSettingsAlarmToggle");

        if (!toggle) {
            return;
        }

        const enabled =
            Boolean(
                toggle.checked
            );

        storageSet(
            ALARM_KEY,
            enabled
                ? "true"
                : "false"
        );


        refreshAlarmSetting();


        if (
            typeof PM.checkFeedAlarm ===
            "function"
        ) {

            PM.checkFeedAlarm();
        }
    }


    /* =====================================================
       THEME
       ===================================================== */

    function isDarkMode() {

        return (
            storageGet(
                THEME_KEY,
                "light"
            ) === "dark"
        );
    }


    function applyTheme(
        theme
    ) {

        const root =
            document.documentElement;

        const dark =
            theme === "dark";

        if (dark) {

            root.setAttribute(
                "data-theme",
                "dark"
            );

        } else {

            root.removeAttribute(
                "data-theme"
            );
        }

        storageSet(
            THEME_KEY,
            dark
                ? "dark"
                : "light"
        );
    }


    function refreshThemeSetting() {

        const toggle =
            $("pmSettingsThemeToggle");

        if (!toggle) {
            return;
        }

        toggle.checked =
            isDarkMode();
    }


    function toggleTheme() {

        const toggle =
            $("pmSettingsThemeToggle");

        if (!toggle) {
            return;
        }

        applyTheme(
            toggle.checked
                ? "dark"
                : "light"
        );
    }


    function loadSavedTheme() {

        const theme =
            storageGet(
                THEME_KEY,
                "light"
            );

        applyTheme(
            theme === "dark"
                ? "dark"
                : "light"
        );
    }


    /* =====================================================
       NOTIFICATIONS
       ===================================================== */

    function refreshNotificationSetting() {

        const button =
            $("pmSettingsNotificationsButton");

        const status =
            $("pmSettingsNotificationStatus");

        if (!button) {
            return;
        }

        const enabled =
            storageGet(
                NOTIFICATION_KEY,
                "false"
            ) === "true";


        if (
            enabled
        ) {

            button.textContent =
                "Notifications Enabled";

            if (status) {

                status.textContent =
                    "This device is connected to notifications.";
            }

        } else {

            button.textContent =
                "Enable Notifications";

            if (status) {

                status.textContent =
                    "Notifications are not connected on this device.";
            }
        }
    }


    async function enableNotificationsFromSettings() {

        const status =
            $("pmSettingsNotificationStatus");

        if (status) {

            status.textContent =
                "Connecting notifications...";
        }


        try {

            if (
                typeof PM.enableNotifications ===
                "function"
            ) {

                await PM.enableNotifications();

            } else if (
                typeof window.enableNotifications ===
                "function"
            ) {

                await window.enableNotifications();

            } else {

                throw new Error(
                    "Notification system unavailable."
                );
            }


            storageSet(
                NOTIFICATION_KEY,
                "true"
            );


            refreshNotificationSetting();


        } catch (error) {

            console.error(
                "Notification setup error:",
                error
            );

            if (status) {

                status.textContent =
                    error.message ||
                    "Notifications could not be enabled.";
            }
        }
    }


    /* =====================================================
       BACKUP EXPORT
       ===================================================== */

    function collectAllStorage() {

        const data = {};

        try {

            for (
                let index = 0;
                index < localStorage.length;
                index++
            ) {

                const key =
                    localStorage.key(
                        index
                    );

                if (!key) {
                    continue;
                }

                data[key] =
                    localStorage.getItem(
                        key
                    );
            }

        } catch (error) {

            console.error(
                "Could not collect storage:",
                error
            );
        }

        return data;
    }


    function exportBackup() {

        const backup = {

            app:
                "Poultry Manager",

            version:
                "2.0",

            exportedAt:
                new Date().toISOString(),

            data:
                collectAllStorage()

        };


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
            `poultry-manager-backup-${date}.json`;


        document.body.appendChild(
            link
        );

        link.click();

        link.remove();


        setTimeout(
            () => {

                URL.revokeObjectURL(
                    url
                );

            },
            1000
        );
    }


    /* =====================================================
       BACKUP RESTORE
       ===================================================== */

    function restoreBackupFile(
        file
    ) {

        if (!file) {
            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            function () {

                try {

                    const backup =
                        JSON.parse(
                            reader.result
                        );


                    if (
                        !backup ||
                        backup.app !==
                            "Poultry Manager"
                    ) {

                        alert(
                            "This file is not a valid Poultry Manager backup."
                        );

                        return;
                    }


                    if (
                        !backup.data ||
                        typeof backup.data !==
                            "object"
                    ) {

                        alert(
                            "The backup file does not contain valid data."
                        );

                        return;
                    }


                    const confirmed =
                        confirm(
                            "Restore this Poultry Manager backup?\n\nCurrent app data will be replaced by the data in the backup."
                        );


                    if (!confirmed) {
                        return;
                    }


                    localStorage.clear();


                    Object.keys(
                        backup.data
                    ).forEach(
                        (key) => {

                            localStorage.setItem(
                                key,
                                backup.data[key]
                            );

                        }
                    );


                    alert(
                        "Backup restored successfully. Poultry Manager will now reload."
                    );


                    window.location.reload();

                } catch (error) {

                    console.error(
                        "Backup restore error:",
                        error
                    );

                    alert(
                        "The backup file could not be read."
                    );
                }
            };


        reader.onerror =
            function () {

                alert(
                    "The backup file could not be opened."
                );
            };


        reader.readAsText(
            file
        );
    }


    /* =====================================================
       SETTINGS REFRESH
       ===================================================== */

    function refreshSettingsUI() {

        refreshFlockSetting();

        refreshScheduleSetting();

        refreshAlarmSetting();

        refreshThemeSetting();

        refreshNotificationSetting();
    }


    /* =====================================================
       SETTINGS EVENT BINDING
       ===================================================== */

    function bindSettingsControls() {

        const backButton =
            $("pmSettingsBackButton");

        if (
            backButton &&
            !backButton.dataset.bound
        ) {

            backButton.dataset.bound =
                "true";

            backButton.addEventListener(
                "click",
                showDashboard
            );
        }


        const saveFlock =
            $("pmSettingsSaveFlock");

        if (
            saveFlock &&
            !saveFlock.dataset.bound
        ) {

            saveFlock.dataset.bound =
                "true";

            saveFlock.addEventListener(
                "click",
                saveFlockSetting
            );
        }


        const saveSchedule =
            $("pmSettingsSaveSchedule");

        if (
            saveSchedule &&
            !saveSchedule.dataset.bound
        ) {

            saveSchedule.dataset.bound =
                "true";

            saveSchedule.addEventListener(
                "click",
                saveScheduleSetting
            );
        }


        const alarmToggle =
            $("pmSettingsAlarmToggle");

        if (
            alarmToggle &&
            !alarmToggle.dataset.bound
        ) {

            alarmToggle.dataset.bound =
                "true";

            alarmToggle.addEventListener(
                "change",
                toggleAlarm
            );
        }


        const themeToggle =
            $("pmSettingsThemeToggle");

        if (
            themeToggle &&
            !themeToggle.dataset.bound
        ) {

            themeToggle.dataset.bound =
                "true";

            themeToggle.addEventListener(
                "change",
                toggleTheme
            );
        }


        const notificationButton =
            $("pmSettingsNotificationsButton");

        if (
            notificationButton &&
            !notificationButton.dataset.bound
        ) {

            notificationButton.dataset.bound =
                "true";

            notificationButton.addEventListener(
                "click",
                enableNotificationsFromSettings
            );
        }


        const exportButton =
            $("pmSettingsExportButton");

        if (
            exportButton &&
            !exportButton.dataset.bound
        ) {

            exportButton.dataset.bound =
                "true";

            exportButton.addEventListener(
                "click",
                exportBackup
            );
        }


        const restoreButton =
            $("pmSettingsRestoreButton");

        const restoreInput =
            $("pmSettingsRestoreInput");


        if (
            restoreButton &&
            restoreInput &&
            !restoreButton.dataset.bound
        ) {

            restoreButton.dataset.bound =
                "true";

            restoreButton.addEventListener(
                "click",
                function () {

                    restoreInput.click();

                }
            );
        }


        if (
            restoreInput &&
            !restoreInput.dataset.bound
        ) {

            restoreInput.dataset.bound =
                "true";

            restoreInput.addEventListener(
                "change",
                function () {

                    const file =
                        this.files &&
                        this.files[0];

                    if (file) {

                        restoreBackupFile(
                            file
                        );
                    }

                    this.value =
                        "";
                }
            );
        }
    }


    /* =====================================================
       QUICK ACTION SAFETY
       ===================================================== */

    function setupQuickActionFallbacks() {

        const quickAddEggs =
            $("quickAddEggs");

        const quickFeed =
            $("quickFeed");

        const quickHistory =
            $("quickHistory");


        if (
            quickAddEggs &&
            !quickAddEggs.dataset.settingsBound
        ) {

            quickAddEggs.dataset.settingsBound =
                "true";

            quickAddEggs.addEventListener(
                "click",
                function () {

                    if (
                        typeof PM.addEgg ===
                        "function"
                    ) {

                        PM.addEgg();

                        return;
                    }


                    if (
                        typeof window.addEgg ===
                        "function"
                    ) {

                        window.addEgg();

                        return;
                    }


                    const button =
                        $("addEggButton");

                    if (button) {
                        button.click();
                    }
                }
            );
        }


        if (
            quickFeed &&
            !quickFeed.dataset.settingsBound
        ) {

            quickFeed.dataset.settingsBound =
                "true";

            quickFeed.addEventListener(
                "click",
                function () {

                    const feedSection =
                        $("feedManagementSection") ||
                        $("feedManagement") ||
                        document.querySelector(
                            ".feed-management-section"
                        );


                    if (feedSection) {

                        feedSection.scrollIntoView({
                            behavior:
                                "smooth",
                            block:
                                "start"
                        });

                    }


                    const input =
                        $("feedInput");

                    if (input) {

                        setTimeout(
                            () => {

                                input.focus();

                            },
                            400
                        );
                    }
                }
            );
        }


        if (
            quickHistory &&
            !quickHistory.dataset.settingsBound
        ) {

            quickHistory.dataset.settingsBound =
                "true";

            quickHistory.addEventListener(
                "click",
                function () {

                    const history =
                        $("eggHistoryList");

                    if (history) {

                        history.scrollIntoView({
                            behavior:
                                "smooth",
                            block:
                                "start"
                        });
                    }
                }
            );
        }
    }


    /* =====================================================
       FARM OVERVIEW SAFETY REFRESH
       ===================================================== */

    function refreshFarmOverviewFallback() {

        const flock =
            $("farmOverviewFlock");

        const eggs =
            $("farmOverviewEggs");

        const rate =
            $("farmOverviewLayingRate");

        const feed =
            $("farmOverviewFeed");


        const flockCount =
            getFlockCount();

        const todayEggs =
            getTodayEggs();

        const feedStock =
            getFeedStock();


        if (flock) {

            flock.textContent =
                String(
                    flockCount
                );
        }


        if (eggs) {

            eggs.textContent =
                String(
                    todayEggs
                );
        }


        if (rate) {

            const layingRate =
                flockCount > 0
                    ? (
                        todayEggs /
                        flockCount
                    ) * 100
                    : 0;

            rate.textContent =
                `${layingRate.toFixed(0)}%`;
        }


        if (feed) {

            feed.textContent =
                `${feedStock.toFixed(1)} kg`;
        }
    }


    /* =====================================================
       SERVICE WORKER
       ===================================================== */

    async function registerServiceWorker() {

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

            console.error(
                "Service worker registration failed:",
                error
            );

            return null;
        }
    }


    /* =====================================================
       APP INSTALL / PWA POLISH
       ===================================================== */

    function setupInstallHints() {

        let deferredPrompt =
            null;


        window.addEventListener(
            "beforeinstallprompt",
            function (event) {

                event.preventDefault();

                deferredPrompt =
                    event;

                window.PoultryManagerInstall =
                    function () {

                        if (
                            !deferredPrompt
                        ) {

                            return false;
                        }


                        deferredPrompt.prompt();


                        deferredPrompt =
                            null;

                        return true;
                    };
            }
        );


        window.addEventListener(
            "appinstalled",
            function () {

                deferredPrompt =
                    null;

                console.log(
                    "Poultry Manager installed."
                );
            }
        );
    }


    /* =====================================================
       HIDE LEGACY DASHBOARD BACKUP
       ===================================================== */

    function hideLegacyBackupSection() {

        const candidates = [

            "#dataBackupSection",

            "#backupSection",

            ".data-backup-section",

            ".backup-section"

        ];


        candidates.forEach(
            (selector) => {

                const element =
                    document.querySelector(
                        selector
                    );

                if (element) {

                    if (
                        !element.closest(
                            "#pmSettingsView"
                        )
                    ) {

                        element.style.display =
                            "none";
                    }
                }
            }
        );
    }


    /* =====================================================
       APP SHELL POLISH
       ===================================================== */

    function applyAppShellPolish() {

        document.documentElement
            .classList.add(
                "poultry-manager-ready"
            );


        const body =
            document.body;

        if (body) {

            body.classList.add(
                "poultry-manager-app"
            );
        }
    }


    /* =====================================================
       MIDNIGHT ROLLOVER
       ===================================================== */

    let midnightTimer =
        null;


    function scheduleMidnightRefresh() {

        if (midnightTimer) {

            clearTimeout(
                midnightTimer
            );
        }


        const now =
            new Date();


        const tomorrow =
            new Date(now);


        tomorrow.setDate(
            tomorrow.getDate() + 1
        );


        tomorrow.setHours(
            0,
            0,
            2,
            0
        );


        const delay =
            Math.max(
                1000,
                tomorrow.getTime() -
                now.getTime()
            );


        midnightTimer =
            setTimeout(
                function () {

                    if (
                        typeof PM.refreshAll ===
                        "function"
                    ) {

                        PM.refreshAll();
                    }


                    if (
                        typeof window.updateFarmOverview ===
                        "function"
                    ) {

                        window.updateFarmOverview();
                    }


                    refreshSettingsUI();

                    scheduleMidnightRefresh();

                },
                delay
            );
    }


    /* =====================================================
       LIVE HEADER DATE
       ===================================================== */

    function updateHeaderDate() {

        const dateElements = [

            $("currentDate"),

            $("headerDate"),

            $("pmCurrentDate")

        ];


        const now =
            new Date();


        const formatted =
            now.toLocaleDateString(
                undefined,
                {
                    weekday:
                        "long",

                    day:
                        "numeric",

                    month:
                        "long",

                    year:
                        "numeric"
                }
            );


        dateElements.forEach(
            (element) => {

                if (element) {

                    element.textContent =
                        formatted;
                }

            }
        );
    }


    function startHeaderClock() {

        updateHeaderDate();


        setInterval(
            updateHeaderDate,
            60000
        );
    }


    /* =====================================================
       PERIODIC UI REFRESH
       ===================================================== */

    function startCompanionRefresh() {

        setInterval(
            function () {

                refreshFarmOverviewFallback();

                if (
                    typeof window.updateFarmOverview ===
                    "function"
                ) {

                    window.updateFarmOverview();
                }

            },
            2000
        );
    }


    /* =====================================================
       CURRENT VIEW RESTORATION
       ===================================================== */

    function restoreLastView() {

        const savedView =
            storageGet(
                SETTINGS_VIEW_KEY,
                "dashboard"
            );


        if (
            savedView ===
            "settings"
        ) {

            showSettings();

        } else {

            showDashboard();
        }
    }


    /* =====================================================
       PREVENT DOUBLE SETTINGS BUILD
       ===================================================== */

    let initialized =
        false;


    /* =====================================================
       COMPANION INITIALIZATION
       ===================================================== */

    function initializePartTwo() {

        if (initialized) {
            return;
        }

        initialized =
            true;


        refreshViewReferences();


        /*
         * Settings must exist before
         * navigation tries to display it.
         */

        buildSettingsView();


        /*
         * Apply saved appearance first.
         */

        loadSavedTheme();


        /*
         * Navigation.
         */

        setupNavigation();


        /*
         * Quick action protection.
         */

        setupQuickActionFallbacks();


        /*
         * Hide old backup UI if it
         * still exists on Dashboard.
         */

        hideLegacyBackupSection();


        /*
         * App shell.
         */

        applyAppShellPolish();


        /*
         * PWA.
         */

        setupInstallHints();


        /*
         * Service worker.
         */

        registerServiceWorker();


        /*
         * Header.
         */

        startHeaderClock();


        /*
         * New-day rollover.
         */

        scheduleMidnightRefresh();


        /*
         * Keep Farm Overview live.
         */

        startCompanionRefresh();


        /*
         * Refresh settings after
         * everything has been built.
         */

        refreshSettingsUI();


        /*
         * Restore the user's last
         * selected section.
         */

        restoreLastView();


        /*
         * Final Farm Overview update.
         */

        refreshFarmOverviewFallback();


        if (
            typeof window.updateFarmOverview ===
            "function"
        ) {

            window.updateFarmOverview();
        }


        console.log(
            "Poultry Manager Part 2 initialized."
        );
    }


    /* =====================================================
       PUBLIC COMPANION API
       ===================================================== */

    window.PoultryManager =
        window.PoultryManager || {};


    window.PoultryManager.showDashboard =
        showDashboard;


    window.PoultryManager.showSettings =
        showSettings;


    window.PoultryManager.refreshSettings =
        refreshSettingsUI;


    window.PoultryManager.exportBackup =
        exportBackup;


    window.PoultryManager.restoreBackup =
        restoreBackupFile;


    window.PoultryManager.applyTheme =
        applyTheme;


    window.PoultryManager.getTodayEggs =
        getTodayEggs;


    window.PoultryManager.getFlockCount =
        getFlockCount;


    window.PoultryManager.getFeedStock =
        getFeedStock;


    /* =====================================================
       SAFE STARTUP
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializePartTwo,
            {
                once: true
            }
        );

    } else {

        initializePartTwo();
    }


})();