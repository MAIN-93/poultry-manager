/* =========================================================
   POULTRY MANAGER
   Main Application Script
   Version: 3.0
   ========================================================= */

(() => {
    "use strict";

    /* =========================================================
       1. APP CONFIG
       ========================================================= */

    const APP = {
        name: "Poultry Manager",
        version: "3.0",
        backend: "https://poultry-manager-hppo.onrender.com",
        storageVersion: 3
    };

    const STORAGE = {
        flock: "flockCount",
        eggHistory: "eggHistory",

        feed: "feed",
        feedUsageHistory: "feedUsageHistory",
        feedAdditionHistory: "feedAdditionHistory",

        feedingSchedule: "feedingSchedule",

        alarmEnabled: "feedAlarmEnabled",
        notificationsEnabled: "notificationsEnabled",

        theme: "poultryManagerTheme",
        automaticBackup: "automaticBackupEnabled",

        lastBackup: "poultryManagerLastBackup",

        settingsView: "poultryManagerView"
    };

    const DEFAULTS = {
        flock: 5,
        feed: 0,
        morningFeed: "07:00",
        afternoonFeed: "18:00",
        alarmEnabled: true,
        notificationsEnabled: false,
        automaticBackup: true,
        theme: "system"
    };

    const $ = (selector) => document.querySelector(selector);

    const byId = (id) => document.getElementById(id);

    /* =========================================================
       2. BASIC HELPERS
       ========================================================= */

    function todayKey(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function formatDate(dateString) {
        if (!dateString) return "—";

        const date = new Date(`${dateString}T00:00:00`);

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }

    function formatShortDate(dateString) {
        if (!dateString) return "—";

        const date = new Date(`${dateString}T00:00:00`);

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric"
        });
    }

    function number(value, fallback = 0) {
        const result = Number(value);

        return Number.isFinite(result) ? result : fallback;
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function round(value, decimals = 1) {
        const multiplier = 10 ** decimals;

        return Math.round(number(value) * multiplier) / multiplier;
    }

    function formatKg(value) {
        return `${round(value, 1).toFixed(1)} kg`;
    }

    function formatGrams(value) {
        return `${Math.round(number(value))} g`;
    }

    function escapeHTML(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    /* =========================================================
       3. STORAGE HELPERS
       ========================================================= */

    function getStorage(key, fallback = null) {
        try {
            const value = localStorage.getItem(key);

            return value === null ? fallback : value;
        } catch (error) {
            console.error("Poultry Manager storage read error:", error);
            return fallback;
        }
    }

    function setStorage(key, value) {
        try {
            localStorage.setItem(key, value);
            scheduleAutomaticBackup();
            return true;
        } catch (error) {
            console.error("Poultry Manager storage write error:", error);
            return false;
        }
    }

    function removeStorage(key) {
        try {
            localStorage.removeItem(key);
            scheduleAutomaticBackup();
        } catch (error) {
            console.error("Poultry Manager storage remove error:", error);
        }
    }

    function getJSON(key, fallback) {
        try {
            const value = localStorage.getItem(key);

            if (!value) {
                return fallback;
            }

            const parsed = JSON.parse(value);

            return parsed ?? fallback;
        } catch (error) {
            console.error(`Poultry Manager JSON error for ${key}:`, error);
            return fallback;
        }
    }

    function setJSON(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            scheduleAutomaticBackup();
            return true;
        } catch (error) {
            console.error(`Poultry Manager JSON write error for ${key}:`, error);
            return false;
        }
    }

    /* =========================================================
       4. POULTRY DATA
       ========================================================= */

    function getFlockCount() {
        const value = number(getStorage(STORAGE.flock), DEFAULTS.flock);

        return Math.max(0, Math.round(value));
    }

    function setFlockCount(value) {
        const flock = Math.max(0, Math.round(number(value)));

        setStorage(STORAGE.flock, String(flock));

        refreshAll();
    }

    function getEggHistory() {
        const history = getJSON(STORAGE.eggHistory, {});

        if (!history || typeof history !== "object" || Array.isArray(history)) {
            return {};
        }

        return history;
    }

    function saveEggHistory(history) {
        setJSON(STORAGE.eggHistory, history);
    }

    function getTodayEggs() {
        const history = getEggHistory();

        return Math.max(0, Math.round(number(history[todayKey()])));
    }

    function getEggsForDate(dateString) {
        const history = getEggHistory();

        return Math.max(0, Math.round(number(history[dateString])));
    }

    function getTodayLayingRate() {
        const flock = getFlockCount();

        if (flock <= 0) {
            return 0;
        }

        return clamp((getTodayEggs() / flock) * 100, 0, 100);
    }

    function addEggs(amount = 1) {
        const quantity = Math.max(1, Math.round(number(amount, 1)));
        const history = getEggHistory();
        const key = todayKey();

        history[key] = Math.max(0, Math.round(number(history[key]))) + quantity;

        saveEggHistory(history);

        refreshAll();

        return history[key];
    }

    function removeEggs(amount = 1) {
        const quantity = Math.max(1, Math.round(number(amount, 1)));
        const history = getEggHistory();
        const key = todayKey();

        const current = Math.max(0, Math.round(number(history[key])));

        history[key] = Math.max(0, current - quantity);

        if (history[key] <= 0) {
            delete history[key];
        }

        saveEggHistory(history);

        refreshAll();

        return history[key] || 0;
    }

    /* =========================================================
       5. FEED DATA
       ========================================================= */

    function getFeedAmount() {
        return Math.max(0, number(getStorage(STORAGE.feed), DEFAULTS.feed));
    }

    function setFeedAmount(amount) {
        const value = Math.max(0, round(number(amount), 3));

        setStorage(STORAGE.feed, String(value));

        refreshAll();
    }

    function getFeedUsageHistory() {
        const history = getJSON(STORAGE.feedUsageHistory, {});

        if (!history || typeof history !== "object" || Array.isArray(history)) {
            return {};
        }

        return history;
    }

    function saveFeedUsageHistory(history) {
        setJSON(STORAGE.feedUsageHistory, history);
    }

    function getFeedAdditionHistory() {
        const history = getJSON(STORAGE.feedAdditionHistory, []);

        return Array.isArray(history) ? history : [];
    }

    function saveFeedAdditionHistory(history) {
        setJSON(STORAGE.feedAdditionHistory, history);
    }

    function getTodayFeedUsage() {
        const history = getFeedUsageHistory();

        return Math.max(0, number(history[todayKey()]));
    }

    function getFeedDailyAverage() {
        const history = getFeedUsageHistory();
        const dates = Object.keys(history);

        if (!dates.length) {
            return 0;
        }

        const values = dates
            .map((date) => number(history[date]))
            .filter((value) => value > 0);

        if (!values.length) {
            return 0;
        }

        return values.reduce((sum, value) => sum + value, 0) / values.length;
    }

    function addFeed(amountKg) {
        const amount = number(amountKg);

        if (amount <= 0) {
            return false;
        }

        const current = getFeedAmount();
        const next = round(current + amount, 3);

        setStorage(STORAGE.feed, String(next));

        const history = getFeedAdditionHistory();

        history.push({
            amount: round(amount, 3),
            timestamp: new Date().toISOString(),
            stockBefore: current,
            stockAfter: next
        });

        saveFeedAdditionHistory(history);

        refreshAll();

        return true;
    }

    function recordFeedUsage(amountKg) {
        const amount = number(amountKg);

        if (amount <= 0) {
            return false;
        }

        const currentStock = getFeedAmount();

        if (amount > currentStock) {
            alert("You cannot record more feed usage than the available feed stock.");
            return false;
        }

        const nextStock = round(currentStock - amount, 3);

        setStorage(STORAGE.feed, String(nextStock));

        const history = getFeedUsageHistory();
        const key = todayKey();

        history[key] = round(number(history[key]) + amount, 3);

        saveFeedUsageHistory(history);

        refreshAll();

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
         * Only undo if the stock has not changed since the addition.
         * This prevents an old addition from accidentally removing
         * feed that has already been used or changed.
         */
        if (Math.abs(currentStock - number(last.stockAfter)) > 0.01) {
            alert(
                "The last feed addition cannot be undone because the feed stock has changed since then."
            );

            return false;
        }

        setStorage(
            STORAGE.feed,
            String(Math.max(0, round(number(last.stockBefore), 3)))
        );

        history.pop();

        saveFeedAdditionHistory(history);

        refreshAll();

        return true;
    }

    function resetFeedStock() {
        const confirmed = confirm(
            "Reset the entire current feed stock to 0.0 kg?"
        );

        if (!confirmed) {
            return false;
        }

        setStorage(STORAGE.feed, "0");

        saveFeedAdditionHistory([]);

        refreshAll();

        return true;
    }

    function resetTodayFeedUsage() {
        const history = getFeedUsageHistory();
        const key = todayKey();

        const todayUsage = number(history[key]);

        if (todayUsage <= 0) {
            alert("There is no feed usage recorded for today.");
            return false;
        }

        const currentStock = getFeedAmount();

        setStorage(
            STORAGE.feed,
            String(round(currentStock + todayUsage, 3))
        );

        delete history[key];

        saveFeedUsageHistory(history);

        refreshAll();

        return true;
    }

    /* =========================================================
       6. PRODUCTION DATA
       ========================================================= */

    function getLastSevenDates() {
        const dates = [];

        for (let index = 6; index >= 0; index--) {
            const date = new Date();

            date.setDate(date.getDate() - index);

            dates.push(todayKey(date));
        }

        return dates;
    }

    function getLastSevenEggs() {
        return getLastSevenDates().map((date) => ({
            date,
            eggs: getEggsForDate(date)
        }));
    }

    function getSevenDayEggTotal() {
        return getLastSevenEggs().reduce(
            (total, item) => total + item.eggs,
            0
        );
    }

    function getAverageLayingRate() {
        const flock = getFlockCount();

        if (flock <= 0) {
            return 0;
        }

        const total = getSevenDayEggTotal();

        return (total / (flock * 7)) * 100;
    }

    function getBestProductionDay() {
        const days = getLastSevenEggs();

        if (!days.length) {
            return {
                date: null,
                eggs: 0
            };
        }

        return days.reduce((best, current) => {
            return current.eggs > best.eggs ? current : best;
        });
    }

    function getLowestProductionDay() {
        const days = getLastSevenEggs();

        if (!days.length) {
            return {
                date: null,
                eggs: 0
            };
        }

        return days.reduce((lowest, current) => {
            return current.eggs < lowest.eggs ? current : lowest;
        });
    }

    /* =========================================================
       7. DASHBOARD — FARM OVERVIEW
       ========================================================= */

    function refreshFarmOverview() {
        const flockElement = byId("farmOverviewFlock");
        const eggsElement = byId("farmOverviewEggs");
        const rateElement = byId("farmOverviewLayingRate");
        const feedElement = byId("farmOverviewFeed");
        const nextFeedElement = byId("farmOverviewNextFeed");

        const flock = getFlockCount();
        const eggs = getTodayEggs();
        const rate = getTodayLayingRate();
        const feed = getFeedAmount();

        if (flockElement) {
            flockElement.textContent = flock;
        }

        if (eggsElement) {
            eggsElement.textContent = eggs;
        }

        if (rateElement) {
            rateElement.textContent = `${Math.round(rate)}%`;
        }

        if (feedElement) {
            feedElement.textContent = formatKg(feed);
        }

        if (nextFeedElement) {
            nextFeedElement.textContent = getNextFeedLabel();
        }
    }

    /* =========================================================
       8. DASHBOARD — EGG PRODUCTION
       ========================================================= */

    function refreshEggProduction() {
        const eggCount = byId("eggCount");
        const layingRate = byId("layingRate");

        const eggs = getTodayEggs();
        const rate = getTodayLayingRate();

        if (eggCount) {
            eggCount.textContent = eggs;
        }

        if (layingRate) {
            layingRate.textContent = `${Math.round(rate)}%`;
        }

        renderEggHistory();
    }

    function renderEggHistory() {
        const container = byId("eggHistoryList");

        if (!container) {
            return;
        }

        const history = getEggHistory();

        const dates = Object.keys(history)
            .filter((date) => number(history[date]) > 0)
            .sort()
            .reverse();

        if (!dates.length) {
            container.innerHTML = `
                <div class="pm-empty-state">
                    <strong>No egg history yet</strong>
                    <span>Your recorded production will appear here.</span>
                </div>
            `;

            return;
        }

        const flock = getFlockCount();

        container.innerHTML = dates
            .map((date) => {
                const eggs = Math.max(0, Math.round(number(history[date])));
                const rate =
                    flock > 0
                        ? Math.round(clamp((eggs / flock) * 100, 0, 100))
                        : 0;

                const label =
                    date === todayKey()
                        ? "Today"
                        : formatShortDate(date);

                return `
                    <div class="egg-history-item">
                        <div class="egg-history-date">
                            <strong>${escapeHTML(label)}</strong>
                            <span>${escapeHTML(formatDate(date))}</span>
                        </div>

                        <div class="egg-history-result">
                            <strong>${eggs} egg${eggs === 1 ? "" : "s"}</strong>
                            <span>${rate}% laying rate</span>
                        </div>
                    </div>
                `;
            })
            .join("");
    }

    /* =========================================================
       9. DASHBOARD — PRODUCTION SUMMARY
       ========================================================= */

    function refreshProductionSummary() {
        const sevenDayEggs = byId("sevenDayEggs");
        const averageLayingRate = byId("averageLayingRate");
        const bestProductionDay = byId("bestProductionDay");
        const bestProductionEggs = byId("bestProductionEggs");

        const total = getSevenDayEggTotal();
        const average = getAverageLayingRate();
        const best = getBestProductionDay();

        if (sevenDayEggs) {
            sevenDayEggs.textContent = total;
        }

        if (averageLayingRate) {
            averageLayingRate.textContent = `${Math.round(average)}%`;
        }

        if (bestProductionDay) {
            bestProductionDay.textContent =
                best.date ? formatShortDate(best.date) : "—";
        }

        if (bestProductionEggs) {
            bestProductionEggs.textContent =
                `${best.eggs} egg${best.eggs === 1 ? "" : "s"}`;
        }
    }

    /* =========================================================
       10. DASHBOARD — PRODUCTION TREND
       ========================================================= */

    function renderProductionTrend() {
        const chart = byId("productionTrendChart");

        if (!chart) {
            return;
        }

        const data = getLastSevenEggs();
        const maxEggs = Math.max(
            1,
            ...data.map((item) => item.eggs)
        );

        const maxLabel = byId("trendMaxLabel");
        const midLabel = byId("trendMidLabel");

        if (maxLabel) {
            maxLabel.textContent = maxEggs;
        }

        if (midLabel) {
            midLabel.textContent = Math.round(maxEggs / 2);
        }

        /*
         * Supports an existing chart structure if present.
         */
        const bars = chart.querySelectorAll(
            ".production-bar, .trend-bar, [data-trend-bar]"
        );

        if (bars.length) {
            data.forEach((item, index) => {
                const bar = bars[index];

                if (!bar) {
                    return;
                }

                const height =
                    maxEggs > 0
                        ? (item.eggs / maxEggs) * 100
                        : 0;

                bar.style.height = `${Math.max(height, item.eggs > 0 ? 8 : 2)}%`;

                bar.setAttribute("aria-label", `${item.eggs} eggs`);

                const value = bar.querySelector(
                    ".trend-bar-value, .production-bar-value"
                );

                const label = bar.querySelector(
                    ".trend-bar-label, .production-bar-label"
                );

                if (value) {
                    value.textContent = item.eggs;
                }

                if (label) {
                    label.textContent =
                        item.date === todayKey()
                            ? "Today"
                            : formatShortDate(item.date);
                }
            });

            return;
        }

        /*
         * If the chart container is empty, create a lightweight
         * responsive chart without requiring another library.
         */
        chart.innerHTML = `
            <div class="pm-trend-grid">
                ${data
                    .map((item) => {
                        const height =
                            maxEggs > 0
                                ? (item.eggs / maxEggs) * 100
                                : 0;

                        return `
                            <div class="pm-trend-column">
                                <div class="pm-trend-value">
                                    ${item.eggs}
                                </div>

                                <div class="pm-trend-track">
                                    <div
                                        class="pm-trend-bar"
                                        style="height:${Math.max(
                                            height,
                                            item.eggs > 0 ? 8 : 2
                                        )}%"
                                    ></div>
                                </div>

                                <div class="pm-trend-date">
                                    ${
                                        item.date === todayKey()
                                            ? "Today"
                                            : formatShortDate(item.date)
                                    }
                                </div>
                            </div>
                        `;
                    })
                    .join("")}
            </div>
        `;
    }

    /* =========================================================
       11. DASHBOARD — ANALYTICS
       ========================================================= */

    function refreshAnalytics() {
        const flock = getFlockCount();
        const total = getSevenDayEggTotal();

        const eggsPerHen = flock > 0 ? total / flock : 0;
        const average = getAverageLayingRate();

        const highest = getBestProductionDay();
        const lowest = getLowestProductionDay();

        const days = getLastSevenEggs();

        let consistency = 0;

        if (days.length) {
            const values = days.map((day) => day.eggs);
            const averageEggs =
                values.reduce((sum, value) => sum + value, 0) /
                values.length;

            if (averageEggs > 0) {
                const variance =
                    values.reduce(
                        (sum, value) =>
                            sum + (value - averageEggs) ** 2,
                        0
                    ) / values.length;

                const standardDeviation = Math.sqrt(variance);

                consistency = clamp(
                    100 -
                        (standardDeviation / averageEggs) * 100,
                    0,
                    100
                );
            }
        }

        const previousSeven = getPreviousSevenEggs();
        const previousTotal = previousSeven.reduce(
            (sum, item) => sum + item.eggs,
            0
        );

        let change = 0;

        if (previousTotal > 0) {
            change =
                ((total - previousTotal) / previousTotal) * 100;
        }

        const insight =
            average >= 80
                ? "Excellent production. Your flock is performing strongly."
                : average >= 60
                    ? "Good production. Keep feed, water and routine consistent."
                    : average >= 40
                        ? "Production is moderate. Watch the flock and daily routine."
                        : "Production is low. Check feed, water, stress and flock condition.";

        setText("analyticsEggsPerHen", eggsPerHen.toFixed(1));
        setText("analyticsAverage", `${Math.round(average)}%`);
        setText("analyticsHighestDay", highest.eggs);
        setText(
            "analyticsHighestDayDate",
            highest.date ? formatShortDate(highest.date) : "—"
        );
        setText("analyticsLowestDay", lowest.eggs);
        setText(
            "analyticsLowestDayDate",
            lowest.date ? formatShortDate(lowest.date) : "—"
        );
        setText(
            "analyticsConsistency",
            `${Math.round(consistency)}%`
        );

        const changeElement = byId("analyticsChange");

        if (changeElement) {
            const roundedChange = Math.round(change);

            changeElement.textContent =
                roundedChange > 0
                    ? `+${roundedChange}%`
                    : `${roundedChange}%`;
        }

        setText("analyticsInsight", insight);
    }

    function getPreviousSevenEggs() {
        const result = [];

        for (let index = 14; index >= 8; index--) {
            const date = new Date();

            date.setDate(date.getDate() - index);

            const key = todayKey(date);

            result.push({
                date: key,
                eggs: getEggsForDate(key)
            });
        }

        return result;
    }

    function setText(id, value) {
        const element = byId(id);

        if (element) {
            element.textContent = value;
        }
    }

    /* =========================================================
       12. FEED DASHBOARD
       ========================================================= */

    function refreshFeedManagement() {
        const stock = getFeedAmount();
        const usageToday = getTodayFeedUsage();
        const average = getFeedDailyAverage();
        const flock = getFlockCount();

        const feedAmount = byId("feedAmount");
        const feedUsedToday = byId("feedUsedToday");
        const feedDailyAverage = byId("feedDailyAverage");
        const feedDaysRemaining = byId("feedDaysRemaining");
        const feedDaysRemainingText = byId("feedDaysRemainingText");
        const feedPerBird = byId("feedPerBird");
        const feedSevenDayUsage = byId("feedSevenDayUsage");
        const feedUsageDays = byId("feedUsageDays");

        const daysRemaining =
            average > 0 ? stock / average : 0;

        const feedPerBirdValue =
            flock > 0 && usageToday > 0
                ? usageToday * 1000 / flock
                : 0;

        if (feedAmount) {
            feedAmount.textContent = formatKg(stock);
        }

        if (feedUsedToday) {
            feedUsedToday.textContent = formatKg(usageToday);
        }

        if (feedDailyAverage) {
            feedDailyAverage.textContent = formatKg(average);
        }

        if (feedDaysRemaining) {
            feedDaysRemaining.textContent =
                average > 0
                    ? daysRemaining.toFixed(1)
                    : "—";
        }

        if (feedDaysRemainingText) {
            feedDaysRemainingText.textContent =
                average > 0
                    ? `${daysRemaining.toFixed(1)} days remaining`
                    : "Record usage to estimate remaining days";
        }

        if (feedPerBird) {
            feedPerBird.textContent =
                feedPerBirdValue > 0
                    ? `${Math.round(feedPerBirdValue)} g`
                    : "—";
        }

        const sevenDayUsage = getSevenDayFeedUsage();

        if (feedSevenDayUsage) {
            feedSevenDayUsage.textContent =
                formatKg(sevenDayUsage.total);
        }

        if (feedUsageDays) {
            feedUsageDays.textContent =
                sevenDayUsage.days;
        }

        renderFeedUsageChart();
        renderFeedHistory();
    }

    function getSevenDayFeedUsage() {
        const history = getFeedUsageHistory();
        const dates = getLastSevenDates();

        let total = 0;
        let days = 0;

        dates.forEach((date) => {
            const amount = number(history[date]);

            if (amount > 0) {
                days++;
                total += amount;
            }
        });

        return {
            total,
            days
        };
    }

    function renderFeedUsageChart() {
        const chart = byId("feedConsumptionChart");

        if (!chart) {
            return;
        }

        const history = getFeedUsageHistory();

        const data = getLastSevenDates().map((date) => ({
            date,
            amount: number(history[date])
        }));

        const max = Math.max(
            0.1,
            ...data.map((item) => item.amount)
        );

        const bars = chart.querySelectorAll(
            ".feed-bar, .feed-usage-bar, [data-feed-bar]"
        );

        if (bars.length) {
            data.forEach((item, index) => {
                const bar = bars[index];

                if (!bar) return;

                const height =
                    (item.amount / max) * 100;

                bar.style.height =
                    `${Math.max(height, item.amount > 0 ? 8 : 2)}%`;

                bar.setAttribute(
                    "aria-label",
                    `${formatKg(item.amount)} used`
                );
            });

            return;
        }

        chart.innerHTML = `
            <div class="pm-trend-grid pm-feed-chart-grid">
                ${data
                    .map((item) => {
                        const height =
                            (item.amount / max) * 100;

                        return `
                            <div class="pm-trend-column">
                                <div class="pm-trend-value">
                                    ${item.amount > 0
                                        ? round(item.amount, 1)
                                        : 0}
                                </div>

                                <div class="pm-trend-track">
                                    <div
                                        class="pm-trend-bar"
                                        style="height:${Math.max(
                                            height,
                                            item.amount > 0 ? 8 : 2
                                        )}%"
                                    ></div>
                                </div>

                                <div class="pm-trend-date">
                                    ${
                                        item.date === todayKey()
                                            ? "Today"
                                            : formatShortDate(item.date)
                                    }
                                </div>
                            </div>
                        `;
                    })
                    .join("")}
            </div>
        `;
    }

    function renderFeedHistory() {
        const container = byId("feedHistoryList");

        if (!container) {
            return;
        }

        const usageHistory = getFeedUsageHistory();

        const dates = Object.keys(usageHistory)
            .filter((date) => number(usageHistory[date]) > 0)
            .sort()
            .reverse();

        if (!dates.length) {
            container.innerHTML = `
                <div class="pm-empty-state">
                    <strong>No feed usage history yet</strong>
                    <span>Recorded feed usage will appear here.</span>
                </div>
            `;

            return;
        }

        container.innerHTML = dates
            .map((date) => {
                const amount = number(usageHistory[date]);

                return `
                    <div class="feed-history-item">
                        <div>
                            <strong>
                                ${
                                    date === todayKey()
                                        ? "Today"
                                        : escapeHTML(formatShortDate(date))
                                }
                            </strong>

                            <span>
                                ${escapeHTML(formatDate(date))}
                            </span>
                        </div>

                        <strong>${formatKg(amount)}</strong>
                    </div>
                `;
            })
            .join("");
    }

    /* =========================================================
       13. FEED SCHEDULE
       ========================================================= */

    function getFeedSchedule() {
        const schedule = getJSON(
            STORAGE.feedingSchedule,
            {
                morning: DEFAULTS.morningFeed,
                afternoon: DEFAULTS.afternoonFeed
            }
        );

        return {
            morning:
                schedule?.morning ||
                DEFAULTS.morningFeed,

            afternoon:
                schedule?.afternoon ||
                DEFAULTS.afternoonFeed
        };
    }

    async function saveFeedSchedule(morning, afternoon) {
        const schedule = {
            morning: morning || DEFAULTS.morningFeed,
            afternoon: afternoon || DEFAULTS.afternoonFeed
        };

        setJSON(STORAGE.feedingSchedule, schedule);

        try {
            await fetch(`${APP.backend}/schedule`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(schedule)
            });
        } catch (error) {
            console.warn(
                "Poultry Manager: schedule backend sync unavailable.",
                error
            );
        }

        refreshSettings();
        refreshFarmOverview();

        return true;
    }

    function getNextFeedTime() {
        const schedule = getFeedSchedule();

        const now = new Date();

        const candidates = [
            {
                type: "Morning",
                time: schedule.morning
            },
            {
                type: "Afternoon",
                time: schedule.afternoon
            }
        ];

        const todayCandidates = candidates
            .map((item) => {
                const [hours, minutes] =
                    String(item.time)
                        .split(":")
                        .map(Number);

                const date = new Date(now);

                date.setHours(
                    number(hours),
                    number(minutes),
                    0,
                    0
                );

                return {
                    ...item,
                    date
                };
            })
            .filter((item) => item.date > now);

        if (todayCandidates.length) {
            return todayCandidates.sort(
                (a, b) => a.date - b.date
            )[0];
        }

        const tomorrow = new Date(now);

        tomorrow.setDate(tomorrow.getDate() + 1);

        const first = candidates[0];

        const [hours, minutes] =
            String(first.time)
                .split(":")
                .map(Number);

        tomorrow.setHours(
            number(hours),
            number(minutes),
            0,
            0
        );

        return {
            ...first,
            date: tomorrow
        };
    }

    function getNextFeedLabel() {
        const next = getNextFeedTime();

        if (!next) {
            return "Not set";
        }

        return `${next.type} • ${next.date.toLocaleTimeString(
            undefined,
            {
                hour: "numeric",
                minute: "2-digit"
            }
        )}`;
    }

    /* =========================================================
       14. FEED ALARM
       ========================================================= */

    function isFeedAlarmEnabled() {
        return getStorage(
            STORAGE.alarmEnabled,
            DEFAULTS.alarmEnabled ? "true" : "false"
        ) === "true";
    }

    function setFeedAlarmEnabled(enabled) {
        setStorage(
            STORAGE.alarmEnabled,
            enabled ? "true" : "false"
        );
    }

    let lastAlarmKey = null;

    function checkFeedAlarm() {
        if (!isFeedAlarmEnabled()) {
            return;
        }

        const schedule = getFeedSchedule();
        const now = new Date();

        const currentHours = String(now.getHours()).padStart(2, "0");
        const currentMinutes = String(now.getMinutes()).padStart(2, "0");

        const currentTime =
            `${currentHours}:${currentMinutes}`;

        const matchingTime =
            currentTime === schedule.morning
                ? "Morning"
                : currentTime === schedule.afternoon
                    ? "Afternoon"
                    : null;

        if (!matchingTime) {
            return;
        }

        const alarmKey =
            `${todayKey()}-${matchingTime}`;

        if (lastAlarmKey === alarmKey) {
            return;
        }

        lastAlarmKey = alarmKey;

        playFeedAlarm();

        if (isNotificationsEnabled()) {
            sendFeedNotification(matchingTime);
        }
    }

    function playFeedAlarm() {
        try {
            if (!window.AudioContext && !window.webkitAudioContext) {
                return;
            }

            const AudioContextClass =
                window.AudioContext ||
                window.webkitAudioContext;

            const context = new AudioContextClass();

            const oscillator =
                context.createOscillator();

            const gain =
                context.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = 880;

            gain.gain.value = 0.05;

            oscillator.connect(gain);
            gain.connect(context.destination);

            oscillator.start();

            setTimeout(() => {
                oscillator.stop();
                context.close();
            }, 700);
        } catch (error) {
            console.warn(
                "Poultry Manager: alarm sound unavailable.",
                error
            );
        }
    }

    /* =========================================================
       15. NOTIFICATIONS
       ========================================================= */

    function isNotificationsEnabled() {
        return (
            getStorage(
                STORAGE.notificationsEnabled,
                "false"
            ) === "true"
        );
    }

    async function getVapidPublicKey() {
        const response = await fetch(
            `${APP.backend}/vapid-public-key`
        );

        if (!response.ok) {
            throw new Error(
                "Unable to retrieve notification key."
            );
        }

        const data = await response.json();

        return data.publicKey || data.vapidPublicKey;
    }

    function urlBase64ToUint8Array(base64String) {
        const padding = "=".repeat(
            (4 - (base64String.length % 4)) % 4
        );

        const base64 =
            (base64String + padding)
                .replace(/-/g, "+")
                .replace(/_/g, "/");

        const rawData = window.atob(base64);

        return Uint8Array.from(
            [...rawData].map((char) =>
                char.charCodeAt(0)
            )
        );
    }

    async function enableNotifications() {
        if (!("Notification" in window)) {
            throw new Error(
                "This browser does not support notifications."
            );
        }

        if (!("serviceWorker" in navigator)) {
            throw new Error(
                "Service workers are not supported."
            );
        }

        const permission =
            await Notification.requestPermission();

        if (permission !== "granted") {
            throw new Error(
                "Notification permission was not granted."
            );
        }

        const registration =
            await registerServiceWorker();

        const publicKey =
            await getVapidPublicKey();

        let subscription =
            await registration.pushManager.getSubscription();

        if (!subscription) {
            subscription =
                await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey:
                        urlBase64ToUint8Array(publicKey)
                });
        }

        const response = await fetch(
            `${APP.backend}/subscribe`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(subscription)
            }
        );

        if (!response.ok) {
            throw new Error(
                "Subscription could not be saved."
            );
        }

        setStorage(
            STORAGE.notificationsEnabled,
            "true"
        );

        refreshSettings();

        return true;
    }

    async function sendFeedNotification(type) {
        try {
            await fetch(
                `${APP.backend}/send-test`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: "Poultry Manager",
                        body: `${type} feeding time.`
                    })
                }
            );
        } catch (error) {
            console.warn(
                "Poultry Manager notification error:",
                error
            );
        }
    }

    async function testNotification() {
        if (!isNotificationsEnabled()) {
            await enableNotifications();
        }

        await sendFeedNotification("Test");

        alert("Test notification sent.");
    }

    /* =========================================================
       16. SERVICE WORKER
       ========================================================= */

    let serviceWorkerRegistration = null;

    async function registerServiceWorker() {
        if (!("serviceWorker" in navigator)) {
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
            console.error(
                "Poultry Manager service worker registration failed:",
                error
            );

            return null;
        }
    }

    /* =========================================================
       17. SETTINGS VIEW
       ========================================================= */

    let settingsView = null;

    function ensureSettingsView() {
        settingsView =
            byId("pmSettingsView");

        if (settingsView) {
            return settingsView;
        }

        settingsView =
            document.createElement("section");

        settingsView.id = "pmSettingsView";
        settingsView.className = "pm-settings-view";

        settingsView.style.display = "none";

        document.body.appendChild(settingsView);

        buildSettingsView();

        return settingsView;
    }

    function buildSettingsView() {
        if (!settingsView) {
            return;
        }

        settingsView.innerHTML = `
            <div class="pm-settings-shell">

                <div class="pm-settings-header">
                    <div>
                        <span class="pm-section-eyebrow">
                            Control Center
                        </span>

                        <h2>Settings</h2>

                        <p>
                            Manage your flock, feeding schedule,
                            notifications, appearance and backups.
                        </p>
                    </div>
                </div>

                <section class="pm-settings-card">
                    <div class="pm-settings-card-header">
                        <div>
                            <h3>Flock Management</h3>
                            <p>
                                Set the number of birds currently
                                being managed.
                            </p>
                        </div>
                    </div>

                    <div class="pm-settings-row">
                        <label for="pmSettingsFlockInput">
                            Flock size
                        </label>

                        <input
                            id="pmSettingsFlockInput"
                            class="pm-settings-input"
                            type="number"
                            min="0"
                            step="1"
                            inputmode="numeric"
                        />

                        <button
                            id="pmSaveFlockButton"
                            class="pm-primary-button"
                            type="button"
                        >
                            Save
                        </button>
                    </div>
                </section>

                <section class="pm-settings-card">
                    <div class="pm-settings-card-header">
                        <div>
                            <h3>Feeding Schedule</h3>
                            <p>
                                Set your morning and afternoon
                                feeding times.
                            </p>
                        </div>
                    </div>

                    <div class="pm-settings-grid">

                        <div class="pm-settings-field">
                            <label for="pmMorningFeedInput">
                                Morning feeding
                            </label>

                            <input
                                id="pmMorningFeedInput"
                                class="pm-settings-input"
                                type="time"
                            />
                        </div>

                        <div class="pm-settings-field">
                            <label for="pmAfternoonFeedInput">
                                Afternoon feeding
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
                        class="pm-primary-button"
                        type="button"
                    >
                        Save Schedule
                    </button>
                </section>

                <section class="pm-settings-card">
                    <div class="pm-settings-card-header">
                        <div>
                            <h3>Alarms & Notifications</h3>
                            <p>
                                Control feeding reminders and
                                push notifications.
                            </p>
                        </div>
                    </div>

                    <div class="pm-settings-option">
                        <div>
                            <strong>Feed alarm</strong>
                            <span>
                                Alert you when a scheduled feeding
                                time arrives.
                            </span>
                        </div>

                        <label class="pm-switch">
                            <input
                                id="pmAlarmToggle"
                                type="checkbox"
                            />

                            <span class="pm-switch-slider"></span>
                        </label>
                    </div>

                    <div class="pm-settings-option">
                        <div>
                            <strong>Push notifications</strong>
                            <span id="pmNotificationStatus">
                                Notifications are not enabled.
                            </span>
                        </div>

                        <button
                            id="pmEnableNotificationsButton"
                            class="pm-secondary-button"
                            type="button"
                        >
                            Enable
                        </button>
                    </div>

                    <div class="pm-settings-option">
                        <div>
                            <strong>Test notification</strong>
                            <span>
                                Check that your push notification
                                setup is working.
                            </span>
                        </div>

                        <button
                            id="pmTestNotificationButton"
                            class="pm-secondary-button"
                            type="button"
                        >
                            Test
                        </button>
                    </div>
                </section>

                <section class="pm-settings-card">
                    <div class="pm-settings-card-header">
                        <div>
                            <h3>Appearance</h3>
                            <p>
                                Choose how Poultry Manager looks.
                            </p>
                        </div>
                    </div>

                    <div class="pm-settings-row">
                        <label for="pmThemeSelect">
                            Theme
                        </label>

                        <select
                            id="pmThemeSelect"
                            class="pm-settings-input"
                        >
                            <option value="system">
                                System
                            </option>

                            <option value="light">
                                Light
                            </option>

                            <option value="dark">
                                Dark
                            </option>
                        </select>
                    </div>
                </section>

                <section class="pm-settings-card">
                    <div class="pm-settings-card-header">
                        <div>
                            <h3>Backup & Restore</h3>
                            <p>
                                Protect your Poultry Manager data
                                and move it between devices.
                            </p>
                        </div>
                    </div>

                    <div class="pm-settings-option">
                        <div>
                            <strong>Automatic backup</strong>
                            <span>
                                Keep an automatic local backup of
                                your farm data.
                            </span>
                        </div>

                        <label class="pm-switch">
                            <input
                                id="pmAutomaticBackupToggle"
                                type="checkbox"
                            />

                            <span class="pm-switch-slider"></span>
                        </label>
                    </div>

                    <div class="pm-settings-actions">
                        <button
                            id="pmExportBackupButton"
                            class="pm-secondary-button"
                            type="button"
                        >
                            Export Backup
                        </button>

                        <button
                            id="pmImportBackupButton"
                            class="pm-secondary-button"
                            type="button"
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

                    <p
                        id="pmBackupStatus"
                        class="pm-settings-status"
                    ></p>
                </section>

                <section class="pm-settings-card pm-settings-about">
                    <div class="pm-settings-card-header">
                        <div>
                            <h3>About Poultry Manager</h3>
                            <p>
                                Your personal poultry management
                                dashboard.
                            </p>
                        </div>
                    </div>

                    <div class="pm-about-version">
                        Version ${APP.version}
                    </div>
                </section>

            </div>
        `;

        bindSettingsEvents();
        refreshSettings();
    }

    /* =========================================================
       18. SETTINGS REFRESH
       ========================================================= */

    function refreshSettings() {
        if (!settingsView) {
            return;
        }

        const flockInput =
            byId("pmSettingsFlockInput");

        const schedule =
            getFeedSchedule();

        const morningInput =
            byId("pmMorningFeedInput");

        const afternoonInput =
            byId("pmAfternoonFeedInput");

        const alarmToggle =
            byId("pmAlarmToggle");

        const notificationButton =
            byId("pmEnableNotificationsButton");

        const notificationStatus =
            byId("pmNotificationStatus");

        const themeSelect =
            byId("pmThemeSelect");

        const automaticBackupToggle =
            byId("pmAutomaticBackupToggle");

        if (flockInput) {
            flockInput.value = getFlockCount();
        }

        if (morningInput) {
            morningInput.value = schedule.morning;
        }

        if (afternoonInput) {
            afternoonInput.value = schedule.afternoon;
        }

        if (alarmToggle) {
            alarmToggle.checked =
                isFeedAlarmEnabled();
        }

        if (notificationButton) {
            notificationButton.textContent =
                isNotificationsEnabled()
                    ? "Enabled"
                    : "Enable";
        }

        if (notificationStatus) {
            notificationStatus.textContent =
                isNotificationsEnabled()
                    ? "Push notifications are enabled."
                    : "Notifications are not enabled.";
        }

        if (themeSelect) {
            themeSelect.value =
                getThemePreference();
        }

        if (automaticBackupToggle) {
            automaticBackupToggle.checked =
                getAutomaticBackupEnabled();
        }
    }

    /* =========================================================
       19. SETTINGS EVENTS
       ========================================================= */

    function bindSettingsEvents() {
        const flockSave =
            byId("pmSaveFlockButton");

        if (flockSave) {
            flockSave.addEventListener(
                "click",
                () => {
                    const input =
                        byId("pmSettingsFlockInput");

                    const value =
                        number(input?.value);

                    if (value < 0) {
                        return;
                    }

                    setFlockCount(value);

                    alert("Flock size saved.");
                }
            );
        }

        const scheduleSave =
            byId("pmSaveScheduleButton");

        if (scheduleSave) {
            scheduleSave.addEventListener(
                "click",
                async () => {
                    const morning =
                        byId("pmMorningFeedInput")?.value;

                    const afternoon =
                        byId("pmAfternoonFeedInput")?.value;

                    await saveFeedSchedule(
                        morning,
                        afternoon
                    );

                    alert("Feeding schedule saved.");
                }
            );
        }

        const alarmToggle =
            byId("pmAlarmToggle");

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
            byId("pmEnableNotificationsButton");

        if (notificationButton) {
            notificationButton.addEventListener(
                "click",
                async () => {
                    try {
                        notificationButton.disabled = true;
                        notificationButton.textContent =
                            "Enabling…";

                        await enableNotifications();

                        notificationButton.textContent =
                            "Enabled";
                    } catch (error) {
                        console.error(error);

                        alert(
                            error.message ||
                            "Notifications could not be enabled."
                        );

                        notificationButton.textContent =
                            "Enable";
                    } finally {
                        notificationButton.disabled = false;
                    }
                }
            );
        }

        if (testNotificationButton) {
    testNotificationButton.addEventListener(
        "click",
        async () => {
            try {
                testNotificationButton.disabled = true;

                await testNotification();

            } catch (error) {
                console.error(error);

                alert(
                    error.message ||
                    "Test notification failed."
                );
            } finally {
                testNotificationButton.disabled = false;
            }
        }
    );
}

        const themeSelect =
            byId("pmThemeSelect");

        if (themeSelect) {
            themeSelect.addEventListener(
                "change",
                () => {
                    applyTheme(themeSelect.value);
                }
            );
        }

        const automaticBackupToggle =
            byId("pmAutomaticBackupToggle");

        if (automaticBackupToggle) {
            automaticBackupToggle.addEventListener(
                "change",
                () => {
                    setAutomaticBackupEnabled(
                        automaticBackupToggle.checked
                    );
                }
            );
        }

        const exportButton =
            byId("pmExportBackupButton");

        if (exportButton) {
            exportButton.addEventListener(
                "click",
                exportBackup
            );
        }

        const importButton =
            byId("pmImportBackupButton");

        const backupFile =
            byId("pmBackupFileInput");

        if (importButton && backupFile) {
            importButton.addEventListener(
                "click",
                () => backupFile.click()
            );

            backupFile.addEventListener(
                "change",
                async () => {
                    const file =
                        backupFile.files?.[0];

                    if (!file) {
                        return;
                    }

                    await restoreBackupFile(file);

                    backupFile.value = "";
                }
            );
        }
    }

    /* =========================================================
       20. NAVIGATION
       ========================================================= */

    let dashboardView = null;
    let dashboardButton = null;
    let settingsButton = null;

    function setupNavigation() {
        dashboardView =
            byId("pmDashboardView");

        dashboardButton =
            byId("pmDashboardButton");

        settingsButton =
            byId("pmSettingsButton");

        /*
         * Compatibility with older navigation IDs.
         * These are only fallbacks; we do not create a second
         * navigation system.
         */
        if (!dashboardButton) {
            dashboardButton =
                byId("dashboardNavButton") ||
                byId("dashboardButton");
        }

        if (!settingsButton) {
            settingsButton =
                byId("settingsNavButton") ||
                byId("settingsButton");
        }

        ensureSettingsView();

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
    }

    function setDashboardVisibility(visible) {
        if (!dashboardView) {
            return;
        }

        dashboardView.style.display =
            visible ? "" : "none";
    }

    function showDashboard() {
        setDashboardVisibility(true);

        if (settingsView) {
            settingsView.classList.remove("active");
            settingsView.style.display = "none";
        }

        dashboardButton?.classList.add("active");
        settingsButton?.classList.remove("active");

        setStorage(
            STORAGE.settingsView,
            "dashboard"
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        refreshAll();
    }

    function showSettings() {
        setDashboardVisibility(false);

        ensureSettingsView();

        settingsView.classList.add("active");
        settingsView.style.display = "";

        dashboardButton?.classList.remove("active");
        settingsButton?.classList.add("active");

        setStorage(
            STORAGE.settingsView,
            "settings"
        );

        refreshSettings();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    /* =========================================================
       21. QUICK ACTIONS
       ========================================================= */

    function setupQuickActions() {
        const addEggButton =
            byId("quickAddEggs");

        if (addEggButton) {
            addEggButton.addEventListener(
                "click",
                () => addEggs(1)
            );
        }

        const quickFeed =
            byId("quickFeed");

        if (quickFeed) {
            quickFeed.addEventListener(
                "click",
                () => {
                    scrollToElement(
                        "feedInput"
                    );
                }
            );
        }

        const quickHistory =
            byId("quickHistory");

        if (quickHistory) {
            quickHistory.addEventListener(
                "click",
                () => {
                    scrollToElement(
                        "eggHistoryList"
                    );
                }
            );
        }
    }

    /* =========================================================
       22. FEED CONTROLS
       ========================================================= */

    function setupFeedControls() {
        const addButton =
            byId("addFeedButton");

        const addInput =
            byId("feedInput");

        if (addButton) {
            addButton.addEventListener(
                "click",
                () => {
                    const amount =
                        number(addInput?.value);

                    if (amount <= 0) {
                        alert(
                            "Enter a feed amount greater than 0."
                        );

                        return;
                    }

                    addFeed(amount);

                    if (addInput) {
                        addInput.value = "";
                    }
                }
            );
        }

        const useButton =
            byId("useFeedButton");

        const useInput =
            byId("useFeedInput");

        if (useButton) {
            useButton.addEventListener(
                "click",
                () => {
                    const amount =
                        number(useInput?.value);

                    if (amount <= 0) {
                        alert(
                            "Enter a feed usage amount greater than 0."
                        );

                        return;
                    }

                    if (recordFeedUsage(amount)) {
                        if (useInput) {
                            useInput.value = "";
                        }
                    }
                }
            );
        }

        const undoButton =
            byId("undoLastFeedAdditionButton") ||
            $(".feed-undo-button");

        if (undoButton) {
            undoButton.addEventListener(
                "click",
                undoLastFeedAddition
            );
        }

        /*
         * Existing HTML uses resetFeedTodayButton.
         * In the current dashboard structure this is the
         * feed-stock reset control.
         */
        const resetStockButton =
            byId("resetFeedTodayButton");

        if (resetStockButton) {
            resetStockButton.addEventListener(
                "click",
                resetFeedStock
            );
        }

        const resetUsageButton =
            byId("resetTodayFeedUsageButton");

        if (resetUsageButton) {
            resetUsageButton.addEventListener(
                "click",
                resetTodayFeedUsage
            );
        }

        const historyButton =
            byId("viewFeedHistoryButton");

        if (historyButton) {
            historyButton.addEventListener(
                "click",
                () => {
                    scrollToElement(
                        "feedHistoryList"
                    );
                }
            );
        }
    }

    /* =========================================================
       23. EGG CONTROLS
       ========================================================= */

    function setupEggControls() {
        const addButton =
            byId("addEggButton");

        if (addButton) {
            addButton.addEventListener(
                "click",
                () => addEggs(1)
            );
        }

        const removeButton =
            byId("removeEggButton");

        if (removeButton) {
            removeButton.addEventListener(
                "click",
                () => removeEggs(1)
            );
        }

        const historyButton =
            byId("viewHistoryButton");

        if (historyButton) {
            historyButton.addEventListener(
                "click",
                () => {
                    scrollToElement(
                        "eggHistoryList"
                    );
                }
            );
        }
    }

    /* =========================================================
       24. SCROLL HELPER
       ========================================================= */

    function scrollToElement(id) {
        const element = byId(id);

        if (!element) {
            return;
        }

        element.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    /* =========================================================
       25. THEME
       ========================================================= */

    function getThemePreference() {
        return getStorage(
            STORAGE.theme,
            DEFAULTS.theme
        );
    }

    function applyTheme(theme) {
        const validThemes = [
            "system",
            "light",
            "dark"
        ];

        if (!validThemes.includes(theme)) {
            theme = DEFAULTS.theme;
        }

        setStorage(
            STORAGE.theme,
            theme
        );

        if (theme === "system") {
            document.documentElement.removeAttribute(
                "data-theme"
            );
        } else {
            document.documentElement.setAttribute(
                "data-theme",
                theme
            );
        }

        refreshSettings();
    }

    function setupTheme() {
        applyTheme(getThemePreference());

        const mediaQuery =
            window.matchMedia?.(
                "(prefers-color-scheme: dark)"
            );

        if (mediaQuery) {
            mediaQuery.addEventListener(
                "change",
                () => {
                    if (
                        getThemePreference() ===
                        "system"
                    ) {
                        applyTheme("system");
                    }
                }
            );
        }
    }

    /* =========================================================
       26. BACKUP SYSTEM
       ========================================================= */

    const APP_STORAGE_KEYS = [
        STORAGE.flock,
        STORAGE.eggHistory,
        STORAGE.feed,
        STORAGE.feedUsageHistory,
        STORAGE.feedAdditionHistory,
        STORAGE.feedingSchedule,
        STORAGE.alarmEnabled,
        STORAGE.notificationsEnabled,
        STORAGE.theme,
        STORAGE.automaticBackup,
        STORAGE.lastBackup,
        STORAGE.settingsView
    ];

    function collectAppStorage() {
        const storage = {};

        APP_STORAGE_KEYS.forEach((key) => {
            const value =
                localStorage.getItem(key);

            if (value !== null) {
                storage[key] = value;
            }
        });

        return storage;
    }

    function createBackupObject() {
        return {
            app: APP.name,
            version: APP.version,
            exportedAt: new Date().toISOString(),
            storage: collectAppStorage()
        };
    }

    function downloadJSON(filename, data) {
        const blob = new Blob(
            [
                JSON.stringify(
                    data,
                    null,
                    2
                )
            ],
            {
                type: "application/json"
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;
        link.download = filename;

        document.body.appendChild(link);

        link.click();

        link.remove();

        setTimeout(
            () => URL.revokeObjectURL(url),
            1000
        );
    }

    function exportBackup() {
        const backup =
            createBackupObject();

        const date =
            todayKey();

        downloadJSON(
            `poultry-manager-backup-${date}.json`,
            backup
        );

        setStorage(
            STORAGE.lastBackup,
            new Date().toISOString()
        );

        updateBackupStatus(
            "Backup exported successfully."
        );
    }

    async function restoreBackupFile(file) {
        if (!file) {
            return false;
        }

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

            /*
             * Support both the current format:
             * backup.storage
             *
             * and the older version:
             * backup.data
             */
            const storage =
                backup.storage ||
                backup.data;

            if (
                !storage ||
                typeof storage !== "object"
            ) {
                throw new Error(
                    "The backup does not contain valid farm data."
                );
            }

            const confirmed =
                confirm(
                    "Restore this backup? Your current Poultry Manager data will be replaced."
                );

            if (!confirmed) {
                return false;
            }

            /*
             * Only remove Poultry Manager keys.
             * Do NOT clear the entire browser localStorage.
             */
            APP_STORAGE_KEYS.forEach(
                (key) => {
                    localStorage.removeItem(key);
                }
            );

            Object.entries(storage).forEach(
                ([key, value]) => {
                    if (
                        APP_STORAGE_KEYS.includes(key)
                    ) {
                        localStorage.setItem(
                            key,
                            String(value)
                        );
                    }
                }
            );

            alert(
                "Backup restored successfully. Poultry Manager will refresh now."
            );

            window.location.reload();

            return true;

        } catch (error) {
            console.error(
                "Poultry Manager restore error:",
                error
            );

            alert(
                error.message ||
                "The backup could not be restored."
            );

            return false;
        }
    }

    /* =========================================================
       27. AUTOMATIC BACKUP
       ========================================================= */

    let automaticBackupTimer = null;

    function getAutomaticBackupEnabled() {
        return getStorage(
            STORAGE.automaticBackup,
            DEFAULTS.automaticBackup
                ? "true"
                : "false"
        ) === "true";
    }

    function setAutomaticBackupEnabled(enabled) {
        setStorage(
            STORAGE.automaticBackup,
            enabled ? "true" : "false"
        );

        if (enabled) {
            createAutomaticBackup();
        }

        refreshSettings();
    }

    function scheduleAutomaticBackup() {
        if (!getAutomaticBackupEnabled()) {
            return;
        }

        if (automaticBackupTimer) {
            clearTimeout(
                automaticBackupTimer
            );
        }

        automaticBackupTimer =
            setTimeout(
                createAutomaticBackup,
                1500
            );
    }

    function createAutomaticBackup() {
        if (!getAutomaticBackupEnabled()) {
            return;
        }

        try {
            const backup =
                createBackupObject();

            /*
             * Store automatic backup separately from the normal
             * app storage keys so it does not cause an endless
             * backup loop.
             */
            localStorage.setItem(
                "poultryManagerAutomaticBackup",
                JSON.stringify(backup)
            );

            localStorage.setItem(
                STORAGE.lastBackup,
                new Date().toISOString()
            );

            updateBackupStatus(
                "Automatic backup updated."
            );
        } catch (error) {
            console.error(
                "Automatic backup failed:",
                error
            );
        }
    }

    function updateBackupStatus(message) {
        const element =
            byId("pmBackupStatus");

        if (element) {
            element.textContent = message;
        }
    }

    /* =========================================================
       28. MIDNIGHT ROLLOVER
       ========================================================= */

    let lastKnownDate = todayKey();

    function checkDateRollover() {
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

    /* =========================================================
       29. GLOBAL REFRESH
       ========================================================= */

    function refreshAll() {
        refreshFarmOverview();
        refreshEggProduction();
        refreshProductionSummary();
        renderProductionTrend();
        refreshAnalytics();
        refreshFeedManagement();
        refreshSettings();
    }

    /* =========================================================
       30. APP INITIALIZATION
       ========================================================= */

    function initializeDefaults() {
        if (
            localStorage.getItem(
                STORAGE.flock
            ) === null
        ) {
            localStorage.setItem(
                STORAGE.flock,
                String(DEFAULTS.flock)
            );
        }

        if (
            localStorage.getItem(
                STORAGE.feed
            ) === null
        ) {
            localStorage.setItem(
                STORAGE.feed,
                String(DEFAULTS.feed)
            );
        }

        if (
            localStorage.getItem(
                STORAGE.eggHistory
            ) === null
        ) {
            localStorage.setItem(
                STORAGE.eggHistory,
                "{}"
            );
        }

        if (
            localStorage.getItem(
                STORAGE.feedUsageHistory
            ) === null
        ) {
            localStorage.setItem(
                STORAGE.feedUsageHistory,
                "{}"
            );
        }

        if (
            localStorage.getItem(
                STORAGE.feedAdditionHistory
            ) === null
        ) {
            localStorage.setItem(
                STORAGE.feedAdditionHistory,
                "[]"
            );
        }

        if (
            localStorage.getItem(
                STORAGE.feedingSchedule
            ) === null
        ) {
            localStorage.setItem(
                STORAGE.feedingSchedule,
                JSON.stringify({
                    morning:
                        DEFAULTS.morningFeed,
                    afternoon:
                        DEFAULTS.afternoonFeed
                })
            );
        }

        if (
            localStorage.getItem(
                STORAGE.alarmEnabled
            ) === null
        ) {
            localStorage.setItem(
                STORAGE.alarmEnabled,
                DEFAULTS.alarmEnabled
                    ? "true"
                    : "false"
            );
        }

        if (
            localStorage.getItem(
                STORAGE.notificationsEnabled
            ) === null
        ) {
            localStorage.setItem(
                STORAGE.notificationsEnabled,
                "false"
            );
        }

        if (
            localStorage.getItem(
                STORAGE.theme
            ) === null
        ) {
            localStorage.setItem(
                STORAGE.theme,
                DEFAULTS.theme
            );
        }

        if (
            localStorage.getItem(
                STORAGE.automaticBackup
            ) === null
        ) {
            localStorage.setItem(
                STORAGE.automaticBackup,
                DEFAULTS.automaticBackup
                    ? "true"
                    : "false"
            );
        }
    }

    function initializeApp() {
        initializeDefaults();

        setupTheme();

        setupNavigation();

        setupQuickActions();

        setupEggControls();

        setupFeedControls();

        registerServiceWorker();

        refreshAll();

        /*
         * Restore whichever view the user was last using.
         */
        const savedView =
            getStorage(
                STORAGE.settingsView,
                "dashboard"
            );

        if (savedView === "settings") {
            showSettings();
        } else {
            showDashboard();
        }

        createAutomaticBackup();

        /*
         * Feed alarm check.
         */
        checkFeedAlarm();

        /*
         * Lightweight timers. These do not rebuild the whole
         * application; they simply keep time-sensitive data
         * current.
         */
        setInterval(
            checkFeedAlarm,
            30 * 1000
        );

        setInterval(
            checkDateRollover,
            30 * 1000
        );

        setInterval(
            refreshFarmOverview,
            60 * 1000
        );
    }

    /* =========================================================
       31. PUBLIC API
       ========================================================= */

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

        enableNotifications,
        testNotification,

        checkFeedAlarm,

        exportBackup,
        restoreBackupFile,

        applyTheme,

        getFeedSchedule,
        saveFeedSchedule
    };

    /* =========================================================
       32. START
       ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initializeApp,
            {
                once: true
            }
        );
    } else {
        initializeApp();
    }

})();

