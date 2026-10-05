/* =========================================================
   POULTRY MANAGER
   Main Application Script
   Clean unified architecture
   ========================================================= */

(() => {
    "use strict";

    /* =======================================================
       APP CONFIGURATION
       ======================================================= */

    const APP = {
        name: "Poultry Manager",
        version: "3.0.0",

        backend: "https://poultry-manager-hppo.onrender.com",

        storage: {
            flock: "flockCount",
            eggs: "eggHistory",
            feed: "feed",
            feedUsage: "feedUsageHistory",
            feedAdditions: "feedAdditionHistory",
            schedule: "feedingSchedule",
            alarm: "feedAlarmEnabled",
            notifications: "notificationsEnabled",
            theme: "poultryManagerTheme",
            automaticBackup: "automaticBackupEnabled",
            lastBackup: "poultryManagerLastBackup",
            settingsView: "poultryManagerView"
        },

        defaults: {
            flock: 5,
            feed: 0,
            morningFeed: "07:00",
            afternoonFeed: "18:00",
            alarm: true,
            notifications: false,
            automaticBackup: true,
            theme: "light"
        }
    };

    const STORAGE = APP.storage;

    /* =======================================================
       BASIC HELPERS
       ======================================================= */

    const $ = (selector, root = document) => {
        return root.querySelector(selector);
    };

    const $$ = (selector, root = document) => {
        return Array.from(root.querySelectorAll(selector));
    };

    function todayKey(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function formatDate(dateString) {
        if (!dateString) return "";

        const date = new Date(`${dateString}T00:00:00`);

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    function formatShortDate(dateString) {
        if (!dateString) return "";

        const date = new Date(`${dateString}T00:00:00`);

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString(undefined, {
            day: "numeric",
            month: "short"
        });
    }

    function formatNumber(value, decimals = 0) {
        const number = Number(value) || 0;

        return number.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function safeNumber(value, fallback = 0) {
        const number = Number(value);

        return Number.isFinite(number) ? number : fallback;
    }

    function readJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);

            if (raw === null) {
                return fallback;
            }

            return JSON.parse(raw);
        } catch (error) {
            console.warn(`Poultry Manager: failed reading ${key}`, error);
            return fallback;
        }
    }

    function writeJSON(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Poultry Manager: failed writing ${key}`, error);
            return false;
        }
    }

    function removeStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn(`Poultry Manager: failed removing ${key}`, error);
        }
    }

    function getStorageNumber(key, fallback = 0) {
        return safeNumber(localStorage.getItem(key), fallback);
    }

    function setStorageNumber(key, value) {
        localStorage.setItem(key, String(Math.max(0, safeNumber(value))));
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* =======================================================
       STATE
       ======================================================= */

    function getFlockCount() {
        const value = getStorageNumber(
            STORAGE.flock,
            APP.defaults.flock
        );

        return Math.max(0, Math.round(value));
    }

    function setFlockCount(value) {
        const flock = Math.max(0, Math.round(safeNumber(value)));

        setStorageNumber(STORAGE.flock, flock);

        refreshAll();

        return flock;
    }

    function getEggHistory() {
        const history = readJSON(STORAGE.eggs, {});

        if (
            history &&
            typeof history === "object" &&
            !Array.isArray(history)
        ) {
            return history;
        }

        return {};
    }

    function saveEggHistory(history) {
        writeJSON(STORAGE.eggs, history);
    }

    function getTodayEggs() {
        const history = getEggHistory();

        return Math.max(
            0,
            Math.round(safeNumber(history[todayKey()], 0))
        );
    }

    function getEggsForDate(dateString) {
        const history = getEggHistory();

        return Math.max(
            0,
            Math.round(safeNumber(history[dateString], 0))
        );
    }

    function getTodayLayingRate() {
        const flock = getFlockCount();

        if (flock <= 0) {
            return 0;
        }

        return clamp(
            Math.round((getTodayEggs() / flock) * 100),
            0,
            100
        );
    }

    /* =======================================================
       EGG MANAGEMENT
       ======================================================= */

    function addEggs(amount = 1) {
        const quantity = Math.max(0, Math.round(safeNumber(amount)));

        if (quantity <= 0) {
            return;
        }

        const history = getEggHistory();
        const key = todayKey();

        history[key] = Math.max(
            0,
            Math.round(safeNumber(history[key], 0)) + quantity
        );

        saveEggHistory(history);

        refreshAll();
    }

    function removeEggs(amount = 1) {
        const quantity = Math.max(0, Math.round(safeNumber(amount)));

        if (quantity <= 0) {
            return;
        }

        const history = getEggHistory();
        const key = todayKey();

        const current = Math.max(
            0,
            Math.round(safeNumber(history[key], 0))
        );

        history[key] = Math.max(0, current - quantity);

        if (history[key] === 0) {
            delete history[key];
        }

        saveEggHistory(history);

        refreshAll();
    }

    function getEggHistoryEntries() {
        const history = getEggHistory();

        return Object.keys(history)
            .filter(key => /^\d{4}-\d{2}-\d{2}$/.test(key))
            .map(date => ({
                date,
                eggs: Math.max(
                    0,
                    Math.round(safeNumber(history[date], 0))
                )
            }))
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    /* =======================================================
       FEED STATE
       ======================================================= */

    function getFeedAmount() {
        return Math.max(
            0,
            safeNumber(
                localStorage.getItem(STORAGE.feed),
                APP.defaults.feed
            )
        );
    }

    function setFeedAmount(value) {
        const amount = Math.max(0, safeNumber(value));

        setStorageNumber(STORAGE.feed, amount);

        refreshFeedUI();
        refreshFarmOverview();
    }

    function getFeedUsageHistory() {
        const history = readJSON(
            STORAGE.feedUsage,
            {}
        );

        if (
            history &&
            typeof history === "object" &&
            !Array.isArray(history)
        ) {
            return history;
        }

        return {};
    }

    function saveFeedUsageHistory(history) {
        writeJSON(STORAGE.feedUsage, history);
    }

    function getTodayFeedUsage() {
        const history = getFeedUsageHistory();

        return Math.max(
            0,
            safeNumber(history[todayKey()], 0)
        );
    }

    function getFeedAdditionHistory() {
        const history = readJSON(
            STORAGE.feedAdditions,
            []
        );

        return Array.isArray(history) ? history : [];
    }

    function saveFeedAdditionHistory(history) {
        writeJSON(STORAGE.feedAdditions, history);
    }

    /* =======================================================
       FEED MANAGEMENT
       ======================================================= */

    function addFeed(amount) {
        const quantity = safeNumber(amount);

        if (quantity <= 0) {
            return false;
        }

        const previousStock = getFeedAmount();
        const newStock = previousStock + quantity;

        setFeedAmount(newStock);

        const history = getFeedAdditionHistory();

        history.push({
            id: Date.now(),
            amount: quantity,
            previousStock,
            resultingStock: newStock,
            date: todayKey(),
            timestamp: new Date().toISOString()
        });

        saveFeedAdditionHistory(history);

        refreshFeedUI();
        refreshFarmOverview();

        return true;
    }

    function undoLastFeedAddition() {
        const history = getFeedAdditionHistory();

        if (!history.length) {
            alert("There is no feed addition to undo.");
            return false;
        }

        const last = history[history.length - 1];

        const currentStock = getFeedAmount();

        /*
         * Only undo if the stock has not changed after
         * the addition. This prevents accidentally removing
         * feed that has already been used.
         */
        const expectedStock = safeNumber(
            last.resultingStock,
            currentStock
        );

        if (Math.abs(currentStock - expectedStock) > 0.0001) {
            alert(
                "The last feed addition cannot be undone because the feed stock has changed since then."
            );

            return false;
        }

        setFeedAmount(
            Math.max(
                0,
                safeNumber(last.previousStock, 0)
            )
        );

        history.pop();

        saveFeedAdditionHistory(history);

        refreshFeedUI();
        refreshFarmOverview();

        return true;
    }

    function recordFeedUsage(amount) {
        const quantity = safeNumber(amount);

        if (quantity <= 0) {
            return false;
        }

        const currentStock = getFeedAmount();

        if (quantity > currentStock + 0.0001) {
            alert(
                `You only have ${formatNumber(currentStock, 2)} kg of feed available.`
            );

            return false;
        }

        const newStock = Math.max(
            0,
            currentStock - quantity
        );

        setFeedAmount(newStock);

        const history = getFeedUsageHistory();
        const key = todayKey();

        history[key] =
            Math.max(
                0,
                safeNumber(history[key], 0)
            ) + quantity;

        saveFeedUsageHistory(history);

        refreshFeedUI();
        refreshFarmOverview();
        refreshProduction();

        return true;
    }

    function resetTodayFeedUsage() {
        const history = getFeedUsageHistory();
        const key = todayKey();

        const used = Math.max(
            0,
            safeNumber(history[key], 0)
        );

        if (used <= 0) {
            alert("There is no feed usage recorded for today.");
            return false;
        }

        setFeedAmount(
            getFeedAmount() + used
        );

        delete history[key];

        saveFeedUsageHistory(history);

        refreshFeedUI();
        refreshFarmOverview();

        return true;
    }

    function resetFeedStock() {
        const confirmed = confirm(
            "Reset the entire feed stock to 0 kg?\n\nYour feed usage history will be preserved."
        );

        if (!confirmed) {
            return false;
        }

        setFeedAmount(0);

        /*
         * Reset only addition history because the current
         * inventory has now been manually reset.
         */
        saveFeedAdditionHistory([]);

        refreshFeedUI();
        refreshFarmOverview();

        return true;
    }

    /* =======================================================
       FEED CALCULATIONS
       ======================================================= */

    function getFeedUsageEntries() {
        const history = getFeedUsageHistory();

        return Object.keys(history)
            .filter(key => /^\d{4}-\d{2}-\d{2}$/.test(key))
            .map(date => ({
                date,
                amount: Math.max(
                    0,
                    safeNumber(history[date], 0)
                )
            }))
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    function getLastSevenDates() {
        const dates = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();

            date.setHours(12, 0, 0, 0);
            date.setDate(date.getDate() - i);

            dates.push(todayKey(date));
        }

        return dates;
    }

    function getSevenDayEggTotal() {
        return getLastSevenDates().reduce(
            (total, date) =>
                total + getEggsForDate(date),
            0
        );
    }

    function getAverageLayingRate() {
        const flock = getFlockCount();

        if (flock <= 0) {
            return 0;
        }

        const dates = getLastSevenDates();

        const totalEggs = dates.reduce(
            (total, date) =>
                total + getEggsForDate(date),
            0
        );

        return clamp(
            Math.round(
                (totalEggs / (flock * 7)) * 100
            ),
            0,
            100
        );
    }

    function getBestProductionDay() {
        const entries = getLastSevenDates().map(date => ({
            date,
            eggs: getEggsForDate(date)
        }));

        entries.sort((a, b) => b.eggs - a.eggs);

        return entries[0] || {
            date: todayKey(),
            eggs: 0
        };
    }

    function getLowestProductionDay() {
        const entries = getLastSevenDates().map(date => ({
            date,
            eggs: getEggsForDate(date)
        }));

        entries.sort((a, b) => a.eggs - b.eggs);

        return entries[0] || {
            date: todayKey(),
            eggs: 0
        };
    }

    function getFeedSevenDayTotal() {
        const history = getFeedUsageHistory();

        return getLastSevenDates().reduce(
            (total, date) =>
                total + safeNumber(history[date], 0),
            0
        );
    }

    function getFeedDailyAverage() {
        return getFeedSevenDayTotal() / 7;
    }

    function getFeedDaysRemaining() {
        const average = getFeedDailyAverage();

        if (average <= 0) {
            return null;
        }

        return getFeedAmount() / average;
    }

    /* =======================================================
       FARM OVERVIEW
       ======================================================= */

    function refreshFarmOverview() {
        const flock = getFlockCount();
        const eggs = getTodayEggs();
        const rate = getTodayLayingRate();
        const feed = getFeedAmount();

        const flockElement = $("#farmOverviewFlock");
        const eggsElement = $("#farmOverviewEggs");
        const rateElement = $("#farmOverviewLayingRate");
        const feedElement = $("#farmOverviewFeed");
        const nextFeedElement = $("#farmOverviewNextFeed");

        if (flockElement) {
            flockElement.textContent = formatNumber(flock);
        }

        if (eggsElement) {
            eggsElement.textContent = formatNumber(eggs);
        }

        if (rateElement) {
            rateElement.textContent = `${rate}%`;
        }

        if (feedElement) {
            feedElement.textContent =
                `${formatNumber(feed, 2)} kg`;
        }

        if (nextFeedElement) {
            nextFeedElement.textContent =
                getNextFeedDisplay();
        }
    }

    /* =======================================================
       QUICK ACTIONS
       ======================================================= */

    function setupQuickActions() {
        const addEggButton = $("#quickAddEggs");
        const feedButton = $("#quickFeed");
        const historyButton = $("#quickHistory");

        if (addEggButton) {
            addEggButton.addEventListener(
                "click",
                () => addEggs(1)
            );
        }

        if (feedButton) {
            feedButton.addEventListener(
                "click",
                () => {
                    const target =
                        $("#feedInput") ||
                        $(".feed-input") ||
                        $("#feedManagement");

                    if (target) {
                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });

                        setTimeout(() => {
                            try {
                                target.focus();
                            } catch (_) {}
                        }, 350);
                    }
                }
            );
        }

        if (historyButton) {
            historyButton.addEventListener(
                "click",
                () => {
                    const target =
                        $("#eggHistoryList") ||
                        $("#eggProduction") ||
                        $(".egg-history");

                    if (target) {
                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });
                    }
                }
            );
        }
    }

    /* =======================================================
       EGG UI
       ======================================================= */

    function refreshEggUI() {
        const eggs = getTodayEggs();
        const flock = getFlockCount();
        const rate = getTodayLayingRate();

        const eggCount = $("#eggCount");
        const layingRate = $("#layingRate");

        if (eggCount) {
            eggCount.textContent = formatNumber(eggs);
        }

        if (layingRate) {
            layingRate.textContent = `${rate}%`;
        }

        const historyList = $("#eggHistoryList");

        if (historyList) {
            renderEggHistory(historyList);
        }

        /*
         * Keep the flock-based display accurate even if
         * there are more eggs recorded than birds.
         */
        if (flock <= 0 && layingRate) {
            layingRate.textContent = "0%";
        }
    }

    function renderEggHistory(container) {
        const entries = getEggHistoryEntries();

        if (!entries.length) {
            container.innerHTML = `
                <div class="pm-empty-state">
                    <div class="pm-empty-state-icon">🥚</div>
                    <strong>No egg history yet</strong>
                    <span>Your recorded production will appear here.</span>
                </div>
            `;

            return;
        }

        const flock = getFlockCount();

        container.innerHTML = entries
            .map(entry => {
                const rate = flock > 0
                    ? clamp(
                        Math.round(
                            (entry.eggs / flock) * 100
                        ),
                        0,
                        100
                    )
                    : 0;

                const isToday =
                    entry.date === todayKey();

                return `
                    <div class="egg-history-item">
                        <div class="egg-history-date">
                            <strong>
                                ${isToday ? "Today" : escapeHTML(formatDate(entry.date))}
                            </strong>
                            <span>${escapeHTML(entry.date)}</span>
                        </div>

                        <div class="egg-history-result">
                            <strong>${formatNumber(entry.eggs)} eggs</strong>
                            <span>${rate}% laying rate</span>
                        </div>
                    </div>
                `;
            })
            .join("");
    }

    /* =======================================================
       FEED UI
       ======================================================= */

    function refreshFeedUI() {
        const stock = getFeedAmount();
        const todayUsage = getTodayFeedUsage();
        const average = getFeedDailyAverage();
        const remaining = getFeedDaysRemaining();
        const flock = getFlockCount();

        const feedAmount = $("#feedAmount");
        const feedUsedToday = $("#feedUsedToday");
        const feedDailyAverage = $("#feedDailyAverage");
        const feedDaysRemaining = $("#feedDaysRemaining");
        const feedDaysRemainingText =
            $("#feedDaysRemainingText");
        const feedUsageDays = $("#feedUsageDays");
        const feedPerBird = $("#feedPerBird");
        const feedSevenDayUsage =
            $("#feedSevenDayUsage");

        if (feedAmount) {
            feedAmount.textContent =
                formatNumber(stock, 2);
        }

        if (feedUsedToday) {
            feedUsedToday.textContent =
                `${formatNumber(todayUsage, 2)} kg`;
        }

        if (feedDailyAverage) {
            feedDailyAverage.textContent =
                `${formatNumber(average, 2)} kg`;
        }

        if (feedDaysRemaining) {
            feedDaysRemaining.textContent =
                remaining === null
                    ? "—"
                    : formatNumber(remaining, 1);
        }

        if (feedDaysRemainingText) {
            feedDaysRemainingText.textContent =
                remaining === null
                    ? "Not enough usage data yet"
                    : `${formatNumber(remaining, 1)} days remaining`;
        }

        if (feedSevenDayUsage) {
            feedSevenDayUsage.textContent =
                `${formatNumber(getFeedSevenDayTotal(), 2)} kg`;
        }

        if (feedUsageDays) {
            const days = getFeedUsageEntries().length;

            feedUsageDays.textContent =
                `${formatNumber(days)} recorded day${days === 1 ? "" : "s"}`;
        }

        if (feedPerBird) {
            const perBird =
                flock > 0
                    ? todayUsage / flock
                    : 0;

            feedPerBird.textContent =
                `${formatNumber(perBird * 1000, 0)} g`;
        }

        renderFeedHistory(
            $("#feedHistoryList")
        );

        renderFeedUsageChart();
    }

    function renderFeedHistory(container) {
        if (!container) {
            return;
        }

        const entries = getFeedUsageEntries();

        if (!entries.length) {
            container.innerHTML = `
                <div class="pm-empty-state">
                    <div class="pm-empty-state-icon">🌾</div>
                    <strong>No feed usage history yet</strong>
                    <span>Recorded feed usage will appear here.</span>
                </div>
            `;

            return;
        }

        container.innerHTML = entries
            .map(entry => `
                <div class="feed-history-item">
                    <div>
                        <strong>
                            ${escapeHTML(formatDate(entry.date))}
                        </strong>
                        <span>${escapeHTML(entry.date)}</span>
                    </div>

                    <strong>
                        ${formatNumber(entry.amount, 2)} kg
                    </strong>
                </div>
            `)
            .join("");
    }

    /* =======================================================
       PRODUCTION SUMMARY
       ======================================================= */

    function refreshProduction() {
        const total = getSevenDayEggTotal();
        const averageRate = getAverageLayingRate();
        const best = getBestProductionDay();

        const sevenDayEggs =
            $("#sevenDayEggs");

        const averageLayingRate =
            $("#averageLayingRate");

        const bestProductionDay =
            $("#bestProductionDay");

        const bestProductionEggs =
            $("#bestProductionEggs");

        if (sevenDayEggs) {
            sevenDayEggs.textContent =
                formatNumber(total);
        }

        if (averageLayingRate) {
            averageLayingRate.textContent =
                `${averageRate}%`;
        }

        if (bestProductionDay) {
            bestProductionDay.textContent =
                best.eggs > 0
                    ? formatShortDate(best.date)
                    : "—";
        }

        if (bestProductionEggs) {
            bestProductionEggs.textContent =
                best.eggs > 0
                    ? `${formatNumber(best.eggs)} eggs`
                    : "No production yet";
        }

        refreshAnalytics();
        renderProductionTrend();
    }

    /* =======================================================
       PRODUCTION ANALYTICS
       ======================================================= */

    function refreshAnalytics() {
        const flock = getFlockCount();
        const dates = getLastSevenDates();

        const eggs = dates.map(date => ({
            date,
            eggs: getEggsForDate(date)
        }));

        const total = eggs.reduce(
            (sum, item) => sum + item.eggs,
            0
        );

        const average =
            dates.length > 0
                ? total / dates.length
                : 0;

        const eggsPerHen =
            flock > 0
                ? total / (flock * 7)
                : 0;

        const highest =
            [...eggs].sort(
                (a, b) => b.eggs - a.eggs
            )[0] || {
                date: todayKey(),
                eggs: 0
            };

        const lowest =
            [...eggs].sort(
                (a, b) => a.eggs - b.eggs
            )[0] || {
                date: todayKey(),
                eggs: 0
            };

        const values = eggs.map(
            item => item.eggs
        );

        const mean =
            values.length
                ? values.reduce(
                    (sum, value) => sum + value,
                    0
                ) / values.length
                : 0;

        const variance =
            values.length
                ? values.reduce(
                    (sum, value) =>
                        sum +
                        Math.pow(value - mean, 2),
                    0
                ) / values.length
                : 0;

        const standardDeviation =
            Math.sqrt(variance);

        const consistency =
            mean > 0
                ? clamp(
                    Math.round(
                        100 -
                        (standardDeviation / mean) * 100
                    ),
                    0,
                    100
                )
                : 0;

        const firstHalf =
            eggs.slice(0, 3).reduce(
                (sum, item) =>
                    sum + item.eggs,
                0
            );

        const secondHalf =
            eggs.slice(-3).reduce(
                (sum, item) =>
                    sum + item.eggs,
                0
            );

        let change = 0;

        if (firstHalf > 0) {
            change =
                ((secondHalf - firstHalf) /
                    firstHalf) *
                100;
        }

        const eggsPerHenElement =
            $("#analyticsEggsPerHen");

        const averageElement =
            $("#analyticsAverage");

        const highestElement =
            $("#analyticsHighestDay");

        const highestDateElement =
            $("#analyticsHighestDayDate");

        const lowestElement =
            $("#analyticsLowestDay");

        const lowestDateElement =
            $("#analyticsLowestDayDate");

        const consistencyElement =
            $("#analyticsConsistency");

        const changeElement =
            $("#analyticsChange");

        const insightElement =
            $("#analyticsInsight");

        if (eggsPerHenElement) {
            eggsPerHenElement.textContent =
                `${formatNumber(eggsPerHen, 2)}`;
        }

        if (averageElement) {
            averageElement.textContent =
                `${formatNumber(average, 1)} eggs`;
        }

        if (highestElement) {
            highestElement.textContent =
                formatNumber(highest.eggs);
        }

        if (highestDateElement) {
            highestDateElement.textContent =
                formatShortDate(highest.date);
        }

        if (lowestElement) {
            lowestElement.textContent =
                formatNumber(lowest.eggs);
        }

        if (lowestDateElement) {
            lowestDateElement.textContent =
                formatShortDate(lowest.date);
        }

        if (consistencyElement) {
            consistencyElement.textContent =
                `${consistency}%`;
        }

        if (changeElement) {
            const sign =
                change > 0 ? "+" : "";

            changeElement.textContent =
                `${sign}${formatNumber(change, 0)}%`;
        }

        if (insightElement) {
            let insight =
                "Keep recording daily production to build a useful trend.";

            if (total === 0) {
                insight =
                    "No eggs have been recorded during the last 7 days.";
            } else if (consistency >= 85) {
                insight =
                    "Production has been very consistent over the last 7 days.";
            } else if (change >= 20) {
                insight =
                    "Production is trending upward. Keep monitoring the flock.";
            } else if (change <= -20) {
                insight =
                    "Production has dropped recently. Check feed, water, stress and flock condition.";
            } else if (averageRate >= 80) {
                insight =
                    "The flock is maintaining a strong laying rate.";
            }

            insightElement.textContent = insight;
        }
    }

    /* =======================================================
       PRODUCTION TREND
       ======================================================= */

    function renderProductionTrend() {
        const chart = $("#productionTrendChart");

        if (!chart) {
            return;
        }

        const dates = getLastSevenDates();
        const values = dates.map(
            date => getEggsForDate(date)
        );

        const max = Math.max(
            ...values,
            1
        );

        const mid = Math.ceil(max / 2);

        const maxLabel =
            $("#trendMaxLabel");

        const midLabel =
            $("#trendMidLabel");

        if (maxLabel) {
            maxLabel.textContent =
                formatNumber(max);
        }

        if (midLabel) {
            midLabel.textContent =
                formatNumber(mid);
        }

        /*
         * If the existing chart markup has been created
         * by the CSS/HTML, update bars safely.
         */
        const bars =
            $$(".production-trend-bar", chart);

        if (bars.length) {
            values.forEach((value, index) => {
                const bar = bars[index];

                if (!bar) {
                    return;
                }

                const height =
                    max > 0
                        ? (value / max) * 100
                        : 0;

                bar.style.height =
                    `${Math.max(height, value > 0 ? 4 : 0)}%`;

                bar.setAttribute(
                    "title",
                    `${formatNumber(value)} eggs`
                );
            });
        }
    }

    /* =======================================================
       FEED USAGE CHART
       ======================================================= */

    function renderFeedUsageChart() {
        const chart =
            $("#feedConsumptionChart");

        if (!chart) {
            return;
        }

        const history =
            getFeedUsageHistory();

        const dates =
            getLastSevenDates();

        const values =
            dates.map(
                date =>
                    Math.max(
                        0,
                        safeNumber(history[date], 0)
                    )
            );

        const max =
            Math.max(...values, 0.1);

        const bars =
            $$(".feed-consumption-bar", chart);

        if (bars.length) {
            values.forEach((value, index) => {
                const bar = bars[index];

                if (!bar) {
                    return;
                }

                const height =
                    (value / max) * 100;

                bar.style.height =
                    `${Math.max(
                        height,
                        value > 0 ? 4 : 0
                    )}%`;

                bar.setAttribute(
                    "title",
                    `${formatNumber(value, 2)} kg`
                );
            });
        }
    }

    /* =======================================================
       FEED CONTROL EVENTS
       ======================================================= */

    function setupFeedControls() {
        const addButton =
            $("#addFeedButton");

        const useButton =
            $("#useFeedButton");

        const addInput =
            $("#feedInput");

        const useInput =
            $("#useFeedInput");

        const resetStock =
            $("#resetFeedTodayButton");

        if (addButton && addInput) {
            addButton.addEventListener(
                "click",
                () => {
                    const value =
                        safeNumber(
                            addInput.value,
                            0
                        );

                    if (addFeed(value)) {
                        addInput.value = "";
                    }
                }
            );
        }

        if (useButton && useInput) {
            useButton.addEventListener(
                "click",
                () => {
                    const value =
                        safeNumber(
                            useInput.value,
                            0
                        );

                    if (recordFeedUsage(value)) {
                        useInput.value = "";
                    }
                }
            );
        }

        if (resetStock) {
            resetStock.addEventListener(
                "click",
                resetFeedStock
            );
        }

        const resetToday =
            $("#resetTodayFeedUsageButton") ||
            $(".feed-reset-today-button");

        if (resetToday) {
            resetToday.addEventListener(
                "click",
                resetTodayFeedUsage
            );
        }

        const undoButton =
            $("#undoLastFeedAdditionButton") ||
            $(".undo-feed-button");

        if (undoButton) {
            undoButton.addEventListener(
                "click",
                undoLastFeedAddition
            );
        }

        [addInput, useInput]
            .filter(Boolean)
            .forEach(input => {
                input.addEventListener(
                    "keydown",
                    event => {
                        if (
                            event.key === "Enter"
                        ) {
                            event.preventDefault();

                            const button =
                                input === addInput
                                    ? addButton
                                    : useButton;

                            if (button) {
                                button.click();
                            }
                        }
                    }
                );
            });
    }

    /* =======================================================
       EGG CONTROL EVENTS
       ======================================================= */

    function setupEggControls() {
        const addButton =
            $("#addEggButton");

        const removeButton =
            $("#removeEggButton");

        const historyButton =
            $("#viewHistoryButton");

        if (addButton) {
            addButton.addEventListener(
                "click",
                () => addEggs(1)
            );
        }

        if (removeButton) {
            removeButton.addEventListener(
                "click",
                () => removeEggs(1)
            );
        }

        if (historyButton) {
            historyButton.addEventListener(
                "click",
                () => {
                    const target =
                        $("#eggHistoryList");

                    if (target) {
                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });
                    }
                }
            );
        }
    }

    /* =======================================================
       SCHEDULE
       ======================================================= */

    function getFeedSchedule() {
        const saved =
            readJSON(
                STORAGE.schedule,
                null
            );

        if (
            saved &&
            typeof saved === "object"
        ) {
            return {
                morning:
                    saved.morning ||
                    APP.defaults.morningFeed,

                afternoon:
                    saved.afternoon ||
                    APP.defaults.afternoonFeed
            };
        }

        return {
            morning: APP.defaults.morningFeed,
            afternoon: APP.defaults.afternoonFeed
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
            STORAGE.schedule,
            schedule
        );

        syncScheduleToBackend(
            schedule
        );

        refreshFarmOverview();

        return schedule;
    }

    async function syncScheduleToBackend(
        schedule
    ) {
        try {
            await fetch(
                `${APP.backend}/schedule`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify(
                        schedule
                    )
                }
            );
        } catch (error) {
            console.warn(
                "Poultry Manager: schedule sync unavailable.",
                error
            );
        }
    }

    function getNextFeedTime() {
        const schedule =
            getFeedSchedule();

        const now = new Date();

        const candidates =
            [
                schedule.morning,
                schedule.afternoon
            ]
            .filter(Boolean)
            .map(time => {
                const [
                    hours,
                    minutes
                ] = time.split(":").map(Number);

                const date =
                    new Date(now);

                date.setHours(
                    hours || 0,
                    minutes || 0,
                    0,
                    0
                );

                if (date <= now) {
                    date.setDate(
                        date.getDate() + 1
                    );
                }

                return date;
            })
            .sort(
                (a, b) =>
                    a.getTime() -
                    b.getTime()
            );

        return candidates[0] || null;
    }

    function getNextFeedDisplay() {
        const next =
            getNextFeedTime();

        if (!next) {
            return "Not scheduled";
        }

        const sameDay =
            todayKey(next) ===
            todayKey();

        return next.toLocaleTimeString(
            undefined,
            {
                hour: "numeric",
                minute: "2-digit"
            }
        ) +
            (sameDay
                ? ""
                : " tomorrow");
    }

    /* =======================================================
       FEED ALARM
       ======================================================= */

    function isFeedAlarmEnabled() {
        const saved =
            localStorage.getItem(
                STORAGE.alarm
            );

        if (saved === null) {
            return APP.defaults.alarm;
        }

        return saved === "true";
    }

    function setFeedAlarmEnabled(
        enabled
    ) {
        localStorage.setItem(
            STORAGE.alarm,
            String(Boolean(enabled))
        );

        checkFeedAlarm();
    }

    let lastAlarmKey = "";

    function checkFeedAlarm() {
        if (!isFeedAlarmEnabled()) {
            return;
        }

        const schedule =
            getFeedSchedule();

        const now = new Date();

        const currentHour =
            String(
                now.getHours()
            ).padStart(2, "0");

        const currentMinute =
            String(
                now.getMinutes()
            ).padStart(2, "0");

        const currentTime =
            `${currentHour}:${currentMinute}`;

        const matching =
            [
                schedule.morning,
                schedule.afternoon
            ].includes(
                currentTime
            );

        if (!matching) {
            return;
        }

        const alarmKey =
            `${todayKey()}-${currentTime}`;

        if (lastAlarmKey === alarmKey) {
            return;
        }

        lastAlarmKey = alarmKey;

        triggerFeedAlarm();
    }

    function triggerFeedAlarm() {
        try {
            if (
                "Notification" in window &&
                Notification.permission ===
                    "granted"
            ) {
                new Notification(
                    "Poultry Manager",
                    {
                        body:
                            "It is time to check the flock feed schedule."
                    }
                );
            }
        } catch (error) {
            console.warn(
                "Notification could not be displayed.",
                error
            );
        }

        /*
         * Also attempt the service-worker notification
         * when available.
         */
        try {
            if (
                navigator.serviceWorker &&
                navigator.serviceWorker.controller
            ) {
                navigator.serviceWorker.controller.postMessage({
                    type: "FEED_ALARM"
                });
            }
        } catch (_) {}
    }

    /* =======================================================
       NOTIFICATIONS
       ======================================================= */

    function notificationsSupported() {
        return (
            "Notification" in window &&
            "serviceWorker" in navigator
        );
    }

    async function enableNotifications() {
        if (!notificationsSupported()) {
            throw new Error(
                "Notifications are not supported by this browser."
            );
        }

        const permission =
            await Notification.requestPermission();

        if (permission !== "granted") {
            localStorage.setItem(
                STORAGE.notifications,
                "false"
            );

            throw new Error(
                "Notification permission was not granted."
            );
        }

        await registerServiceWorker();

        try {
            const registration =
                await navigator.serviceWorker.ready;

            let subscription =
                await registration.pushManager.getSubscription();

            if (!subscription) {
                const keyResponse =
                    await fetch(
                        `${APP.backend}/vapid-public-key`
                    );

                if (!keyResponse.ok) {
                    throw new Error(
                        "Unable to get notification key."
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
                        "Notification public key unavailable."
                    );
                }

                subscription =
                    await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey:
                            urlBase64ToUint8Array(
                                publicKey
                            )
                    });
            }

            await fetch(
                `${APP.backend}/subscribe`,
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
        } catch (error) {
            console.warn(
                "Push subscription setup failed.",
                error
            );
        }

        localStorage.setItem(
            STORAGE.notifications,
            "true"
        );

        refreshSettings();

        return true;
    }

    function urlBase64ToUint8Array(
        base64String
    ) {
        const padding =
            "=".repeat(
                (4 -
                    (base64String.length %
                        4)) %
                    4
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
                character =>
                    character.charCodeAt(0)
            )
        );
    }

    async function sendTestNotification() {
        try {
            const response =
                await fetch(
                    `${APP.backend}/send-test`,
                    {
                        method: "POST"
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "Test notification failed."
                );
            }

            alert(
                "Test notification sent."
            );
        } catch (error) {
            alert(
                "Could not send the test notification."
            );

            console.error(error);
        }
    }

    /* =======================================================
       SERVICE WORKER
       ======================================================= */

    let serviceWorkerRegistration = null;

    async function registerServiceWorker() {
        if (
            !("serviceWorker" in navigator)
        ) {
            return null;
        }

        if (serviceWorkerRegistration) {
            return serviceWorkerRegistration;
        }

        try {
            const swUrl =
                new URL(
                    "sw.js",
                    window.location.href
                );

            serviceWorkerRegistration =
                await navigator.serviceWorker.register(
                    swUrl.href
                );

            return serviceWorkerRegistration;
        } catch (error) {
            console.warn(
                "Poultry Manager: service worker registration failed.",
                error
            );

            return null;
        }
    }

    /* =======================================================
       THEME
       ======================================================= */

    function getTheme() {
        const saved =
            localStorage.getItem(
                STORAGE.theme
            );

        if (
            saved === "dark" ||
            saved === "light"
        ) {
            return saved;
        }

        return APP.defaults.theme;
    }

    function applyTheme(theme) {
        const validTheme =
            theme === "dark"
                ? "dark"
                : "light";

        document.documentElement
            .setAttribute(
                "data-theme",
                validTheme
            );

        localStorage.setItem(
            STORAGE.theme,
            validTheme
        );

        updateThemeControls(
            validTheme
        );
    }

    function updateThemeControls(
        theme
    ) {
        const select =
            $("#pmThemeSelect");

        if (select) {
            select.value = theme;
        }

        const toggle =
            $("#pmSettingsThemeToggle");

        if (toggle) {
            toggle.checked =
                theme === "dark";
        }
    }

    /* =======================================================
       SETTINGS VIEW
       ======================================================= */

    let settingsView = null;

    function ensureSettingsView() {
        settingsView =
            $("#pmSettingsView");

        if (!settingsView) {
            settingsView =
                document.createElement("section");

            settingsView.id =
                "pmSettingsView";

            settingsView.className =
                "pm-settings-view";

            settingsView.style.display =
                "none";

            const dashboard =
                $("#pmDashboardView");

            if (dashboard) {
                dashboard.insertAdjacentElement(
                    "afterend",
                    settingsView
                );
            } else {
                document.body.appendChild(
                    settingsView
                );
            }
        }

        return settingsView;
    }

    function buildSettingsView() {
        const view =
            ensureSettingsView();

        if (
            view.dataset.built === "true"
        ) {
            return;
        }

        view.innerHTML = `
            <div class="pm-settings-shell">

                <div class="pm-settings-header">
                    <div>
                        <span class="pm-eyebrow">
                            FARM SETTINGS
                        </span>

                        <h1>
                            Settings
                        </h1>

                        <p>
                            Configure your flock, feeding schedule,
                            notifications, appearance and backups.
                        </p>
                    </div>
                </div>

                <div class="pm-settings-grid">

                    <!-- FLOCK -->

                    <section class="pm-settings-card">
                        <div class="pm-settings-card-header">
                            <div class="pm-settings-icon">
                                🐔
                            </div>

                            <div>
                                <h2>Flock</h2>
                                <p>
                                    Keep your active flock count accurate.
                                </p>
                            </div>
                        </div>

                        <div class="pm-settings-field">
                            <label for="pmSettingsFlockInput">
                                Number of birds
                            </label>

                            <input
                                id="pmSettingsFlockInput"
                                class="pm-settings-input"
                                type="number"
                                min="0"
                                step="1"
                                inputmode="numeric"
                            />
                        </div>

                        <button
                            id="pmSaveFlockButton"
                            class="pm-settings-primary-button"
                            type="button"
                        >
                            Save flock size
                        </button>
                    </section>

                    <!-- FEED SCHEDULE -->

                    <section class="pm-settings-card">
                        <div class="pm-settings-card-header">
                            <div class="pm-settings-icon">
                                ⏰
                            </div>

                            <div>
                                <h2>Feed Schedule</h2>
                                <p>
                                    Set your morning and afternoon feeding times.
                                </p>
                            </div>
                        </div>

                        <div class="pm-settings-two-column">

                            <div class="pm-settings-field">
                                <label for="pmMorningFeedInput">
                                    Morning
                                </label>

                                <input
                                    id="pmMorningFeedInput"
                                    class="pm-settings-input"
                                    type="time"
                                />
                            </div>

                            <div class="pm-settings-field">
                                <label for="pmAfternoonFeedInput">
                                    Afternoon
                                </label>

                                <input
                                    id="pmAfternoonFeedInput"
                                    class="pm-settings-input"
                                    type="time"
                                />
                            </div>

                        </div>

                        <button
                            id="pmSaveScheduleButton"
                            class="pm-settings-primary-button"
                            type="button"
                        >
                            Save schedule
                        </button>
                    </section>

                    <!-- ALARM -->

                    <section class="pm-settings-card">
                        <div class="pm-settings-card-header">
                            <div class="pm-settings-icon">
                                🔔
                            </div>

                            <div>
                                <h2>Feed Alarm</h2>
                                <p>
                                    Get an in-app reminder when feeding time arrives.
                                </p>
                            </div>
                        </div>

                        <label class="pm-settings-toggle-row">
                            <span>
                                <strong>Enable feed alarm</strong>
                                <small>
                                    Uses your saved feeding schedule.
                                </small>
                            </span>

                            <input
                                id="pmAlarmToggle"
                                type="checkbox"
                            />

                            <span class="pm-settings-switch"></span>
                        </label>
                    </section>

                    <!-- NOTIFICATIONS -->

                    <section class="pm-settings-card">
                        <div class="pm-settings-card-header">
                            <div class="pm-settings-icon">
                                📲
                            </div>

                            <div>
                                <h2>Notifications</h2>
                                <p>
                                    Enable device push notifications.
                                </p>
                            </div>
                        </div>

                        <div
                            id="pmNotificationStatus"
                            class="pm-settings-status"
                        >
                            Checking notification status…
                        </div>

                        <button
                            id="pmEnableNotificationsButton"
                            class="pm-settings-primary-button"
                            type="button"
                        >
                            Enable notifications
                        </button>

                        <button
                            id="pmTestNotificationButton"
                            class="pm-settings-secondary-button"
                            type="button"
                        >
                            Send test notification
                        </button>
                    </section>

                    <!-- APPEARANCE -->

                    <section class="pm-settings-card">
                        <div class="pm-settings-card-header">
                            <div class="pm-settings-icon">
                                🎨
                            </div>

                            <div>
                                <h2>Appearance</h2>
                                <p>
                                    Choose how Poultry Manager looks.
                                </p>
                            </div>
                        </div>

                        <div class="pm-settings-field">
                            <label for="pmThemeSelect">
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
                    </section>

                    <!-- BACKUP -->

                    <section class="pm-settings-card">
                        <div class="pm-settings-card-header">
                            <div class="pm-settings-icon">
                                💾
                            </div>

                            <div>
                                <h2>Backup & Restore</h2>
                                <p>
                                    Protect your Poultry Manager data.
                                </p>
                            </div>
                        </div>

                        <label class="pm-settings-toggle-row">
                            <span>
                                <strong>Automatic backup</strong>
                                <small>
                                    Keep a backup of your farm data locally.
                                </small>
                            </span>

                            <input
                                id="pmAutomaticBackupToggle"
                                type="checkbox"
                            />

                            <span class="pm-settings-switch"></span>
                        </label>

                        <div class="pm-settings-actions">

                            <button
                                id="pmExportBackupButton"
                                class="pm-settings-secondary-button"
                                type="button"
                            >
                                Export backup
                            </button>

                            <button
                                id="pmImportBackupButton"
                                class="pm-settings-secondary-button"
                                type="button"
                            >
                                Restore backup
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
                        ></div>
                    </section>

                </div>

                <div class="pm-settings-footer">
                    <span>
                        Poultry Manager
                    </span>

                    <span>
                        Version ${APP.version}
                    </span>
                </div>

            </div>
        `;

        view.dataset.built =
            "true";

        setupSettingsEvents();
        refreshSettings();
    }

    /* =======================================================
       SETTINGS REFRESH
       ======================================================= */

    function refreshSettings() {
        const flockInput =
            $("#pmSettingsFlockInput");

        if (flockInput) {
            flockInput.value =
                getFlockCount();
        }

        const schedule =
            getFeedSchedule();

        const morningInput =
            $("#pmMorningFeedInput");

        const afternoonInput =
            $("#pmAfternoonFeedInput");

        if (morningInput) {
            morningInput.value =
                schedule.morning;
        }

        if (afternoonInput) {
            afternoonInput.value =
                schedule.afternoon;
        }

        const alarmToggle =
            $("#pmAlarmToggle");

        if (alarmToggle) {
            alarmToggle.checked =
                isFeedAlarmEnabled();
        }

        const automaticBackupToggle =
            $("#pmAutomaticBackupToggle");

        if (automaticBackupToggle) {
            automaticBackupToggle.checked =
                isAutomaticBackupEnabled();
        }

        updateNotificationStatus();

        updateThemeControls(
            getTheme()
        );

        const backupStatus =
            $("#pmBackupStatus");

        if (
            backupStatus &&
            !backupStatus.textContent
        ) {
            const lastBackup =
                localStorage.getItem(
                    STORAGE.lastBackup
                );

            if (lastBackup) {
                backupStatus.textContent =
                    `Last automatic backup: ${formatDateTime(lastBackup)}`;
            }
        }
    }

    function formatDateTime(value) {
        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return value;
        }

        return date.toLocaleString(
            undefined,
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );
    }

    /* =======================================================
       SETTINGS EVENTS
       ======================================================= */

    function setupSettingsEvents() {
        const saveFlock =
            $("#pmSaveFlockButton");

        if (saveFlock) {
            saveFlock.addEventListener(
                "click",
                () => {
                    const input =
                        $("#pmSettingsFlockInput");

                    const value =
                        Math.max(
                            0,
                            Math.round(
                                safeNumber(
                                    input?.value,
                                    0
                                )
                            )
                        );

                    setFlockCount(value);

                    alert(
                        `Flock size saved: ${value} bird${value === 1 ? "" : "s"}.`
                    );
                }
            );
        }

        const saveSchedule =
            $("#pmSaveScheduleButton");

        if (saveSchedule) {
            saveSchedule.addEventListener(
                "click",
                () => {
                    const morning =
                        $("#pmMorningFeedInput")?.value ||
                        APP.defaults.morningFeed;

                    const afternoon =
                        $("#pmAfternoonFeedInput")?.value ||
                        APP.defaults.afternoonFeed;

                    saveFeedSchedule(
                        morning,
                        afternoon
                    );

                    alert(
                        "Feed schedule saved."
                    );
                }
            );
        }

        const alarmToggle =
            $("#pmAlarmToggle");

        if (alarmToggle) {
            alarmToggle.addEventListener(
                "change",
                () => {
                    setFeedAlarmEnabled(
                        alarmToggle.checked
                    );
                }
            );
        }

        const notificationButton =
            $("#pmEnableNotificationsButton");

        if (notificationButton) {
            notificationButton.addEventListener(
                "click",
                async () => {
                    notificationButton.disabled =
                        true;

                    try {
                        await enableNotifications();

                        alert(
                            "Notifications are enabled."
                        );
                    } catch (error) {
                        alert(
                            error.message ||
                            "Notifications could not be enabled."
                        );
                    } finally {
                        notificationButton.disabled =
                            false;

                        updateNotificationStatus();
                    }
                }
            );
        }

        const testNotificationButton =
            $("#pmTestNotificationButton");

        if (testNotificationButton) {
            testNotificationButton.addEventListener(
                "click",
                sendTestNotification
            );
        }

        const themeSelect =
            $("#pmThemeSelect");

        if (themeSelect) {
            themeSelect.addEventListener(
                "change",
                () => {
                    applyTheme(
                        themeSelect.value
                    );
                }
            );
        }

        const automaticBackupToggle =
            $("#pmAutomaticBackupToggle");

        if (automaticBackupToggle) {
            automaticBackupToggle.addEventListener(
                "change",
                () => {
                    localStorage.setItem(
                        STORAGE.automaticBackup,
                        String(
                            automaticBackupToggle.checked
                        )
                    );

                    if (
                        automaticBackupToggle.checked
                    ) {
                        createAutomaticBackup();
                    }

                    refreshSettings();
                }
            );
        }

        const exportButton =
            $("#pmExportBackupButton");

        if (exportButton) {
            exportButton.addEventListener(
                "click",
                exportBackup
            );
        }

        const importButton =
            $("#pmImportBackupButton");

        const backupInput =
            $("#pmBackupFileInput");

        if (
            importButton &&
            backupInput
        ) {
            importButton.addEventListener(
                "click",
                () => backupInput.click()
            );

            backupInput.addEventListener(
                "change",
                event => {
                    const file =
                        event.target.files?.[0];

                    if (file) {
                        restoreBackupFile(
                            file
                        );
                    }

                    event.target.value = "";
                }
            );
        }
    }

    function updateNotificationStatus() {
        const status =
            $("#pmNotificationStatus");

        const button =
            $("#pmEnableNotificationsButton");

        if (!status) {
            return;
        }

        if (!notificationsSupported()) {
            status.textContent =
                "Notifications are not supported by this browser.";

            if (button) {
                button.disabled = true;
            }

            return;
        }

        if (
            Notification.permission ===
            "granted"
        ) {
            status.textContent =
                "Notifications are enabled on this device.";

            if (button) {
                button.textContent =
                    "Notifications enabled";
            }

            return;
        }

        if (
            Notification.permission ===
            "denied"
        ) {
            status.textContent =
                "Notifications are blocked. Check your browser or device settings.";

            if (button) {
                button.textContent =
                    "Notifications blocked";
            }

            return;
        }

        status.textContent =
            "Notifications have not been enabled yet.";

        if (button) {
            button.disabled = false;
            button.textContent =
                "Enable notifications";
        }
    }

    /* =======================================================
       NAVIGATION
       ======================================================= */

    function ensureNavigation() {
        let navigation =
            $("#pmAppNavigation");

        if (!navigation) {
            navigation =
                document.createElement("nav");

            navigation.id =
                "pmAppNavigation";

            navigation.className =
                "pm-app-navigation";

            navigation.innerHTML = `
                <button
                    id="pmDashboardButton"
                    type="button"
                    class="pm-nav-button active"
                >
                    <span>Dashboard</span>
                </button>

                <button
                    id="pmSettingsButton"
                    type="button"
                    class="pm-nav-button"
                >
                    <span>Settings</span>
                </button>
            `;

            const header =
                $("header");

            if (header) {
                header.insertAdjacentElement(
                    "afterend",
                    navigation
                );
            } else {
                document.body.prepend(
                    navigation
                );
            }
        }

        return navigation;
    }

    function setupNavigation() {
        const navigation =
            ensureNavigation();

        buildSettingsView();

        const dashboardButton =
            $("#pmDashboardButton");

        const settingsButton =
            $("#pmSettingsButton");

        if (dashboardButton) {
            dashboardButton.addEventListener(
                "click",
                showDashboard
            );
        }

        if (settingsButton) {
            settingsButton.addEventListener(
                "click",
                showSettings
            );
        }

        const savedView =
            localStorage.getItem(
                STORAGE.settingsView
            );

        if (savedView === "settings") {
            showSettings(
                false
            );
        } else {
            showDashboard(
                false
            );
        }

        return navigation;
    }

    function setDashboardVisibility(
        visible
    ) {
        const dashboard =
            $("#pmDashboardView");

        if (!dashboard) {
            console.error(
                "Poultry Manager: #pmDashboardView not found."
            );

            return;
        }

        dashboard.style.display =
            visible ? "" : "none";
    }

    function showDashboard(
        scroll = true
    ) {
        setDashboardVisibility(
            true
        );

        const view =
            ensureSettingsView();

        view.style.display =
            "none";

        const dashboardButton =
            $("#pmDashboardButton");

        const settingsButton =
            $("#pmSettingsButton");

        dashboardButton?.classList.add(
            "active"
        );

        settingsButton?.classList.remove(
            "active"
        );

        localStorage.setItem(
            STORAGE.settingsView,
            "dashboard"
        );

        if (scroll) {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    }

    function showSettings(
        scroll = true
    ) {
        setDashboardVisibility(
            false
        );

        const view =
            ensureSettingsView();

        view.style.display =
            "";

        const dashboardButton =
            $("#pmDashboardButton");

        const settingsButton =
            $("#pmSettingsButton");

        dashboardButton?.classList.remove(
            "active"
        );

        settingsButton?.classList.add(
            "active"
        );

        localStorage.setItem(
            STORAGE.settingsView,
            "settings"
        );

        refreshSettings();

        if (scroll) {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    }

    /* =======================================================
       BACKUP
       ======================================================= */

    function isAutomaticBackupEnabled() {
        const value =
            localStorage.getItem(
                STORAGE.automaticBackup
            );

        if (value === null) {
            return APP.defaults.automaticBackup;
        }

        return value === "true";
    }

    function collectBackupData() {
        const storage = {};

        for (
            let index = 0;
            index < localStorage.length;
            index++
        ) {
            const key =
                localStorage.key(index);

            if (!key) {
                continue;
            }

            try {
                storage[key] =
                    localStorage.getItem(key);
            } catch (_) {}
        }

        return storage;
    }

    function createBackupObject() {
        return {
            app: APP.name,
            version: APP.version,
            exportedAt:
                new Date().toISOString(),
            storage:
                collectBackupData()
        };
    }

    function createAutomaticBackup() {
        if (
            !isAutomaticBackupEnabled()
        ) {
            return;
        }

        try {
            const backup =
                createBackupObject();

            localStorage.setItem(
                STORAGE.lastBackup,
                backup.exportedAt
            );

            /*
             * Keep the automatic backup compact:
             * it is stored separately and does not
             * recursively trigger another backup.
             */
            localStorage.setItem(
                "poultryManagerAutomaticBackup",
                JSON.stringify(
                    backup
                )
            );

            refreshSettings();
        } catch (error) {
            console.warn(
                "Automatic backup failed.",
                error
            );
        }
    }

    function exportBackup() {
        try {
            const backup =
                createBackupObject();

            const blob =
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
                URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement(
                    "a"
                );

            link.href = url;

            link.download =
                `poultry-manager-backup-${todayKey()}.json`;

            document.body.appendChild(
                link
            );

            link.click();

            link.remove();

            URL.revokeObjectURL(
                url
            );

            const status =
                $("#pmBackupStatus");

            if (status) {
                status.textContent =
                    "Backup exported successfully.";
            }
        } catch (error) {
            console.error(error);

            alert(
                "The backup could not be exported."
            );
        }
    }

    async function restoreBackupFile(
        file
    ) {
        try {
            const text =
                await file.text();

            const backup =
                JSON.parse(text);

            if (
                !backup ||
                backup.app !== APP.name
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
                    "The backup file does not contain valid farm data."
                );
            }

            const confirmed =
                confirm(
                    "Restore this Poultry Manager backup?\n\nYour current saved data will be replaced."
                );

            if (!confirmed) {
                return;
            }

            /*
             * Only clear Poultry Manager storage.
             * Other applications sharing the same origin
             * should not be touched.
             */
            const keysToRemove = [];

            for (
                let index = 0;
                index < localStorage.length;
                index++
            ) {
                const key =
                    localStorage.key(index);

                if (
                    key &&
                    (
                        key === STORAGE.flock ||
                        key === STORAGE.eggs ||
                        key === STORAGE.feed ||
                        key === STORAGE.feedUsage ||
                        key === STORAGE.feedAdditions ||
                        key === STORAGE.schedule ||
                        key === STORAGE.alarm ||
                        key === STORAGE.notifications ||
                        key === STORAGE.theme ||
                        key === STORAGE.automaticBackup ||
                        key === STORAGE.lastBackup ||
                        key === "poultryManagerAutomaticBackup" ||
                        key === STORAGE.settingsView
                    )
                ) {
                    keysToRemove.push(
                        key
                    );
                }
            }

            keysToRemove.forEach(
                removeStorage
            );

            Object.entries(
                backup.storage
            ).forEach(
                ([key, value]) => {
                    localStorage.setItem(
                        key,
                        value
                    );
                }
            );

            applyTheme(
                getTheme()
            );

            refreshAll();
            refreshSettings();

            alert(
                "Backup restored successfully."
            );
        } catch (error) {
            console.error(error);

            alert(
                error.message ||
                "The backup could not be restored."
            );
        }
    }

    /* =======================================================
       DATE / MIDNIGHT HANDLING
       ======================================================= */

    let lastKnownDate =
        todayKey();

    function handleDateRollover() {
        const currentDate =
            todayKey();

        if (
            currentDate !==
            lastKnownDate
        ) {
            lastKnownDate =
                currentDate;

            refreshAll();
        }
    }

    /* =======================================================
       HEADER DATE
       ======================================================= */

    function refreshHeaderDate() {
        const candidates = [
            "#currentDate",
            "#headerDate",
            "#todayDate",
            "[data-current-date]"
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

        candidates.forEach(
            selector => {
                const element =
                    $(selector);

                if (element) {
                    element.textContent =
                        formatted;
                }
            }
        );
    }

    /* =======================================================
       GLOBAL REFRESH
       ======================================================= */

    function refreshAll() {
        refreshHeaderDate();
        refreshFarmOverview();
        refreshEggUI();
        refreshFeedUI();
        refreshProduction();
        refreshSettings();
    }

    /* =======================================================
       INITIAL DATA SETUP
       ======================================================= */

    function initialiseDefaults() {
        if (
            localStorage.getItem(
                STORAGE.flock
            ) === null
        ) {
            setStorageNumber(
                STORAGE.flock,
                APP.defaults.flock
            );
        }

        if (
            localStorage.getItem(
                STORAGE.feed
            ) === null
        ) {
            setStorageNumber(
                STORAGE.feed,
                APP.defaults.feed
            );
        }

        if (
            localStorage.getItem(
                STORAGE.alarm
            ) === null
        ) {
            localStorage.setItem(
                STORAGE.alarm,
                String(
                    APP.defaults.alarm
                )
            );
        }

        if (
            localStorage.getItem(
                STORAGE.notifications
            ) === null
        ) {
            localStorage.setItem(
                STORAGE.notifications,
                String(
                    APP.defaults.notifications
                )
            );
        }

        if (
            localStorage.getItem(
                STORAGE.theme
            ) === null
        ) {
            localStorage.setItem(
                STORAGE.theme,
                APP.defaults.theme
            );
        }

        if (
            localStorage.getItem(
                STORAGE.automaticBackup
            ) === null
        ) {
            localStorage.setItem(
                STORAGE.automaticBackup,
                String(
                    APP.defaults.automaticBackup
                )
            );
        }
    }

    /* =======================================================
       APPLICATION INITIALISATION
       ======================================================= */

    let initialised = false;

    async function initialiseApp() {
        if (initialised) {
            return;
        }

        initialised = true;

        initialiseDefaults();

        applyTheme(
            getTheme()
        );

        ensureNavigation();

        buildSettingsView();

        setupNavigation();

        setupQuickActions();

        setupEggControls();

        setupFeedControls();

        await registerServiceWorker();

        refreshAll();

        /*
         * Automatic backup happens once during
         * application startup if enabled.
         */
        if (
            isAutomaticBackupEnabled()
        ) {
            createAutomaticBackup();
        }

        /*
         * Lightweight clock/alarm checks.
         * No duplicated refresh loops.
         */
        setInterval(
            () => {
                handleDateRollover();
                refreshHeaderDate();
                checkFeedAlarm();
                refreshFarmOverview();
            },
            1000
        );

        /*
         * Periodic UI refresh for external/local changes.
         */
        setInterval(
            () => {
                refreshAll();
            },
            10000
        );
    }

    /* =======================================================
       PUBLIC API
       ======================================================= */

    window.PoultryManager = {
        version: APP.version,

        addEgg: addEggs,
        removeEgg: removeEggs,

        addFeed,
        recordFeedUsage,
        undoLastFeedAddition,
        resetFeedStock,
        resetTodayFeedUsage,

        showDashboard,
        showSettings,

        refresh: refreshAll,
        refreshSettings,

        getFlockCount,
        getTodayEggs,
        getTodayLayingRate,
        getFeedAmount,
        getTodayFeedUsage,

        getFeedSchedule,
        saveFeedSchedule,

        enableNotifications,
        sendTestNotification,

        checkFeedAlarm,

        applyTheme,

        exportBackup,
        restoreBackupFile
    };

    /* =======================================================
       START
       ======================================================= */

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initialiseApp,
            {
                once: true
            }
        );
    } else {
        initialiseApp();
    }

})();


/* =========================================================
   POULTRY MANAGER
   Main Application Script
   Part 2
   Supporting compatibility + UI helpers
   ========================================================= */

(() => {
    "use strict";

    /*
     * This block intentionally does NOT create another
     * application system.
     *
     * It only provides small compatibility helpers for
     * existing HTML/CSS that may use older class names.
     */

    const PM =
        window.PoultryManager || {};

    /* =======================================================
       SAFE DOM HELPERS
       ======================================================= */

    function getElement(
        ...selectors
    ) {
        for (const selector of selectors) {
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

    /* =======================================================
       LEGACY BUTTON COMPATIBILITY
       ======================================================= */

    function connectLegacyButton(
        selectors,
        callback
    ) {
        const element =
            getElement(...selectors);

        if (
            !element ||
            element.dataset.pmConnected ===
                "true"
        ) {
            return;
        }

        element.dataset.pmConnected =
            "true";

        element.addEventListener(
            "click",
            callback
        );
    }

    /* =======================================================
       COMPATIBILITY INITIALISATION
       ======================================================= */

    function setupCompatibility() {
        /*
         * Some older versions of the HTML used slightly
         * different button IDs. Connect them only if
         * present, without creating duplicate listeners
         * on the current IDs.
         */

        connectLegacyButton(
            [
                "#dashboardNavButton",
                "#dashboardButton"
            ],
            () => {
                if (
                    typeof PM.showDashboard ===
                    "function"
                ) {
                    PM.showDashboard();
                }
            }
        );

        connectLegacyButton(
            [
                "#settingsNavButton",
                "#settingsButton"
            ],
            () => {
                if (
                    typeof PM.showSettings ===
                    "function"
                ) {
                    PM.showSettings();
                }
            }
        );

        connectLegacyButton(
            [
                "#pmSettingsNotificationsButton"
            ],
            async () => {
                if (
                    typeof PM.enableNotifications !==
                    "function"
                ) {
                    return;
                }

                try {
                    await PM.enableNotifications();

                    alert(
                        "Notifications are enabled."
                    );
                } catch (error) {
                    alert(
                        error.message ||
                        "Notifications could not be enabled."
                    );
                }
            }
        );

        connectLegacyButton(
            [
                "#pmSettingsExportButton"
            ],
            () => {
                if (
                    typeof PM.exportBackup ===
                    "function"
                ) {
                    PM.exportBackup();
                }
            }
        );

        connectLegacyButton(
            [
                "#pmSettingsRestoreButton"
            ],
            () => {
                const input =
                    getElement(
                        "#pmSettingsRestoreInput"
                    );

                input?.click();
            }
        );

        const restoreInput =
            getElement(
                "#pmSettingsRestoreInput"
            );

        if (
            restoreInput &&
            restoreInput.dataset.pmConnected !==
                "true"
        ) {
            restoreInput.dataset.pmConnected =
                "true";

            restoreInput.addEventListener(
                "change",
                event => {
                    const file =
                        event.target.files?.[0];

                    if (
                        file &&
                        typeof PM.restoreBackupFile ===
                            "function"
                    ) {
                        PM.restoreBackupFile(
                            file
                        );
                    }

                    event.target.value = "";
                }
            );
        }
    }

    /* =======================================================
       VISIBILITY SAFETY
       ======================================================= */

    function preventOldSectionCollision() {
        const dashboard =
            document.querySelector(
                "#pmDashboardView"
            );

        const settings =
            document.querySelector(
                "#pmSettingsView"
            );

        if (!dashboard || !settings) {
            return;
        }

        /*
         * The old navigation system sometimes hid individual
         * sections instead of the entire view. The current
         * system always treats Dashboard and Settings as
         * separate pages.
         */

        const current =
            localStorage.getItem(
                "poultryManagerView"
            );

        if (current === "settings") {
            dashboard.style.display =
                "none";

            settings.style.display =
                "";
        } else {
            dashboard.style.display =
                "";

            settings.style.display =
                "none";
        }
    }

    /* =======================================================
       STORAGE EVENT
       ======================================================= */

    window.addEventListener(
        "storage",
        event => {
            if (!event.key) {
                return;
            }

            if (
                [
                    "flockCount",
                    "eggHistory",
                    "feed",
                    "feedUsageHistory",
                    "feedAdditionHistory",
                    "feedingSchedule",
                    "feedAlarmEnabled",
                    "notificationsEnabled",
                    "poultryManagerTheme",
                    "automaticBackupEnabled"
                ].includes(event.key)
            ) {
                if (
                    typeof PM.refresh ===
                    "function"
                ) {
                    PM.refresh();
                }
            }
        }
    );

    /* =======================================================
       PAGE VISIBILITY
       ======================================================= */

    document.addEventListener(
        "visibilitychange",
        () => {
            if (
                document.visibilityState ===
                "visible"
            ) {
                if (
                    typeof PM.refresh ===
                    "function"
                ) {
                    PM.refresh();
                }
            }
        }
    );

    /* =======================================================
       RESIZE SUPPORT
       ======================================================= */

    let resizeTimer = null;

    window.addEventListener(
        "resize",
        () => {
            clearTimeout(
                resizeTimer
            );

            resizeTimer =
                setTimeout(
                    () => {
                        if (
                            typeof PM.refresh ===
                            "function"
                        ) {
                            PM.refresh();
                        }
                    },
                    150
                );
        }
    );

    /* =======================================================
       KEYBOARD ACCESSIBILITY
       ======================================================= */

    document.addEventListener(
        "keydown",
        event => {
            /*
             * Escape returns the user to Dashboard.
             * This is intentionally lightweight and does
             * not interfere with inputs.
             */
            if (
                event.key === "Escape" &&
                document.activeElement?.matches(
                    "input, textarea, select"
                ) === false
            ) {
                if (
                    typeof PM.showDashboard ===
                    "function"
                ) {
                    PM.showDashboard();
                }
            }
        }
    );

    /* =======================================================
       APP READY
       ======================================================= */

    function finishCompatibilitySetup() {
        setupCompatibility();

        preventOldSectionCollision();

        /*
         * Run once more after the main application has had
         * time to create Settings/navigation.
         */
        setTimeout(
            () => {
                setupCompatibility();
                preventOldSectionCollision();
            },
            250
        );
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            finishCompatibilitySetup,
            {
                once: true
            }
        );
    } else {
        finishCompatibilitySetup();
    }

})();
