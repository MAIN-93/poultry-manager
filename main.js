(function () {
    "use strict";

    /* ============================================================
       POULTRY MANAGER
       Main Application JavaScript
       PART 1 OF 2
       ============================================================ */

    const APP = {
        name: "Poultry Manager",
        version: "3.1.0",

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
                "poultryManagerAlarmTriggered",

            profile:
                "poultryManagerProfile"
        },

        defaults: {
            flock: 5,

            feed: 0,

            morningFeed: "07:00",

            afternoonFeed: "17:00",

            alarm: false,

            notifications: false,

            automaticBackup: false,

            theme: "light",

            profile: {
                name: "",
                farmName: "",
                role: "Farm Manager",
                location: "",
                phone: "",
                email: "",
                farmType: "Layers",
                notes: ""
            }
        }
    };


    /* ============================================================
       BASIC HELPERS
       ============================================================ */

    function $(selector) {
        return document.querySelector(selector);
    }


    function $$(selector) {
        return Array.from(
            document.querySelectorAll(selector)
        );
    }


    function safeNumber(value, fallback = 0) {
        const number = Number(value);

        return Number.isFinite(number)
            ? number
            : fallback;
    }


    function clamp(value, min, max) {
        return Math.min(
            Math.max(value, min),
            max
        );
    }


    function roundNumber(value, decimals = 2) {
        const factor =
            Math.pow(10, decimals);

        return Math.round(
            safeNumber(value) * factor
        ) / factor;
    }


    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function readStorage(key, fallback = null) {
        try {
            const value =
                localStorage.getItem(key);

            return value === null
                ? fallback
                : value;
        } catch (error) {
            console.warn(
                "Storage read failed:",
                key,
                error
            );

            return fallback;
        }
    }


    function writeStorage(key, value) {
        try {
            localStorage.setItem(
                key,
                String(value)
            );

            return true;
        } catch (error) {
            console.warn(
                "Storage write failed:",
                key,
                error
            );

            return false;
        }
    }


    function readJSON(key, fallback = null) {
        try {
            const raw =
                localStorage.getItem(key);

            if (!raw) {
                return fallback;
            }

            return JSON.parse(raw);

        } catch (error) {
            console.warn(
                "JSON read failed:",
                key,
                error
            );

            return fallback;
        }
    }


    function writeJSON(key, value) {
        try {
            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

            return true;
        } catch (error) {
            console.warn(
                "JSON write failed:",
                key,
                error
            );

            return false;
        }
    }


    function notify(message, type = "info") {
        console.log(
            `[Poultry Manager:${type}]`,
            message
        );

        let container =
            $("#pmToastContainer");

        if (!container) {
            container =
                document.createElement("div");

            container.id =
                "pmToastContainer";

            container.style.position =
                "fixed";

            container.style.left =
                "50%";

            container.style.bottom =
                "95px";

            container.style.transform =
                "translateX(-50%)";

            container.style.zIndex =
                "9999";

            container.style.width =
                "min(90%, 420px)";

            container.style.pointerEvents =
                "none";

            document.body.appendChild(
                container
            );
        }


        const toast =
            document.createElement("div");

        toast.textContent = message;

        toast.style.marginTop =
            "8px";

        toast.style.padding =
            "12px 15px";

        toast.style.borderRadius =
            "12px";

        toast.style.background =
            "var(--pm-surface)";

        toast.style.color =
            "var(--pm-text)";

        toast.style.border =
            "1px solid var(--pm-border)";

        toast.style.boxShadow =
            "var(--pm-shadow)";

        toast.style.fontSize =
            "13px";

        toast.style.fontWeight =
            "650";

        toast.style.pointerEvents =
            "none";

        toast.style.opacity =
            "0";

        toast.style.transform =
            "translateY(8px)";

        toast.style.transition =
            "opacity 180ms ease, transform 180ms ease";

        container.appendChild(toast);


        requestAnimationFrame(function () {
            toast.style.opacity = "1";
            toast.style.transform =
                "translateY(0)";
        });


        setTimeout(function () {
            toast.style.opacity = "0";
            toast.style.transform =
                "translateY(8px)";

            setTimeout(function () {
                toast.remove();
            }, 220);

        }, 2600);
    }


    function confirmAction(message) {
        return window.confirm(message);
    }


    function scrollToElement(element) {
        if (!element) {
            return;
        }

        element.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }


    /* ============================================================
       DATE / TIME
       ============================================================ */

    function getTodayKey() {
        return getDateKeyFromDate(
            new Date()
        );
    }


    function dateFromKey(key) {
        if (!key) {
            return new Date();
        }

        const parts =
            String(key).split("-");

        if (parts.length !== 3) {
            return new Date();
        }

        const year =
            Number(parts[0]);

        const month =
            Number(parts[1]) - 1;

        const day =
            Number(parts[2]);

        return new Date(
            year,
            month,
            day
        );
    }


    function getDateKeyFromDate(date) {
        const d =
            date instanceof Date
                ? date
                : new Date(date);

        const year =
            d.getFullYear();

        const month =
            String(
                d.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                d.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    function getPreviousDateKey(
        key,
        days = 1
    ) {
        const date =
            dateFromKey(key);

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
        const keys = [];

        for (
            let i = count - 1;
            i >= 0;
            i--
        ) {
            keys.push(
                getPreviousDateKey(
                    getTodayKey(),
                    i
                )
            );
        }

        return keys;
    }


    function isToday(key) {
        return key === getTodayKey();
    }


    function formatDate(
        dateOrKey,
        options = {}
    ) {
        const date =
            typeof dateOrKey === "string"
                ? dateFromKey(dateOrKey)
                : new Date(dateOrKey);

        return date.toLocaleDateString(
            undefined,
            {
                year: "numeric",
                month: "short",
                day: "numeric",
                ...options
            }
        );
    }


    function formatShortDate(
        dateOrKey
    ) {
        const date =
            typeof dateOrKey === "string"
                ? dateFromKey(dateOrKey)
                : new Date(dateOrKey);

        return date.toLocaleDateString(
            undefined,
            {
                month: "short",
                day: "numeric"
            }
        );
    }


    function formatTime(time) {
        if (!time) {
            return "—";
        }

        const parts =
            String(time).split(":");

        if (parts.length < 2) {
            return time;
        }

        let hour =
            Number(parts[0]);

        const minute =
            parts[1];

        const suffix =
            hour >= 12
                ? "PM"
                : "AM";

        hour =
            hour % 12 || 12;

        return `${hour}:${minute} ${suffix}`;
    }


    function timeToMinutes(time) {
        if (!time) {
            return 0;
        }

        const parts =
            String(time).split(":");

        const hour =
            safeNumber(parts[0]);

        const minute =
            safeNumber(parts[1]);

        return (
            hour * 60 +
            minute
        );
    }


    function getMinutesUntilTime(time) {
        const now =
            new Date();

        const target =
            timeToMinutes(time);

        const current =
            now.getHours() * 60 +
            now.getMinutes();

        let difference =
            target - current;

        if (difference < 0) {
            difference += 1440;
        }

        return difference;
    }


    function formatCountdown(minutes) {
        const total =
            Math.max(
                0,
                Math.round(
                    safeNumber(minutes)
                )
            );

        if (total < 60) {
            return `${total} min`;
        }

        const hours =
            Math.floor(total / 60);

        const mins =
            total % 60;

        if (!mins) {
            return `${hours} hr`;
        }

        return `${hours} hr ${mins} min`;
    }


    /* ============================================================
       FLOCK
       ============================================================ */

    function getFlockCount() {
        const stored =
            readStorage(
                APP.storage.flock,
                APP.defaults.flock
            );

        return Math.max(
            0,
            Math.round(
                safeNumber(
                    stored,
                    APP.defaults.flock
                )
            )
        );
    }


    function setFlockCount(value) {
        const flock =
            Math.max(
                0,
                Math.round(
                    safeNumber(value)
                )
            );

        writeStorage(
            APP.storage.flock,
            flock
        );

        updateFarmOverview();
        updateFarmSnapshot();
        refreshProduction();
        refreshProfile();
        refreshSettings();

        return flock;
    }


    /* ============================================================
       EGG DATA
       ============================================================ */

    function getRawEggHistory() {
        const data =
            readJSON(
                APP.storage.eggs,
                []
            );

        return Array.isArray(data)
            ? data
            : [];
    }


    function normalizeEggRecord(record) {
        if (!record) {
            return null;
        }


        if (
            typeof record === "number"
        ) {
            return {
                date: getTodayKey(),
                eggs: Math.max(
                    0,
                    Math.round(record)
                )
            };
        }


        const date =
            record.date ||
            record.day ||
            record.key;


        if (!date) {
            return null;
        }


        return {
            date: String(date),

            eggs: Math.max(
                0,
                Math.round(
                    safeNumber(
                        record.eggs ??
                        record.count ??
                        record.value
                    )
                )
            )
        };
    }


    function getEggHistory() {
        return getRawEggHistory()
            .map(normalizeEggRecord)
            .filter(Boolean)
            .sort(function (a, b) {
                return a.date.localeCompare(
                    b.date
                );
            });
    }


    function saveEggHistory(history) {
        const normalized =
            history
                .map(normalizeEggRecord)
                .filter(Boolean)
                .sort(function (a, b) {
                    return a.date.localeCompare(
                        b.date
                    );
                });

        writeJSON(
            APP.storage.eggs,
            normalized
        );
    }


    function getEggRecord(dateKey) {
        const history =
            getEggHistory();

        return (
            history.find(
                record =>
                    record.date === dateKey
            ) || {
                date: dateKey,
                eggs: 0
            }
        );
    }


    function getEggsForDate(dateKey) {
        return safeNumber(
            getEggRecord(dateKey).eggs
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
                Math.round(
                    safeNumber(count)
                )
            );


        const existingIndex =
            history.findIndex(
                record =>
                    record.date === dateKey
            );


        if (existingIndex >= 0) {
            history[
                existingIndex
            ].eggs = eggs;

        } else {
            history.push({
                date: dateKey,
                eggs
            });
        }


        saveEggHistory(history);

        updateEggDisplay();
        updateEggHistory();
        refreshProduction();
        updateFarmOverview();
        updateFarmSnapshot();
        refreshProfile();

        return eggs;
    }


    function addEggs(amount = 1) {
        const current =
            getTodayEggs();

        return setEggCount(
            current +
            Math.max(
                0,
                Math.round(
                    safeNumber(amount, 1)
                )
            )
        );
    }


    function removeEggs(amount = 1) {
        const current =
            getTodayEggs();

        return setEggCount(
            Math.max(
                0,
                current -
                Math.max(
                    0,
                    Math.round(
                        safeNumber(amount, 1)
                    )
                )
            )
        );
    }


    /* ============================================================
       EGG UI
       ============================================================ */

    function updateEggDisplay() {
        const eggCount =
            $("#eggCount");

        const layingRate =
            $("#layingRate");

        const eggs =
            getTodayEggs();

        const flock =
            getFlockCount();

        const rate =
            flock > 0
                ? Math.round(
                    (eggs / flock) * 100
                )
                : 0;


        if (eggCount) {
            eggCount.textContent =
                eggs;
        }


        if (layingRate) {
            layingRate.textContent =
                `${rate}%`;
        }
    }


    function updateEggHistory() {
        const list =
            $("#eggHistoryList");

        if (!list) {
            return;
        }


        const history =
            getEggHistory()
                .slice()
                .sort(function (a, b) {
                    return b.date.localeCompare(
                        a.date
                    );
                });


        if (!history.length) {
            list.innerHTML =
                `
                <div class="history-item">
                    <div>
                        <strong>No egg records yet</strong>
                        <span>
                            Start recording today's eggs.
                        </span>
                    </div>
                </div>
                `;

            return;
        }


        const recent =
            history.slice(0, 7);


        list.innerHTML =
            recent.map(function (record) {
                const flock =
                    getFlockCount();

                const rate =
                    flock > 0
                        ? Math.round(
                            (record.eggs / flock) *
                            100
                        )
                        : 0;

                const label =
                    isToday(record.date)
                        ? "Today"
                        : formatShortDate(
                            record.date
                        );


                return `
                    <div class="history-item">
                        <div>
                            <strong>
                                ${escapeHTML(label)}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    formatDate(record.date)
                                )}
                            </span>
                        </div>

                        <div>
                            <strong>
                                ${record.eggs} eggs
                            </strong>

                            <span>
                                ${rate}% laying rate
                            </span>
                        </div>
                    </div>
                `;
            })
            .join("");
    }


    function showAllEggHistory() {
        const list =
            $("#eggHistoryList");

        if (!list) {
            return;
        }


        const history =
            getEggHistory()
                .slice()
                .sort(function (a, b) {
                    return b.date.localeCompare(
                        a.date
                    );
                });


        if (!history.length) {
            list.innerHTML =
                `
                <div class="history-item">
                    <div>
                        <strong>No egg records yet</strong>
                    </div>
                </div>
                `;

            return;
        }


        list.innerHTML =
            history.map(function (record) {
                const flock =
                    getFlockCount();

                const rate =
                    flock > 0
                        ? Math.round(
                            (record.eggs / flock) *
                            100
                        )
                        : 0;

                const label =
                    isToday(record.date)
                        ? "Today"
                        : formatShortDate(
                            record.date
                        );


                return `
                    <div class="history-item">
                        <div>
                            <strong>
                                ${escapeHTML(label)}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    formatDate(record.date)
                                )}
                            </span>
                        </div>

                        <div>
                            <strong>
                                ${record.eggs} eggs
                            </strong>

                            <span>
                                ${rate}% laying rate
                            </span>
                        </div>
                    </div>
                `;
            })
            .join("");
    }


    /* ============================================================
       PRODUCTION ANALYTICS
       ============================================================ */

    function getProductionStats() {
        const keys =
            getRecentDateKeys(7);

        const previousKeys =
            getRecentDateKeys(14)
                .slice(0, 7);


        const currentValues =
            keys.map(
                key =>
                    getEggsForDate(key)
            );

        const previousValues =
            previousKeys.map(
                key =>
                    getEggsForDate(key)
            );


        const total =
            currentValues.reduce(
                (sum, value) =>
                    sum + value,
                0
            );


        const previousTotal =
            previousValues.reduce(
                (sum, value) =>
                    sum + value,
                0
            );


        const average =
            total / 7;


        const flock =
            getFlockCount();


        const averageLayingRate =
            flock > 0
                ? (
                    (average / flock) *
                    100
                )
                : 0;


        let bestIndex = 0;
        let lowestIndex = 0;


        currentValues.forEach(
            function (value, index) {
                if (
                    value >
                    currentValues[bestIndex]
                ) {
                    bestIndex = index;
                }

                if (
                    value <
                    currentValues[lowestIndex]
                ) {
                    lowestIndex = index;
                }
            }
        );


        const bestEggs =
            currentValues.length
                ? currentValues[bestIndex]
                : 0;

        const lowestEggs =
            currentValues.length
                ? currentValues[lowestIndex]
                : 0;


        const variance =
            currentValues.reduce(
                (sum, value) =>
                    sum +
                    Math.pow(
                        value - average,
                        2
                    ),
                0
            ) / 7;


        const standardDeviation =
            Math.sqrt(variance);


        const consistency =
            average > 0
                ? clamp(
                    100 -
                    (
                        standardDeviation /
                        Math.max(
                            average,
                            1
                        )
                    ) * 100,
                    0,
                    100
                )
                : 0;


        let change = 0;


        if (previousTotal > 0) {
            change =
                (
                    (
                        total -
                        previousTotal
                    ) /
                    previousTotal
                ) * 100;

        } else if (total > 0) {
            change = 100;
        }


        return {
            keys,
            currentValues,
            previousValues,

            total,

            average,

            averageLayingRate,

            bestDate:
                keys[bestIndex] || null,

            bestEggs,

            lowestDate:
                keys[lowestIndex] || null,

            lowestEggs,

            eggsPerHen:
                flock > 0
                    ? total / flock
                    : 0,

            consistency,

            previousTotal,

            change
        };
    }


    function createProductionInsight(
        stats
    ) {
        if (!stats || stats.total <= 0) {
            return "Start recording eggs to see production insights.";
        }


        if (stats.change >= 20) {
            return (
                "Production is trending strongly upward compared with the previous period."
            );
        }


        if (stats.change >= 5) {
            return (
                "Your flock's production is improving compared with the previous period."
            );
        }


        if (stats.change <= -20) {
            return (
                "Production has dropped noticeably. Check feed, water, stress and flock health."
            );
        }


        if (stats.change <= -5) {
            return (
                "Production is slightly lower than the previous period. Keep monitoring the flock."
            );
        }


        if (stats.consistency >= 85) {
            return (
                "Your flock is showing consistent production across the recent period."
            );
        }


        return (
            "Keep recording daily eggs to build a clearer picture of your flock's performance."
        );
    }


    function refreshProduction() {
        const stats =
            getProductionStats();


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
                stats.total;
        }


        if (averageLayingRate) {
            averageLayingRate.textContent =
                `${Math.round(
                    stats.averageLayingRate
                )}%`;
        }


        if (bestProductionDay) {
            bestProductionDay.textContent =
                stats.bestDate
                    ? (
                        isToday(stats.bestDate)
                            ? "Today"
                            : formatShortDate(
                                stats.bestDate
                            )
                    )
                    : "—";
        }


        if (bestProductionEggs) {
            bestProductionEggs.textContent =
                stats.bestEggs;
        }


        const analyticsEggsPerHen =
            $("#analyticsEggsPerHen");

        const analyticsAverage =
            $("#analyticsAverage");

        const analyticsHighestDay =
            $("#analyticsHighestDay");

        const analyticsHighestDayDate =
            $("#analyticsHighestDayDate");

        const analyticsLowestDay =
            $("#analyticsLowestDay");

        const analyticsLowestDayDate =
            $("#analyticsLowestDayDate");

        const analyticsConsistency =
            $("#analyticsConsistency");

        const analyticsChange =
            $("#analyticsChange");

        const analyticsInsight =
            $("#analyticsInsight");


        if (analyticsEggsPerHen) {
            analyticsEggsPerHen.textContent =
                roundNumber(
                    stats.eggsPerHen,
                    2
                ).toFixed(2);
        }


        if (analyticsAverage) {
            analyticsAverage.textContent =
                roundNumber(
                    stats.average,
                    2
                ).toFixed(2);
        }


        if (analyticsHighestDay) {
            analyticsHighestDay.textContent =
                stats.bestEggs;
        }


        if (analyticsHighestDayDate) {
            analyticsHighestDayDate.textContent =
                stats.bestDate
                    ? formatShortDate(
                        stats.bestDate
                    )
                    : "No data";
        }


        if (analyticsLowestDay) {
            analyticsLowestDay.textContent =
                stats.lowestEggs;
        }


        if (analyticsLowestDayDate) {
            analyticsLowestDayDate.textContent =
                stats.lowestDate
                    ? formatShortDate(
                        stats.lowestDate
                    )
                    : "No data";
        }


        if (analyticsConsistency) {
            analyticsConsistency.textContent =
                `${Math.round(
                    stats.consistency
                )}%`;
        }


        if (analyticsChange) {
            const change =
                roundNumber(
                    stats.change,
                    1
                );

            analyticsChange.textContent =
                `${change > 0 ? "+" : ""}${change}%`;
        }


        if (analyticsInsight) {
            analyticsInsight.textContent =
                createProductionInsight(
                    stats
                );
        }


        updateProductionTrend();
    }


    /* ============================================================
       CANVAS / CHART HELPERS
       ============================================================ */

    function getOrCreateChartCanvas(
        containerId,
        canvasId
    ) {
        const container =
            document.getElementById(
                containerId
            );

        if (!container) {
            return null;
        }


        let canvas =
            document.getElementById(
                canvasId
            );


        if (!canvas) {
            canvas =
                document.createElement(
                    "canvas"
                );

            canvas.id = canvasId;

            canvas.style.width =
                "100%";

            canvas.style.height =
                "100%";

            canvas.style.display =
                "block";

            container.innerHTML = "";

            container.appendChild(
                canvas
            );
        }


        return canvas;
    }


    function prepareCanvasSize(canvas) {
        if (!canvas) {
            return null;
        }


        const rect =
            canvas.getBoundingClientRect();


        const width =
            Math.max(
                1,
                Math.round(rect.width)
            );


        const height =
            Math.max(
                1,
                Math.round(rect.height)
            );


        const ratio =
            window.devicePixelRatio ||
            1;


        canvas.width =
            width * ratio;

        canvas.height =
            height * ratio;


        const context =
            canvas.getContext("2d");


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


    function updateProductionTrend() {
        const container =
            $("#productionTrendChart");

        if (!container) {
            return;
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

            canvas.style.width =
                "100%";

            canvas.style.height =
                "100%";

            canvas.style.display =
                "block";

            container.innerHTML = "";

            container.appendChild(
                canvas
            );
        }


        const prepared =
            prepareCanvasSize(canvas);

        if (!prepared) {
            return;
        }


        const {
            context,
            width,
            height
        } = prepared;


        const stats =
            getProductionStats();


        const values =
            stats.currentValues;


        const maxValue =
            Math.max(
                1,
                ...values
            );


        const styles =
            getComputedStyle(
                document.documentElement
            );


        const primary =
            styles.getPropertyValue(
                "--pm-primary"
            ).trim() ||
            "#1f6b45";


        const border =
            styles.getPropertyValue(
                "--pm-border"
            ).trim() ||
            "#e2e7e2";


        const textMuted =
            styles.getPropertyValue(
                "--pm-text-muted"
            ).trim() ||
            "#89918a";


        const padding = {
            top: 12,
            right: 8,
            bottom: 30,
            left: 8
        };


        const chartWidth =
            width -
            padding.left -
            padding.right;

        const chartHeight =
            height -
            padding.top -
            padding.bottom;


        context.clearRect(
            0,
            0,
            width,
            height
        );


        if (!values.length) {
            return;
        }


        const step =
            values.length > 1
                ? chartWidth /
                    (values.length - 1)
                : chartWidth;


        const points =
            values.map(
                function (value, index) {
                    const x =
                        padding.left +
                        index * step;

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


        context.strokeStyle =
            border;

        context.lineWidth = 1;


        for (
            let i = 0;
            i <= 2;
            i++
        ) {
            const y =
                padding.top +
                (
                    chartHeight *
                    i /
                    2
                );

            context.beginPath();

            context.moveTo(
                padding.left,
                y
            );

            context.lineTo(
                width - padding.right,
                y
            );

            context.stroke();
        }


        context.beginPath();


        points.forEach(
            function (point, index) {
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
            primary;

        context.lineWidth = 3;

        context.lineCap =
            "round";

        context.lineJoin =
            "round";

        context.stroke();


        points.forEach(
            function (point) {
                context.beginPath();

                context.arc(
                    point.x,
                    point.y,
                    4,
                    0,
                    Math.PI * 2
                );

                context.fillStyle =
                    primary;

                context.fill();
            }
        );


        context.font =
            "11px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";

        context.fillStyle =
            textMuted;

        context.textAlign =
            "center";


        stats.keys.forEach(
            function (key, index) {
                const point =
                    points[index];

                if (!point) {
                    return;
                }

                const label =
                    isToday(key)
                        ? "Today"
                        : formatShortDate(key);

                context.fillText(
                    label,
                    point.x,
                    height - 9
                );
            }
        );


        const maxLabel =
            $("#trendMaxLabel");

        const midLabel =
            $("#trendMidLabel");


        if (maxLabel) {
            maxLabel.textContent =
                maxValue;
        }


        if (midLabel) {
            midLabel.textContent =
                Math.round(
                    maxValue / 2
                );
        }
    }


    /* ============================================================
       FEED DATA
       ============================================================ */

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
                2
            )
        );
    }


    function setFeedAmount(amount) {
        const feed =
            Math.max(
                0,
                roundNumber(
                    safeNumber(amount),
                    2
                )
            );

        writeStorage(
            APP.storage.feed,
            feed
        );

        updateFeedManagement();
        updateFarmOverview();
        updateFarmSnapshot();
        refreshProfile();

        return feed;
    }


    function getFeedUsageHistory() {
        const data =
            readJSON(
                APP.storage.feedUsage,
                []
            );

        if (!Array.isArray(data)) {
            return [];
        }


        return data
            .map(function (record) {
                if (!record) {
                    return null;
                }

                return {
                    date:
                        String(
                            record.date ||
                            record.day ||
                            getTodayKey()
                        ),

                    amount:
                        Math.max(
                            0,
                            roundNumber(
                                safeNumber(
                                    record.amount ??
                                    record.quantity ??
                                    record.value
                                ),
                                2
                            )
                        )
                };
            })
            .filter(Boolean)
            .sort(function (a, b) {
                return a.date.localeCompare(
                    b.date
                );
            });
    }


    function saveFeedUsageHistory(
        history
    ) {
        writeJSON(
            APP.storage.feedUsage,
            history
        );
    }


    function getTodayFeedUsage() {
        const record =
            getFeedUsageHistory()
                .find(
                    item =>
                        item.date ===
                        getTodayKey()
                );

        return record
            ? record.amount
            : 0;
    }


    function getFeedAdditionHistory() {
        const data =
            readJSON(
                APP.storage.feedAdditions,
                []
            );

        return Array.isArray(data)
            ? data
            : [];
    }


    function saveFeedAdditionHistory(
        history
    ) {
        writeJSON(
            APP.storage.feedAdditions,
            history
        );
    }


    function addFeed(amount) {
        const quantity =
            roundNumber(
                safeNumber(amount),
                2
            );


        if (quantity <= 0) {
            notify(
                "Enter a valid feed amount.",
                "warning"
            );

            return false;
        }


        const before =
            getFeedAmount();

        const after =
            roundNumber(
                before + quantity,
                2
            );


        setFeedAmount(after);


        const additions =
            getFeedAdditionHistory();


        additions.push({
            id:
                Date.now(),

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
            additions.length > 30
        ) {
            additions.shift();
        }


        saveFeedAdditionHistory(
            additions
        );


        updateFeedHistory();

        notify(
            `${quantity} kg of feed added.`,
            "success"
        );

        return true;
    }


    function undoLastFeedAddition() {
        const additions =
            getFeedAdditionHistory();


        if (!additions.length) {
            notify(
                "There is no feed addition to undo.",
                "warning"
            );

            return false;
        }


        const last =
            additions[
                additions.length - 1
            ];


        setFeedAmount(
            last.beforeStock
        );


        additions.pop();

        saveFeedAdditionHistory(
            additions
        );


        updateFeedHistory();

        notify(
            "Last feed addition undone.",
            "success"
        );

        return true;
    }


    function useFeed(amount) {
        const quantity =
            roundNumber(
                safeNumber(amount),
                2
            );


        if (quantity <= 0) {
            notify(
                "Enter a valid feed amount.",
                "warning"
            );

            return false;
        }


        const current =
            getFeedAmount();


        if (quantity > current) {
            notify(
                "You don't have enough feed in stock.",
                "warning"
            );

            return false;
        }


        setFeedAmount(
            roundNumber(
                current - quantity,
                2
            )
        );


        const history =
            getFeedUsageHistory();


        const today =
            getTodayKey();


        const index =
            history.findIndex(
                record =>
                    record.date === today
            );


        if (index >= 0) {
            history[index].amount =
                roundNumber(
                    history[index].amount +
                    quantity,
                    2
                );

        } else {
            history.push({
                date: today,
                amount: quantity
            });
        }


        saveFeedUsageHistory(
            history
        );


        updateFeedManagement();
        updateFeedHistory();
        updateFeedConsumptionChart();
        updateFarmOverview();
        updateFarmSnapshot();
        refreshProfile();


        notify(
            `${quantity} kg feed usage recorded.`,
            "success"
        );

        return true;
    }


    function resetTodayFeedUsage() {
        const today =
            getTodayKey();

        const usage =
            getTodayFeedUsage();


        if (usage <= 0) {
            notify(
                "There is no feed usage recorded today.",
                "warning"
            );

            return false;
        }


        if (
            !confirmAction(
                "Reset today's feed usage?"
            )
        ) {
            return false;
        }


        setFeedAmount(
            getFeedAmount() +
            usage
        );


        const history =
            getFeedUsageHistory()
                .filter(
                    record =>
                        record.date !== today
                );


        saveFeedUsageHistory(
            history
        );


        /*
         * Preserve the existing application's
         * historical behavior.
         */
        saveFeedAdditionHistory([]);


        updateFeedManagement();
        updateFeedHistory();
        updateFeedConsumptionChart();
        updateFarmOverview();
        updateFarmSnapshot();
        refreshProfile();


        notify(
            "Today's feed usage has been reset.",
            "success"
        );

        return true;
    }


    function resetFeedStock() {
        if (
            !confirmAction(
                "Reset current feed stock to 0 kg? Feed usage history will be preserved."
            )
        ) {
            return false;
        }


        setFeedAmount(0);

        updateFeedManagement();
        updateFeedHistory();
        updateFarmOverview();
        updateFarmSnapshot();
        refreshProfile();


        notify(
            "Feed stock reset.",
            "success"
        );

        return true;
    }


    function getFeedStats() {
        const keys =
            getRecentDateKeys(7);


        const usageHistory =
            getFeedUsageHistory();


        const values =
            keys.map(
                key => {
                    const record =
                        usageHistory.find(
                            item =>
                                item.date === key
                        );

                    return record
                        ? record.amount
                        : 0;
                }
            );


        const total =
            values.reduce(
                (sum, value) =>
                    sum + value,
                0
            );


        const usageDays =
            values.filter(
                value =>
                    value > 0
            ).length;


        const average =
            usageDays > 0
                ? total / usageDays
                : 0;


        const flock =
            getFlockCount();


        const perBird =
            flock > 0 &&
            average > 0
                ? average / flock
                : 0;


        const stock =
            getFeedAmount();


        const daysRemaining =
            average > 0
                ? stock / average
                : null;


        return {
            keys,
            values,
            total,
            usageDays,
            average,
            perBird,
            stock,
            daysRemaining
        };
    }


    function updateFeedProgress() {
        const progress =
            $("#feedStockProgress");

        const percentage =
            $("#feedStockPercentage");


        if (!progress || !percentage) {
            return;
        }


        const stats =
            getFeedStats();


        const additions =
            getFeedAdditionHistory();


        let maximum =
            stats.stock;


        if (additions.length) {
            maximum =
                Math.max(
                    maximum,
                    ...additions.map(
                        item =>
                            safeNumber(
                                item.afterStock
                            )
                    )
                );
        }


        if (maximum <= 0) {
            progress.style.width =
                "0%";

            percentage.textContent =
                "—";

            return;
        }


        const percent =
            clamp(
                (
                    stats.stock /
                    maximum
                ) * 100,
                0,
                100
            );


        progress.style.width =
            `${percent}%`;

        percentage.textContent =
            `${Math.round(percent)}%`;
    }


    function updateFeedActionState() {
        const useInput =
            $("#useFeedInput");

        const addInput =
            $("#feedInput");


        if (useInput) {
            useInput.max =
                String(
                    Math.max(
                        0,
                        getFeedAmount()
                    )
                );
        }


        if (addInput) {
            addInput.removeAttribute(
                "max"
            );
        }
    }


    function updateFeedManagement() {
        const amount =
            $("#feedAmount");

        const usedToday =
            $("#feedUsedToday");

        const dailyAverage =
            $("#feedDailyAverage");

        const daysRemaining =
            $("#feedDaysRemaining");

        const daysRemainingText =
            $("#feedDaysRemainingText");

        const statusBadge =
            $("#feedStatusBadge");


        const stats =
            getFeedStats();


        if (amount) {
            amount.textContent =
                `${stats.stock.toFixed(1)} kg`;
        }


        if (usedToday) {
            usedToday.textContent =
                `${getTodayFeedUsage().toFixed(1)} kg`;
        }


        if (dailyAverage) {
            dailyAverage.textContent =
                stats.average > 0
                    ? `${stats.average.toFixed(2)} kg`
                    : "—";
        }


        if (daysRemaining) {
            daysRemaining.textContent =
                stats.daysRemaining !== null
                    ? `${Math.floor(
                        stats.daysRemaining
                    )}`
                    : "—";
        }


        if (daysRemainingText) {
            daysRemainingText.textContent =
                stats.daysRemaining !== null
                    ? "estimated at current usage"
                    : "record usage to calculate";
        }


        if (statusBadge) {
            statusBadge.className =
                "feed-status-badge";


            if (stats.stock <= 0) {
                statusBadge.classList.add(
                    "feed-status-neutral"
                );

                statusBadge.textContent =
                    "Out of stock";

            } else if (
                stats.daysRemaining !== null &&
                stats.daysRemaining < 3
            ) {
                statusBadge.classList.add(
                    "feed-status-warning"
                );

                statusBadge.textContent =
                    "Low stock";

            } else {
                statusBadge.classList.add(
                    "feed-status-good"
                );

                statusBadge.textContent =
                    "Stock available";
            }
        }


        const sevenDay =
            $("#feedSevenDayUsage");

        const usageDays =
            $("#feedUsageDays");

        const perBird =
            $("#feedPerBird");


        if (sevenDay) {
            sevenDay.textContent =
                `${stats.total.toFixed(1)} kg`;
        }


        if (usageDays) {
            usageDays.textContent =
                stats.usageDays;
        }


        if (perBird) {
            perBird.textContent =
                stats.perBird > 0
                    ? `${stats.perBird.toFixed(3)} kg`
                    : "—";
        }


        updateFeedProgress();
        updateFeedActionState();
        updateFeedConsumptionChart();
    }


    function updateFeedHistory() {
        const list =
            $("#feedHistoryList");

        if (!list) {
            return;
        }


        const usage =
            getFeedUsageHistory()
                .slice()
                .sort(function (a, b) {
                    return b.date.localeCompare(
                        a.date
                    );
                });


        const additions =
            getFeedAdditionHistory()
                .slice()
                .sort(function (a, b) {
                    return (
                        safeNumber(b.id) -
                        safeNumber(a.id)
                    );
                });


        const items = [];


        usage.slice(0, 5)
            .forEach(function (record) {
                items.push({
                    timestamp:
                        dateFromKey(
                            record.date
                        ).getTime(),

                    html: `
                        <div class="feed-history-item">
                            <div>
                                <strong>
                                    Feed used
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        isToday(record.date)
                                            ? "Today"
                                            : formatShortDate(
                                                record.date
                                            )
                                    )}
                                </span>
                            </div>

                            <strong>
                                −${record.amount.toFixed(2)} kg
                            </strong>
                        </div>
                    `
                });
            });


        additions.slice(0, 5)
            .forEach(function (record) {
                items.push({
                    timestamp:
                        safeNumber(
                            record.id
                        ),

                    html: `
                        <div class="feed-history-item">
                            <div>
                                <strong>
                                    Feed added
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        formatDate(
                                            record.timestamp ||
                                            record.id
                                        )
                                    )}
                                </span>
                            </div>

                            <strong>
                                +${safeNumber(
                                    record.amount
                                ).toFixed(2)} kg
                            </strong>
                        </div>
                    `
                });
            });


        items.sort(
            (a, b) =>
                b.timestamp -
                a.timestamp
        );


        const visible =
            items.slice(0, 8);


        if (!visible.length) {
            list.innerHTML =
                `
                <div class="feed-history-item">
                    <div>
                        <strong>
                            No feed activity yet
                        </strong>

                        <span>
                            Add stock or record usage to begin.
                        </span>
                    </div>
                </div>
                `;

            return;
        }


        list.innerHTML =
            visible
                .map(item => item.html)
                .join("");
    }


    function showAllFeedHistory() {
        const list =
            $("#feedHistoryList");

        if (!list) {
            return;
        }


        const usage =
            getFeedUsageHistory()
                .slice()
                .sort(function (a, b) {
                    return b.date.localeCompare(
                        a.date
                    );
                });


        const additions =
            getFeedAdditionHistory()
                .slice()
                .sort(function (a, b) {
                    return (
                        safeNumber(b.id) -
                        safeNumber(a.id)
                    );
                });


        const items = [];


        usage.forEach(function (record) {
            items.push({
                timestamp:
                    dateFromKey(
                        record.date
                    ).getTime(),

                html: `
                    <div class="feed-history-item">
                        <div>
                            <strong>Feed used</strong>

                            <span>
                                ${escapeHTML(
                                    formatDate(record.date)
                                )}
                            </span>
                        </div>

                        <strong>
                            −${record.amount.toFixed(2)} kg
                        </strong>
                    </div>
                `
            });
        });


        additions.forEach(function (record) {
            items.push({
                timestamp:
                    safeNumber(record.id),

                html: `
                    <div class="feed-history-item">
                        <div>
                            <strong>Feed added</strong>

                            <span>
                                ${escapeHTML(
                                    formatDate(
                                        record.timestamp ||
                                        record.id
                                    )
                                )}
                            </span>
                        </div>

                        <strong>
                            +${safeNumber(
                                record.amount
                            ).toFixed(2)} kg
                        </strong>
                    </div>
                `
            });
        });


        items.sort(
            (a, b) =>
                b.timestamp -
                a.timestamp
        );


        if (!items.length) {
            list.innerHTML =
                `
                <div class="feed-history-item">
                    <div>
                        <strong>
                            No feed activity yet
                        </strong>
                    </div>
                </div>
                `;

            return;
        }


        list.innerHTML =
            items
                .map(item => item.html)
                .join("");
    }


    function updateFeedConsumptionChart() {
        const container =
            $("#feedConsumptionChart");

        if (!container) {
            return;
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

            canvas.style.width =
                "100%";

            canvas.style.height =
                "100%";

            canvas.style.display =
                "block";

            container.innerHTML = "";

            container.appendChild(
                canvas
            );
        }


        const prepared =
            prepareCanvasSize(canvas);

        if (!prepared) {
            return;
        }


        const {
            context,
            width,
            height
        } = prepared;


        const stats =
            getFeedStats();


        const values =
            stats.values;


        const maxValue =
            Math.max(
                0.1,
                ...values
            );


        const styles =
            getComputedStyle(
                document.documentElement
            );


        const primary =
            styles.getPropertyValue(
                "--pm-primary"
            ).trim() ||
            "#1f6b45";


        const border =
            styles.getPropertyValue(
                "--pm-border"
            ).trim() ||
            "#e2e7e2";


        const muted =
            styles.getPropertyValue(
                "--pm-text-muted"
            ).trim() ||
            "#89918a";


        const padding = {
            top: 10,
            right: 8,
            bottom: 28,
            left: 8
        };


        const chartWidth =
            width -
            padding.left -
            padding.right;


        const chartHeight =
            height -
            padding.top -
            padding.bottom;


        context.clearRect(
            0,
            0,
            width,
            height
        );


        const step =
            values.length > 1
                ? chartWidth /
                    (values.length - 1)
                : chartWidth;


        context.strokeStyle =
            border;

        context.lineWidth = 1;


        for (
            let i = 0;
            i <= 2;
            i++
        ) {
            const y =
                padding.top +
                (
                    chartHeight *
                    i /
                    2
                );

            context.beginPath();

            context.moveTo(
                padding.left,
                y
            );

            context.lineTo(
                width - padding.right,
                y
            );

            context.stroke();
        }


        const points =
            values.map(
                function (value, index) {
                    return {
                        x:
                            padding.left +
                            index * step,

                        y:
                            padding.top +
                            chartHeight -
                            (
                                value /
                                maxValue
                            ) *
                            chartHeight,

                        value
                    };
                }
            );


        context.beginPath();


        points.forEach(
            function (point, index) {
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
            primary;

        context.lineWidth = 3;

        context.lineCap =
            "round";

        context.lineJoin =
            "round";

        context.stroke();


        points.forEach(
            function (point) {
                context.beginPath();

                context.arc(
                    point.x,
                    point.y,
                    3.5,
                    0,
                    Math.PI * 2
                );

                context.fillStyle =
                    primary;

                context.fill();
            }
        );


        context.font =
            "10px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";

        context.fillStyle =
            muted;

        context.textAlign =
            "center";


        stats.keys.forEach(
            function (key, index) {
                const point =
                    points[index];

                if (!point) {
                    return;
                }

                context.fillText(
                    isToday(key)
                        ? "Today"
                        : formatShortDate(key),
                    point.x,
                    height - 8
                );
            }
        );
        
            /* ============================================================
       FEED SCHEDULE
       ============================================================ */

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
                    stored.morningFeed ||
                    APP.defaults.morningFeed,

                afternoon:
                    stored.afternoon ||
                    stored.afternoonFeed ||
                    APP.defaults.afternoonFeed
            };
        }


        const legacyMorning =
            readStorage(
                "morningFeedTime",
                APP.defaults.morningFeed
            );

        const legacyAfternoon =
            readStorage(
                "afternoonFeedTime",
                APP.defaults.afternoonFeed
            );


        return {
            morning:
                legacyMorning,

            afternoon:
                legacyAfternoon
        };
    }


    function saveFeedSchedule(
        morning,
        afternoon,
        syncServer = true
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


        /*
         * Preserve the older schedule keys
         * for compatibility with existing data.
         */
        writeStorage(
            "morningFeedTime",
            schedule.morning
        );

        writeStorage(
            "afternoonFeedTime",
            schedule.afternoon
        );


        if (syncServer) {
            syncScheduleWithServer(
                schedule
            );
        }


        updateNextFeed();
        refreshSettings();


        return schedule;
    }


    async function syncScheduleWithServer(
        schedule
    ) {
        try {
            await fetch(
                `${APP.renderBase}/schedule`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            morning:
                                schedule.morning,

                            afternoon:
                                schedule.afternoon
                        })
                }
            );

        } catch (error) {
            /*
             * The app continues working locally
             * if Render is sleeping or unavailable.
             */
            console.warn(
                "Schedule server sync unavailable:",
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


        const morningMinutes =
            timeToMinutes(
                schedule.morning
            );


        const afternoonMinutes =
            timeToMinutes(
                schedule.afternoon
            );


        const options = [];


        if (
            morningMinutes >
            currentMinutes
        ) {
            options.push({
                period: "Morning",
                time: schedule.morning,
                minutes:
                    morningMinutes -
                    currentMinutes
            });
        }


        if (
            afternoonMinutes >
            currentMinutes
        ) {
            options.push({
                period: "Afternoon",
                time: schedule.afternoon,
                minutes:
                    afternoonMinutes -
                    currentMinutes
            });
        }


        if (!options.length) {
            options.push({
                period: "Morning",
                time: schedule.morning,
                minutes:
                    (
                        1440 -
                        currentMinutes
                    ) +
                    morningMinutes
            });
        }


        options.sort(
            (a, b) =>
                a.minutes -
                b.minutes
        );


        return options[0];
    }


    function updateNextFeed() {
        const element =
            $("#farmOverviewNextFeed");

        const nextFeed =
            getNextFeed();


        if (element) {
            element.textContent =
                nextFeed
                    ? formatTime(
                        nextFeed.time
                    )
                    : "—";
        }
    }


    /* ============================================================
       FARM OVERVIEW
       ============================================================ */

    function updateFarmOverview() {
        const flockElement =
            $("#farmOverviewFlock");

        const eggsElement =
            $("#farmOverviewEggs");

        const layingRateElement =
            $("#farmOverviewLayingRate");

        const feedElement =
            $("#farmOverviewFeed");


        const flock =
            getFlockCount();

        const eggs =
            getTodayEggs();

        const feed =
            getFeedAmount();

        const layingRate =
            flock > 0
                ? Math.round(
                    (eggs / flock) *
                    100
                )
                : 0;


        if (flockElement) {
            flockElement.textContent =
                flock;
        }


        if (eggsElement) {
            eggsElement.textContent =
                eggs;
        }


        if (layingRateElement) {
            layingRateElement.textContent =
                `${layingRate}%`;
        }


        if (feedElement) {
            feedElement.textContent =
                `${feed.toFixed(1)} kg`;
        }


        updateNextFeed();
        updateFarmSnapshot();
    }


    function updateFarmSnapshot() {
        const flock =
            getFlockCount();

        const eggs =
            getTodayEggs();

        const feed =
            getFeedAmount();

        const rate =
            flock > 0
                ? Math.round(
                    (eggs / flock) *
                    100
                )
                : 0;


        const flockElement =
            $("#myFarmFlockCount");

        const eggElement =
            $("#myFarmEggCount");

        const feedElement =
            $("#myFarmFeedStock");

        const rateElement =
            $("#myFarmLayingRate");


        if (flockElement) {
            flockElement.textContent =
                flock;
        }

        if (eggElement) {
            eggElement.textContent =
                eggs;
        }

        if (feedElement) {
            feedElement.textContent =
                `${feed.toFixed(1)} kg`;
        }

        if (rateElement) {
            rateElement.textContent =
                `${rate}%`;
        }


        const flockDisplay =
            $("#myFarmFlockDisplay");

        if (flockDisplay) {
            flockDisplay.textContent =
                flock;
        }
    }


    /* ============================================================
       PROFILE
       ============================================================ */

    function getDefaultProfile() {
        return {
            ...APP.defaults.profile
        };
    }


    function getProfile() {
        const stored =
            readJSON(
                APP.storage.profile,
                null
            );


        if (
            !stored ||
            typeof stored !== "object"
        ) {
            return getDefaultProfile();
        }


        return {
            ...getDefaultProfile(),
            ...stored
        };
    }


    function saveProfile(profile) {
        const clean = {
            name:
                String(
                    profile.name || ""
                ).trim(),

            farmName:
                String(
                    profile.farmName || ""
                ).trim(),

            role:
                String(
                    profile.role ||
                    APP.defaults.profile.role
                ).trim(),

            location:
                String(
                    profile.location || ""
                ).trim(),

            phone:
                String(
                    profile.phone || ""
                ).trim(),

            email:
                String(
                    profile.email || ""
                ).trim(),

            farmType:
                String(
                    profile.farmType ||
                    APP.defaults.profile.farmType
                ).trim(),

            notes:
                String(
                    profile.notes || ""
                ).trim()
        };


        writeJSON(
            APP.storage.profile,
            clean
        );


        refreshProfile();

        return clean;
    }


    function getProfileInitials(profile) {
        const name =
            String(
                profile.name || ""
            ).trim();


        if (!name) {
            return "PM";
        }


        const parts =
            name
                .split(/\s+/)
                .filter(Boolean);


        if (parts.length === 1) {
            return parts[0]
                .substring(0, 2)
                .toUpperCase();
        }


        return (
            parts[0][0] +
            parts[parts.length - 1][0]
        ).toUpperCase();
    }


    function setProfileField(
        id,
        value
    ) {
        const element =
            document.getElementById(id);

        if (element) {
            element.textContent =
                value || "Not set";
        }
    }


    function refreshProfile() {
        const profile =
            getProfile();


        const initials =
            getProfileInitials(
                profile
            );


        const avatar =
            $("#pmProfileAvatar");


        if (avatar) {
            avatar.textContent =
                initials;
        }


        const displayName =
            $("#pmProfileDisplayName");


        const displayFarm =
            $("#pmProfileDisplayFarm");


        if (displayName) {
            displayName.textContent =
                profile.name ||
                "Your Profile";
        }


        if (displayFarm) {
            displayFarm.textContent =
                profile.farmName ||
                "Set up your farm profile";
        }


        setProfileField(
            "pmProfileName",
            profile.name
        );

        setProfileField(
            "pmProfileFarmName",
            profile.farmName
        );

        setProfileField(
            "pmProfileRole",
            profile.role
        );

        setProfileField(
            "pmProfileLocation",
            profile.location
        );

        setProfileField(
            "pmProfilePhone",
            profile.phone
        );

        setProfileField(
            "pmProfileEmail",
            profile.email
        );

        setProfileField(
            "pmProfileFarmType",
            profile.farmType
        );

        setProfileField(
            "pmProfileNotes",
            profile.notes
        );


        const flock =
            getFlockCount();

        const eggs =
            getTodayEggs();

        const feed =
            getFeedAmount();

        const rate =
            flock > 0
                ? Math.round(
                    (eggs / flock) *
                    100
                )
                : 0;


        const statFlock =
            $("#pmProfileStatFlock");

        const statEggs =
            $("#pmProfileStatEggs");

        const statRate =
            $("#pmProfileStatRate");

        const statFeed =
            $("#pmProfileStatFeed");


        if (statFlock) {
            statFlock.textContent =
                flock;
        }

        if (statEggs) {
            statEggs.textContent =
                eggs;
        }

        if (statRate) {
            statRate.textContent =
                `${rate}%`;
        }

        if (statFeed) {
            statFeed.textContent =
                `${feed.toFixed(1)} kg`;
        }
    }


    function openProfileEditor() {
        const profile =
            getProfile();


        const mappings = [
            [
                "pmProfileNameInput",
                profile.name
            ],
            [
                "pmProfileFarmNameInput",
                profile.farmName
            ],
            [
                "pmProfileRoleInput",
                profile.role
            ],
            [
                "pmProfileLocationInput",
                profile.location
            ],
            [
                "pmProfilePhoneInput",
                profile.phone
            ],
            [
                "pmProfileEmailInput",
                profile.email
            ],
            [
                "pmProfileFarmTypeInput",
                profile.farmType
            ],
            [
                "pmProfileNotesInput",
                profile.notes
            ]
        ];


        mappings.forEach(
            function ([id, value]) {
                const input =
                    document.getElementById(id);

                if (input) {
                    input.value =
                        value || "";
                }
            }
        );


        const form =
            $("#pmProfileEditForm");


        if (form) {
            form.hidden = false;
        }


        const button =
            $("#pmProfileEditButton");


        if (button) {
            button.hidden = true;
        }


        const firstInput =
            $("#pmProfileNameInput");


        if (firstInput) {
            setTimeout(
                () => firstInput.focus(),
                50
            );
        }
    }


    function closeProfileEditor() {
        const form =
            $("#pmProfileEditForm");

        if (form) {
            form.hidden = true;
        }


        const button =
            $("#pmProfileEditButton");

        if (button) {
            button.hidden = false;
        }
    }


    function saveProfileFromForm() {
        const value = id =>
            (
                document.getElementById(id)
            )?.value || "";


        saveProfile({
            name:
                value(
                    "pmProfileNameInput"
                ),

            farmName:
                value(
                    "pmProfileFarmNameInput"
                ),

            role:
                value(
                    "pmProfileRoleInput"
                ),

            location:
                value(
                    "pmProfileLocationInput"
                ),

            phone:
                value(
                    "pmProfilePhoneInput"
                ),

            email:
                value(
                    "pmProfileEmailInput"
                ),

            farmType:
                value(
                    "pmProfileFarmTypeInput"
                ),

            notes:
                value(
                    "pmProfileNotesInput"
                )
        });


        closeProfileEditor();


        notify(
            "Profile saved successfully.",
            "success"
        );


        createAutomaticBackupIfEnabled();
    }


    /* ============================================================
       NAVIGATION
       ============================================================ */

    const VIEW_CONFIG = {
        dashboard: {
            id: "pmDashboardView",
            button: "pmDashboardButton",
            title: "Dashboard"
        },

        farm: {
            id: "pmFarmView",
            button: "pmFarmButton",
            title: "My Farm"
        },

        profile: {
            id: "pmProfileView",
            button: "pmProfileButton",
            title: "Profile"
        },

        settings: {
            id: "pmSettingsView",
            button: "pmSettingsButton",
            title: "Settings"
        }
    };


    function updateHeaderTitle(
        view
    ) {
        const config =
            VIEW_CONFIG[view] ||
            VIEW_CONFIG.dashboard;


        const possibleTitles = [
            "#pmHeaderTitle",
            "#appTitle",
            ".app-title",
            "[data-pm-header-title]"
        ];


        for (
            const selector of possibleTitles
        ) {
            const element =
                $(selector);

            if (element) {
                element.textContent =
                    config.title;

                break;
            }
        }
    }


    function updateNavigation(
        activeView
    ) {
        Object.keys(VIEW_CONFIG)
            .forEach(
                function (view) {
                    const button =
                        document.getElementById(
                            VIEW_CONFIG[view].button
                        );


                    if (!button) {
                        return;
                    }


                    const active =
                        view === activeView;


                    button.classList.toggle(
                        "active",
                        active
                    );


                    if (active) {
                        button.setAttribute(
                            "aria-current",
                            "page"
                        );
                    } else {
                        button.removeAttribute(
                            "aria-current"
                        );
                    }
                }
            );
    }


    function setViewVisibility(
        activeView
    ) {
        Object.keys(VIEW_CONFIG)
            .forEach(
                function (view) {
                    const element =
                        document.getElementById(
                            VIEW_CONFIG[view].id
                        );


                    if (!element) {
                        return;
                    }


                    const active =
                        view === activeView;


                    element.hidden =
                        !active;


                    element.classList.toggle(
                        "pm-view-active",
                        active
                    );
                }
            );


        updateNavigation(
            activeView
        );

        updateHeaderTitle(
            activeView
        );
    }


    function showView(
        view,
        options = {}
    ) {
        if (!VIEW_CONFIG[view]) {
            view = "dashboard";
        }


        setViewVisibility(view);


        writeStorage(
            APP.storage.lastView,
            view
        );


        if (view === "dashboard") {
            refreshProduction();
            updateFarmOverview();

        } else if (view === "farm") {
            updateEggDisplay();
            updateEggHistory();
            updateFeedManagement();
            updateFeedHistory();
            updateFarmSnapshot();

        } else if (view === "profile") {
            refreshProfile();

        } else if (view === "settings") {
            refreshSettings();
        }


        if (
            options.scroll !== false
        ) {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    }


    function showDashboard(
        options = {}
    ) {
        showView(
            "dashboard",
            options
        );
    }


    function showFarm(
        options = {}
    ) {
        showView(
            "farm",
            options
        );
    }


    function showProfile(
        options = {}
    ) {
        showView(
            "profile",
            options
        );
    }


    function showSettings(
        options = {}
    ) {
        showView(
            "settings",
            options
        );
    }


    function createNavigation() {
        const nav =
            $("#pmAppNavigation");


        if (!nav) {
            return;
        }


        const buttons = [
            {
                id:
                    "pmDashboardButton",

                label:
                    "Dashboard",

                icon:
                    "⌂",

                view:
                    "dashboard"
            },

            {
                id:
                    "pmFarmButton",

                label:
                    "My Farm",

                icon:
                    "♜",

                view:
                    "farm"
            },

            {
                id:
                    "pmProfileButton",

                label:
                    "Profile",

                icon:
                    "●",

                view:
                    "profile"
            },

            {
                id:
                    "pmSettingsButton",

                label:
                    "Settings",

                icon:
                    "⚙",

                view:
                    "settings"
            }
        ];


        buttons.forEach(
            function (item) {
                let button =
                    document.getElementById(
                        item.id
                    );


                if (!button) {
                    button =
                        document.createElement(
                            "button"
                        );

                    button.id =
                        item.id;

                    nav.appendChild(
                        button
                    );
                }


                button.type =
                    "button";

                button.dataset.view =
                    item.view;

                button.setAttribute(
                    "aria-label",
                    item.label
                );


                /*
                 * Only populate an empty button.
                 * This preserves the styling/content
                 * already supplied in index.html.
                 */
                if (
                    !button.textContent.trim()
                ) {
                    button.innerHTML =
                        `
                        <span
                            class="pm-nav-icon"
                            aria-hidden="true"
                        >
                            ${item.icon}
                        </span>

                        <span>
                            ${item.label}
                        </span>
                        `;
                }


                button.onclick =
                    function () {
                        showView(
                            item.view
                        );
                    };
            }
        );


        updateNavigation(
            "dashboard"
        );
    }


    /* ============================================================
       QUICK ACTIONS
       ============================================================ */

    function initializeQuickActions() {
        const addEggButton =
            $("#quickAddEggs");

        const feedButton =
            $("#quickFeed");

        const historyButton =
            $("#quickHistory");


        if (addEggButton) {
            addEggButton.onclick =
                function () {
                    showFarm();

                    addEggs(1);

                    setTimeout(
                        function () {
                            scrollToElement(
                                $("#eggCount")
                            );
                        },
                        150
                    );
                };
        }


        if (feedButton) {
            feedButton.onclick =
                function () {
                    showFarm();

                    setTimeout(
                        function () {
                            const input =
                                $("#useFeedInput");

                            scrollToElement(
                                input
                            );

                            if (input) {
                                input.focus();
                            }
                        },
                        150
                    );
                };
        }


        if (historyButton) {
            historyButton.onclick =
                function () {
                    showFarm();

                    setTimeout(
                        function () {
                            scrollToElement(
                                $("#eggHistoryList")
                            );

                            showAllEggHistory();
                        },
                        150
                    );
                };
        }
    }


    /* ============================================================
       FLOCK CONTROLS IN MY FARM
       ============================================================ */

    function initializeFlockControls() {
        const minus =
            $("#myFarmFlockMinus");

        const plus =
            $("#myFarmFlockPlus");


        if (minus) {
            minus.onclick =
                function () {
                    setFlockCount(
                        Math.max(
                            0,
                            getFlockCount() - 1
                        )
                    );
                };
        }


        if (plus) {
            plus.onclick =
                function () {
                    setFlockCount(
                        getFlockCount() + 1
                    );
                };
        }


        updateFarmSnapshot();
    }


    /* ============================================================
       EGG CONTROLS
       ============================================================ */

    function initializeEggControls() {
        const add =
            $("#addEggButton");

        const remove =
            $("#removeEggButton");

        const history =
            $("#viewHistoryButton");


        if (add) {
            add.onclick =
                function () {
                    addEggs(1);
                };
        }


        if (remove) {
            remove.onclick =
                function () {
                    removeEggs(1);
                };
        }


        if (history) {
            history.onclick =
                function () {
                    const list =
                        $("#eggHistoryList");

                    if (!list) {
                        return;
                    }


                    const isHidden =
                        list.dataset.expanded !==
                        "true";


                    if (isHidden) {
                        showAllEggHistory();

                        list.dataset.expanded =
                            "true";

                        history.textContent =
                            "Show Recent";

                    } else {
                        updateEggHistory();

                        list.dataset.expanded =
                            "false";

                        history.textContent =
                            "View History";
                    }
                };
        }


        updateEggDisplay();
        updateEggHistory();
    }


    /* ============================================================
       FEED CONTROLS
       ============================================================ */

    function initializeFeedControls() {
        const addInput =
            $("#feedInput");

        const addButton =
            $("#addFeedButton");

        const useInput =
            $("#useFeedInput");

        const useButton =
            $("#useFeedButton");

        const resetToday =
            $("#resetFeedTodayButton");

        const historyButton =
            $("#viewFeedHistoryButton");


        if (addButton) {
            addButton.onclick =
                function () {
                    if (
                        addFeed(
                            addInput?.value
                        )
                    ) {
                        if (addInput) {
                            addInput.value =
                                "";
                        }
                    }
                };
        }


        if (useButton) {
            useButton.onclick =
                function () {
                    if (
                        useFeed(
                            useInput?.value
                        )
                    ) {
                        if (useInput) {
                            useInput.value =
                                "";
                        }
                    }
                };
        }


        if (resetToday) {
            resetToday.onclick =
                function () {
                    resetTodayFeedUsage();
                };
        }


        if (historyButton) {
            historyButton.onclick =
                function () {
                    const list =
                        $("#feedHistoryList");

                    if (!list) {
                        return;
                    }


                    const expanded =
                        list.dataset.expanded ===
                        "true";


                    if (expanded) {
                        updateFeedHistory();

                        list.dataset.expanded =
                            "false";

                        historyButton.textContent =
                            "View Feed History";

                    } else {
                        showAllFeedHistory();

                        list.dataset.expanded =
                            "true";

                        historyButton.textContent =
                            "Show Recent";
                    }
                };
        }


        [addInput, useInput]
            .forEach(
                function (input) {
                    if (!input) {
                        return;
                    }


                    input.addEventListener(
                        "keydown",
                        function (event) {
                            if (
                                event.key !==
                                "Enter"
                            ) {
                                return;
                            }


                            event.preventDefault();


                            if (
                                input ===
                                addInput
                            ) {
                                addButton?.click();
                            } else {
                                useButton?.click();
                            }
                        }
                    );
                }
            );


        updateFeedManagement();
        updateFeedHistory();
    }


    /* ============================================================
       DYNAMIC FEED ACTION BUTTONS
       ============================================================ */

    function ensureFeedActionButtons() {
        const container =
            $("#feedManagementSection") ||
            $("#feedSection") ||
            $("#pmFarmView");


        if (!container) {
            return;
        }


        let actionRow =
            $("#pmFeedActionButtons");


        if (!actionRow) {
            actionRow =
                document.createElement(
                    "div"
                );

            actionRow.id =
                "pmFeedActionButtons";

            actionRow.className =
                "pm-feed-extra-actions";


            const historyList =
                $("#feedHistoryList");


            if (
                historyList &&
                historyList.parentElement
            ) {
                historyList.parentElement
                    .insertBefore(
                        actionRow,
                        historyList
                    );

            } else {
                container.appendChild(
                    actionRow
                );
            }
        }


        if (
            !$("#undoFeedButton")
        ) {
            const undo =
                document.createElement(
                    "button"
                );

            undo.id =
                "undoFeedButton";

            undo.type =
                "button";

            undo.textContent =
                "Undo Last Addition";

            undo.className =
                "pm-secondary-button";

            undo.onclick =
                function () {
                    undoLastFeedAddition();
                };

            actionRow.appendChild(
                undo
            );
        }


        if (
            !$("#resetFeedStockButton")
        ) {
            const reset =
                document.createElement(
                    "button"
                );

            reset.id =
                "resetFeedStockButton";

            reset.type =
                "button";

            reset.textContent =
                "Reset Stock";

            reset.className =
                "pm-secondary-button";

            reset.onclick =
                function () {
                    resetFeedStock();
                };

            actionRow.appendChild(
                reset
            );
        }
    }


    /* ============================================================
       FEED ALARM
       ============================================================ */

    function isAlarmEnabled() {
        return (
            readStorage(
                APP.storage.alarm,
                "false"
            ) === "true"
        );
    }


    function setAlarmEnabled(enabled) {
        writeStorage(
            APP.storage.alarm,
            enabled
                ? "true"
                : "false"
        );

        updateAlarmStatus();
    }


    function updateAlarmStatus() {
        const toggle =
            $("#pmAlarmToggle");

        const status =
            $("#pmAlarmStatus");


        const enabled =
            isAlarmEnabled();


        if (toggle) {
            toggle.checked =
                enabled;
        }


        if (status) {
            status.textContent =
                enabled
                    ? "Feed alarm is enabled."
                    : "Feed alarm is disabled.";
        }
    }


    function triggerFeedNotification(
        period,
        time
    ) {
        const title =
            "Poultry Manager";


        const message =
            `${period} feed time — ${formatTime(
                time
            )}.`;


        try {
            if (
                "Notification" in
                window &&
                Notification.permission ===
                    "granted"
            ) {
                new Notification(
                    title,
                    {
                        body: message,
                        icon: "icon-192.png"
                    }
                );
            }
        } catch (error) {
            console.warn(
                "Notification failed:",
                error
            );
        }


        notify(
            message,
            "info"
        );
    }


    function checkFeedAlarm() {
        if (!isAlarmEnabled()) {
            return;
        }


        const schedule =
            getFeedSchedule();


        const now =
            new Date();


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


        const today =
            getTodayKey();


        const triggered =
            readJSON(
                APP.storage.alarmTriggered,
                {}
            );


        const periods = [
            {
                name: "Morning",
                time: schedule.morning
            },
            {
                name: "Afternoon",
                time: schedule.afternoon
            }
        ];


        let changed = false;


        periods.forEach(
            function (period) {
                if (
                    period.time !==
                    currentTime
                ) {
                    return;
                }


                const key =
                    `${today}_${period.name}`;


                if (
                    triggered[key]
                ) {
                    return;
                }


                triggered[key] =
                    true;

                changed = true;


                triggerFeedNotification(
                    period.name,
                    period.time
                );
            }
        );


        if (changed) {
            writeJSON(
                APP.storage.alarmTriggered,
                triggered
            );
        }
    }


    /* ============================================================
       PUSH NOTIFICATIONS
       ============================================================ */

    function areNotificationsEnabled() {
        return (
            readStorage(
                APP.storage.notifications,
                "false"
            ) === "true"
        );
    }


    function base64ToUint8Array(
        base64String
    ) {
        const padding =
            "=".repeat(
                (4 -
                    (
                        base64String.length %
                        4
                    )) %
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
                char =>
                    char.charCodeAt(0)
            )
        );
    }


    async function getServiceWorkerRegistration() {
        if (
            !("serviceWorker" in navigator)
        ) {
            return null;
        }


        try {
            return await navigator.serviceWorker.ready;

        } catch (error) {
            console.warn(
                "Service worker unavailable:",
                error
            );

            return null;
        }
    }


    async function enablePushNotifications() {
        if (
            !("Notification" in window)
        ) {
            notify(
                "Notifications are not supported by this browser.",
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
                permission !== "granted"
            ) {
                writeStorage(
                    APP.storage.notifications,
                    "false"
                );

                updateNotificationStatus();

                notify(
                    "Notification permission was not granted.",
                    "warning"
                );

                return false;
            }


            const registration =
                await getServiceWorkerRegistration();


            if (!registration) {
                throw new Error(
                    "Service worker unavailable."
                );
            }


            const keyResponse =
                await fetch(
                    `${APP.renderBase}/vapid-public-key`
                );


            if (!keyResponse.ok) {
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
                    "Notification public key missing."
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
                                base64ToUint8Array(
                                    publicKey
                                )
                        });
            }


            const subscribeResponse =
                await fetch(
                    `${APP.renderBase}/subscribe`,
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
                    "Server subscription failed."
                );
            }


            writeStorage(
                APP.storage.notifications,
                "true"
            );


            updateNotificationStatus();


            notify(
                "Push notifications are enabled.",
                "success"
            );


            createAutomaticBackupIfEnabled();


            return true;

        } catch (error) {
            console.error(
                "Push notification setup failed:",
                error
            );


            writeStorage(
                APP.storage.notifications,
                "false"
            );


            updateNotificationStatus();


            notify(
                "Notifications could not be enabled right now.",
                "warning"
            );


            return false;
        }
    }


    function updateNotificationStatus() {
        const status =
            $("#pmNotificationsStatus");

        const button =
            $("#pmEnableNotificationsButton");


        const enabled =
            areNotificationsEnabled();


        if (status) {
            status.textContent =
                enabled
                    ? "Push notifications are enabled."
                    : "Push notifications are not enabled.";
        }


        if (button) {
            button.textContent =
                enabled
                    ? "Notifications Enabled"
                    : "Enable Notifications";

            button.disabled =
                enabled;
        }
    }


    /* ============================================================
       SETTINGS VIEW
       ============================================================ */

    function createSettingsView() {
        let view =
            $("#pmSettingsView");


        if (!view) {
            view =
                document.createElement(
                    "main"
                );

            view.id =
                "pmSettingsView";

            view.className =
                "pm-view";

            document.body.appendChild(
                view
            );
        }


        /*
         * Do not rebuild an already-created settings
         * interface. This keeps event handlers stable.
         */
        if (
            view.dataset.initialized ===
            "true"
        ) {
            return view;
        }


        view.innerHTML =
            `
            <div class="pm-settings-shell">

                <section class="pm-section">
                    <div class="pm-section-heading">
                        <div>
                            <span class="pm-eyebrow">
                                Settings
                            </span>

                            <h2>
                                Farm controls
                            </h2>

                            <p>
                                Manage feeding, alarms,
                                notifications and your data.
                            </p>
                        </div>
                    </div>
                </section>


                <section class="pm-section">
                    <div class="pm-section-heading">
                        <div>
                            <span class="pm-eyebrow">
                                Feeding schedule
                            </span>

                            <h2>
                                Feed times
                            </h2>
                        </div>
                    </div>


                    <div class="pm-settings-card">

                        <div class="pm-setting-row">
                            <div>
                                <strong>
                                    Morning feed
                                </strong>

                                <span>
                                    Set your first daily feeding time.
                                </span>
                            </div>

                            <input
                                id="pmMorningFeedInput"
                                type="time"
                            />
                        </div>


                        <div class="pm-setting-row">
                            <div>
                                <strong>
                                    Afternoon feed
                                </strong>

                                <span>
                                    Set your second daily feeding time.
                                </span>
                            </div>

                            <input
                                id="pmAfternoonFeedInput"
                                type="time"
                            />
                        </div>


                        <button
                            id="pmSaveScheduleButton"
                            type="button"
                            class="pm-primary-button"
                        >
                            Save Schedule
                        </button>


                        <p
                            id="pmScheduleStatus"
                            class="pm-setting-status"
                        ></p>

                    </div>
                </section>


                <section class="pm-section">
                    <div class="pm-section-heading">
                        <div>
                            <span class="pm-eyebrow">
                                Alerts
                            </span>

                            <h2>
                                Feed alarm
                            </h2>
                        </div>
                    </div>


                    <div class="pm-settings-card">

                        <label class="pm-setting-toggle">

                            <span>
                                <strong>
                                    Feed alarm
                                </strong>

                                <small>
                                    Remind you when a scheduled feed time arrives.
                                </small>
                            </span>

                            <input
                                id="pmAlarmToggle"
                                type="checkbox"
                            />

                        </label>


                        <p
                            id="pmAlarmStatus"
                            class="pm-setting-status"
                        ></p>

                    </div>
                </section>


                <section class="pm-section">
                    <div class="pm-section-heading">
                        <div>
                            <span class="pm-eyebrow">
                                Notifications
                            </span>

                            <h2>
                                Push notifications
                            </h2>
                        </div>
                    </div>


                    <div class="pm-settings-card">

                        <p
                            id="pmNotificationsStatus"
                            class="pm-setting-status"
                        ></p>


                        <button
                            id="pmEnableNotificationsButton"
                            type="button"
                            class="pm-primary-button"
                        >
                            Enable Notifications
                        </button>

                    </div>
                </section>


                <section class="pm-section">
                    <div class="pm-section-heading">
                        <div>
                            <span class="pm-eyebrow">
                                Appearance
                            </span>

                            <h2>
                                Theme
                            </h2>
                        </div>
                    </div>


                    <div class="pm-settings-card">

                        <div class="pm-setting-row">
                            <div>
                                <strong>
                                    App theme
                                </strong>

                                <span>
                                    Choose light or dark mode.
                                </span>
                            </div>

                            <select
                                id="pmThemeSelect"
                            >
                                <option value="light">
                                    Light
                                </option>

                                <option value="dark">
                                    Dark
                                </option>
                            </select>
                        </div>

                    </div>
                </section>


                <section class="pm-section">
                    <div class="pm-section-heading">
                        <div>
                            <span class="pm-eyebrow">
                                Data
                            </span>

                            <h2>
                                Backup & restore
                            </h2>

                            <p>
                                Keep a copy of your Poultry Manager data.
                            </p>
                        </div>
                    </div>


                    <div class="pm-settings-card">

                        <label class="pm-setting-toggle">

                            <span>
                                <strong>
                                    Automatic backup
                                </strong>

                                <small>
                                    Create a local backup periodically.
                                </small>
                            </span>

                            <input
                                id="pmAutomaticBackupToggle"
                                type="checkbox"
                            />

                        </label>


                        <div class="pm-settings-actions">

                            <button
                                id="pmExportBackupButton"
                                type="button"
                                class="pm-secondary-button"
                            >
                                Export Backup
                            </button>


                            <button
                                id="pmImportBackupButton"
                                type="button"
                                class="pm-secondary-button"
                            >
                                Import Backup
                            </button>

                        </div>


                        <input
                            id="pmBackupFileInput"
                            type="file"
                            accept=".json,application/json"
                            hidden
                        />


                        <p
                            id="pmBackupStatus"
                            class="pm-setting-status"
                        ></p>

                    </div>
                </section>


                <section class="pm-section">
                    <div class="pm-settings-card pm-about-card">

                        <span class="pm-eyebrow">
                            About
                        </span>

                        <h2>
                            Poultry Manager
                        </h2>

                        <p>
                            A practical farm management tool
                            for tracking flock production,
                            eggs, feed and daily operations.
                        </p>

                        <span class="pm-version-label">
                            Version ${APP.version}
                        </span>

                    </div>
                </section>

            </div>
            `;


        view.dataset.initialized =
            "true";


        initializeSettingsEvents();


        return view;
    }


    function refreshSettings() {
        const view =
            $("#pmSettingsView");


        if (!view) {
            return;
        }


        const schedule =
            getFeedSchedule();


        const morning =
            $("#pmMorningFeedInput");

        const afternoon =
            $("#pmAfternoonFeedInput");

        const flock =
            $("#pmSettingsFlockInput");

        const alarm =
            $("#pmAlarmToggle");

        const theme =
            $("#pmThemeSelect");

        const automaticBackup =
            $("#pmAutomaticBackupToggle");


        if (morning) {
            morning.value =
                schedule.morning;
        }


        if (afternoon) {
            afternoon.value =
                schedule.afternoon;
        }


        if (flock) {
            flock.value =
                getFlockCount();
        }


        if (alarm) {
            alarm.checked =
                isAlarmEnabled();
        }


        if (theme) {
            theme.value =
                getTheme();
        }


        if (automaticBackup) {
            automaticBackup.checked =
                isAutomaticBackupEnabled();
        }


        updateAlarmStatus();
        updateNotificationStatus();
        updateBackupStatus();
    }


    let settingsEventsInitialized =
        false;


    function initializeSettingsEvents() {
        if (
            settingsEventsInitialized
        ) {
            return;
        }


        settingsEventsInitialized =
            true;


        const saveSchedule =
            $("#pmSaveScheduleButton");


        const alarm =
            $("#pmAlarmToggle");


        const notificationButton =
            $("#pmEnableNotificationsButton");


        const theme =
            $("#pmThemeSelect");


        const automaticBackup =
            $("#pmAutomaticBackupToggle");


        const exportButton =
            $("#pmExportBackupButton");


        const importButton =
            $("#pmImportBackupButton");


        const fileInput =
            $("#pmBackupFileInput");


        if (saveSchedule) {
            saveSchedule.onclick =
                function () {
                    const morning =
                        $("#pmMorningFeedInput")
                            ?.value;

                    const afternoon =
                        $("#pmAfternoonFeedInput")
                            ?.value;


                    if (
                        !morning ||
                        !afternoon
                    ) {
                        notify(
                            "Please select both feed times.",
                            "warning"
                        );

                        return;
                    }


                    saveFeedSchedule(
                        morning,
                        afternoon
                    );


                    const status =
                        $("#pmScheduleStatus");

                    if (status) {
                        status.textContent =
                            "Schedule saved successfully.";
                    }


                    notify(
                        "Feed schedule saved.",
                        "success"
                    );
                };
        }


        if (alarm) {
            alarm.onchange =
                function () {
                    setAlarmEnabled(
                        alarm.checked
                    );


                    notify(
                        alarm.checked
                            ? "Feed alarm enabled."
                            : "Feed alarm disabled.",
                        "success"
                    );
                };
        }


        if (notificationButton) {
            notificationButton.onclick =
                function () {
                    enablePushNotifications();
                };
        }


        if (theme) {
            theme.onchange =
                function () {
                    setTheme(
                        theme.value
                    );
                };
        }


        if (automaticBackup) {
            automaticBackup.onchange =
                function () {
                    setAutomaticBackupEnabled(
                        automaticBackup.checked
                    );


                    if (
                        automaticBackup.checked
                    ) {
                        createAutomaticBackup();
                    }
                };
        }


        if (exportButton) {
            exportButton.onclick =
                function () {
                    exportBackup();
                };
        }


        if (importButton) {
            importButton.onclick =
                function () {
                    fileInput?.click();
                };
        }


        if (fileInput) {
            fileInput.onchange =
                function () {
                    const file =
                        fileInput.files?.[0];

                    if (file) {
                        restoreBackupFromFile(
                            file
                        );
                    }


                    fileInput.value =
                        "";
                };
        }
    }


    /* ============================================================
       THEME
       ============================================================ */

    function getTheme() {
        const stored =
            readStorage(
                APP.storage.theme,
                APP.defaults.theme
            );


        return stored === "dark"
            ? "dark"
            : "light";
    }


    function setTheme(theme) {
        const value =
            theme === "dark"
                ? "dark"
                : "light";


        document.documentElement
            .setAttribute(
                "data-theme",
                value
            );


        writeStorage(
            APP.storage.theme,
            value
        );


        const select =
            $("#pmThemeSelect");

        if (select) {
            select.value =
                value;
        }


        setTimeout(
            function () {
                updateProductionTrend();
                updateFeedConsumptionChart();
            },
            50
        );


        return value;
    }


    function initializeTheme() {
        setTheme(
            getTheme()
        );
    }


    /* ============================================================
       BACKUP / RESTORE
       ============================================================ */

    function isAutomaticBackupEnabled() {
        return (
            readStorage(
                APP.storage.automaticBackup,
                "false"
            ) === "true"
        );
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


        updateBackupStatus();
    }


    function collectAllStorage() {
        const data = {};


        for (
            let i = 0;
            i < localStorage.length;
            i++
        ) {
            const key =
                localStorage.key(i);

            if (!key) {
                continue;
            }


            data[key] =
                localStorage.getItem(
                    key
                );
        }


        return data;
    }


    function createBackupObject() {
        return {
            app:
                APP.name,

            version:
                APP.version,

            createdAt:
                new Date().toISOString(),

            storage:
                collectAllStorage()
        };
    }


    function createAutomaticBackup() {
        const backup =
            createBackupObject();


        writeJSON(
            APP.storage.backupData,
            backup
        );


        writeStorage(
            APP.storage.lastBackup,
            backup.createdAt
        );


        updateBackupStatus();


        return backup;
    }


    function createAutomaticBackupIfEnabled() {
        if (
            !isAutomaticBackupEnabled()
        ) {
            return;
        }


        createAutomaticBackup();
    }


    function scheduleAutomaticBackup() {
        setInterval(
            function () {
                if (
                    !isAutomaticBackupEnabled()
                ) {
                    return;
                }


                const last =
                    readStorage(
                        APP.storage.lastBackup,
                        ""
                    );


                if (!last) {
                    createAutomaticBackup();
                    return;
                }


                const elapsed =
                    Date.now() -
                    new Date(last).getTime();


                /*
                 * One backup every 24 hours.
                 */
                if (
                    elapsed >=
                    24 * 60 * 60 * 1000
                ) {
                    createAutomaticBackup();
                }

            },
            60 * 60 * 1000
        );
    }


    function updateBackupStatus() {
        const status =
            $("#pmBackupStatus");


        if (!status) {
            return;
        }


        const enabled =
            isAutomaticBackupEnabled();


        const last =
            readStorage(
                APP.storage.lastBackup,
                ""
            );


        if (!last) {
            status.textContent =
                enabled
                    ? "Automatic backup is enabled. No backup created yet."
                    : "Automatic backup is disabled.";

            return;
        }


        status.textContent =
            enabled
                ? `Last backup: ${formatDate(
                    new Date(last)
                )} ${formatTime(
                    `${String(
                        new Date(last).getHours()
                    ).padStart(2, "0")}:${String(
                        new Date(last).getMinutes()
                    ).padStart(2, "0")}`
                )}`
                : `Last backup: ${formatDate(
                    new Date(last)
                )}`;
    }


    function exportBackup() {
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
            function () {
                URL.revokeObjectURL(
                    url
                );
            },
            1000
        );


        writeStorage(
            APP.storage.lastBackup,
            backup.createdAt
        );


        updateBackupStatus();


        notify(
            "Backup exported successfully.",
            "success"
        );
    }


    async function restoreBackupFromFile(
        file
    ) {
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
                typeof backup !==
                    "object"
            ) {
                throw new Error(
                    "Invalid backup."
                );
            }


            if (
                backup.app &&
                backup.app !==
                    APP.name
            ) {
                throw new Error(
                    "This backup belongs to a different application."
                );
            }


            const storage =
                backup.storage;


            if (
                !storage ||
                typeof storage !==
                    "object"
            ) {
                throw new Error(
                    "Backup storage data is missing."
                );
            }


            if (
                !confirmAction(
                    "Restore this backup? Current Poultry Manager data will be replaced."
                )
            ) {
                return false;
            }


            localStorage.clear();


            Object.keys(storage)
                .forEach(
                    function (key) {
                        localStorage.setItem(
                            key,
                            storage[key]
                        );
                    }
                );


            notify(
                "Backup restored. Reloading Poultry Manager...",
                "success"
            );


            setTimeout(
                function () {
                    window.location.reload();
                },
                700
            );


            return true;

        } catch (error) {
            console.error(
                "Backup restore failed:",
                error
            );


            notify(
                "Could not restore that backup.",
                "warning"
            );


            return false;
        }
    }


    /* ============================================================
       APPLICATION SHELL
       ============================================================ */

    function hideLegacyBackupSection() {
        const selectors = [
            "#backupSection",
            "#automaticBackupSection",
            ".legacy-backup-section"
        ];


        selectors.forEach(
            function (selector) {
                $$(selector)
                    .forEach(
                        element => {
                            /*
                             * Only hide obvious legacy
                             * backup containers. Do not hide
                             * the new Settings interface.
                             */
                            if (
                                element.id !==
                                "pmSettingsView"
                            ) {
                                element.hidden =
                                    true;
                            }
                        }
                    );
            }
        );
    }


    function initializeAppShell() {
        const header =
            $("header");


        if (header) {
            header.setAttribute(
                "role",
                "banner"
            );
        }


        $$("main")
            .forEach(
                function (main) {
                    main.setAttribute(
                        "role",
                        "main"
                    );
                }
            );


        createNavigation();


        hideLegacyBackupSection();


        [
            "pmDashboardView",
            "pmFarmView",
            "pmProfileView",
            "pmSettingsView"
        ].forEach(
            function (id) {
                const element =
                    document.getElementById(
                        id
                    );

                if (element) {
                    element.classList.add(
                        "pm-view"
                    );
                }
            }
        );
    }


    /* ============================================================
       HEADER DATE
       ============================================================ */

    function updateHeaderDate() {
        const selectors = [
            "#pmHeaderDate",
            "#headerDate",
            "[data-pm-date]"
        ];


        const date =
            new Date();


        const text =
            date.toLocaleDateString(
                undefined,
                {
                    weekday: "short",
                    month: "short",
                    day: "numeric"
                }
            );


        for (
            const selector of selectors
        ) {
            const element =
                $(selector);

            if (element) {
                element.textContent =
                    text;

                break;
            }
        }
    }


    /* ============================================================
       CHART RESIZE
       ============================================================ */

    function initializeChartResize() {
        let resizeTimer = null;


        window.addEventListener(
            "resize",
            function () {
                clearTimeout(
                    resizeTimer
                );


                resizeTimer =
                    setTimeout(
                        function () {
                            updateProductionTrend();
                            updateFeedConsumptionChart();
                        },
                        120
                    );
            }
        );
    }


    /* ============================================================
       MIDNIGHT ROLLOVER
       ============================================================ */

    let lastKnownDate =
        getTodayKey();


    function checkMidnightRollover() {
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
         * Prevent yesterday's alarm markers
         * from blocking today's notifications.
         */
        const triggered =
            readJSON(
                APP.storage.alarmTriggered,
                {}
            );


        const clean = {};


        Object.keys(triggered)
            .forEach(
                function (key) {
                    if (
                        key.startsWith(
                            `${currentDate}_`
                        )
                    ) {
                        clean[key] =
                            triggered[key];
                    }
                }
            );


        writeJSON(
            APP.storage.alarmTriggered,
            clean
        );


        refreshAll();


        notify(
            "A new production day has started.",
            "info"
        );
    }


    /* ============================================================
       SERVICE WORKER / PWA
       ============================================================ */

    async function initializeServiceWorker() {
        if (
            !("serviceWorker" in navigator)
        ) {
            return null;
        }


        try {
            const registration =
                await navigator.serviceWorker
                    .register(
                        "sw.js"
                    );


            console.log(
                "Service worker registered:",
                registration.scope
            );


            return registration;

        } catch (error) {
            console.warn(
                "Service worker registration failed:",
                error
            );


            return null;
        }
    }


    function initializePWAHints() {
        let deferredPrompt =
            null;


        window.addEventListener(
            "beforeinstallprompt",
            function (event) {
                event.preventDefault();

                deferredPrompt =
                    event;


                window.PoultryManagerInstall =
                    async function () {
                        if (
                            !deferredPrompt
                        ) {
                            return false;
                        }


                        deferredPrompt.prompt();


                        const result =
                            await deferredPrompt.userChoice;


                        deferredPrompt =
                            null;


                        return (
                            result.outcome ===
                            "accepted"
                        );
                    };
            }
        );


        window.addEventListener(
            "appinstalled",
            function () {
                deferredPrompt =
                    null;


                notify(
                    "Poultry Manager has been installed.",
                    "success"
                );
            }
        );
    }


    /* ============================================================
       DATA NORMALIZATION
       ============================================================ */

    function normalizeStoredData() {
        /*
         * Flock
         */
        const flock =
            getFlockCount();


        writeStorage(
            APP.storage.flock,
            flock
        );


        /*
         * Feed
         */
        const feed =
            getFeedAmount();


        writeStorage(
            APP.storage.feed,
            feed
        );


        /*
         * Eggs
         */
        saveEggHistory(
            getEggHistory()
        );


        /*
         * Feed usage
         */
        saveFeedUsageHistory(
            getFeedUsageHistory()
        );


        /*
         * Feed additions
         */
        saveFeedAdditionHistory(
            getFeedAdditionHistory()
        );


        /*
         * Profile
         */
        const profile =
            getProfile();


        writeJSON(
            APP.storage.profile,
            profile
        );
    }


    function initializeDefaultSchedule() {
        const schedule =
            getFeedSchedule();


        saveFeedSchedule(
            schedule.morning,
            schedule.afternoon,
            false
        );
    }


    function initializeInputDefaults() {
        const feedInput =
            $("#feedInput");

        const useFeedInput =
            $("#useFeedInput");


        if (feedInput) {
            feedInput.inputMode =
                "decimal";
        }


        if (useFeedInput) {
            useFeedInput.inputMode =
                "decimal";
        }


        const email =
            $("#pmProfileEmailInput");


        if (email) {
            email.type =
                "email";
        }
    }


    /* ============================================================
       REFRESH SYSTEM
       ============================================================ */

    function refreshAll() {
        updateEggDisplay();

        updateEggHistory();

        refreshProduction();

        updateFeedManagement();

        updateFeedHistory();

        updateFarmOverview();

        updateFarmSnapshot();

        updateNextFeed();

        refreshProfile();

        updateAlarmStatus();

        updateNotificationStatus();

        updateBackupStatus();

        updateHeaderDate();
    }


    let farmOverviewRefreshTimer =
        null;


    function startFarmOverviewRefresh() {
        if (
            farmOverviewRefreshTimer
        ) {
            clearInterval(
                farmOverviewRefreshTimer
            );
        }


        farmOverviewRefreshTimer =
            setInterval(
                function () {
                    updateFarmOverview();
                    updateNextFeed();
                },
                1000
            );
    }


    function initializeGlobalRefresh() {
        setInterval(
            function () {
                checkMidnightRollover();

                updateNextFeed();

                updateFarmOverview();

                updateFeedManagement();

                checkFeedAlarm();
            },
            1000
        );
    }


    /* ============================================================
       PROFILE EVENT INITIALIZATION
       ============================================================ */

    function initializeProfile() {
        const edit =
            $("#pmProfileEditButton");

        const cancel =
            $("#pmProfileCancelButton");

        const save =
            $("#pmProfileSaveButton");


        if (edit) {
            edit.onclick =
                function () {
                    openProfileEditor();
                };
        }


        if (cancel) {
            cancel.onclick =
                function () {
                    closeProfileEditor();
                };
        }


        if (save) {
            save.onclick =
                function () {
                    saveProfileFromForm();
                };
        }


        refreshProfile();
    }


    /* ============================================================
       KEYBOARD ACCESSIBILITY
       ============================================================ */

    function initializeKeyboard() {
        document.addEventListener(
            "keydown",
            function (event) {
                if (
                    event.key ===
                    "Escape"
                ) {
                    const active =
                        document.activeElement;

                    if (
                        active &&
                        typeof active.blur ===
                            "function"
                    ) {
                        active.blur();
                    }
                }
            }
        );
    }


    /* ============================================================
       LAST VIEW
       ============================================================ */

    function restoreLastView() {
        /*
         * Dashboard remains the default startup screen.
         * The last view is still stored so navigation state
         * remains compatible with the application architecture.
         */
        showDashboard({
            scroll: false
        });
    }


    /* ============================================================
       PUBLIC API
       ============================================================ */

    window.PoultryManager = {

        version:
            APP.version,

        refresh:
            refreshAll,

        addEggs:
            addEggs,

        removeEggs:
            removeEggs,

        addFeed:
            addFeed,

        useFeed:
            useFeed,

        undoLastFeedAddition:
            undoLastFeedAddition,

        resetFeedStock:
            resetFeedStock,

        resetTodayFeedUsage:
            resetTodayFeedUsage,

        getFlockCount:
            getFlockCount,

        setFlockCount:
            setFlockCount,

        getTodayEggs:
            getTodayEggs,

        getEggHistory:
            getEggHistory,

        getFeedAmount:
            getFeedAmount,

        getFeedUsageHistory:
            getFeedUsageHistory,

        getFeedSchedule:
            getFeedSchedule,

        saveFeedSchedule:
            saveFeedSchedule,

        getNextFeed:
            getNextFeed,

        enablePushNotifications:
            enablePushNotifications,

        showDashboard:
            showDashboard,

        showFarm:
            showFarm,

        showProfile:
            showProfile,

        showSettings:
            showSettings,

        showView:
            showView,

        getProfile:
            getProfile,

        saveProfile:
            saveProfile,

        refreshProfile:
            refreshProfile,

        refreshSettings:
            refreshSettings,

        updateFarmOverview:
            updateFarmOverview,

        refreshAll:
            refreshAll,

        exportBackup:
            exportBackup,

        restoreBackupFromFile:
            restoreBackupFromFile,

        setTheme:
            setTheme,

        getTheme:
            getTheme,

        setAutomaticBackupEnabled:
            setAutomaticBackupEnabled,

        createAutomaticBackup:
            createAutomaticBackup,

        getProductionStats:
            getProductionStats,

        getFeedStats:
            getFeedStats,

        checkFeedAlarm:
            checkFeedAlarm
    };


    /* ============================================================
       APPLICATION INITIALIZATION
       ============================================================ */

    async function initializeApplication() {

        /*
         * 1. Normalize existing stored data.
         */
        normalizeStoredData();


        /*
         * 2. Make sure a schedule exists.
         */
        initializeDefaultSchedule();


        /*
         * 3. Build navigation.
         */
        createNavigation();


        /*
         * 4. Create Settings if needed.
         */
        createSettingsView();


        /*
         * 5. Theme.
         */
        initializeTheme();


        /*
         * 6. Controls.
         */
        initializeEggControls();

        initializeFeedControls();

        initializeFlockControls();

        initializeQuickActions();

        initializeProfile();


        /*
         * 7. Dynamic feed actions.
         */
        ensureFeedActionButtons();


        /*
         * 8. Settings.
         */
        refreshSettings();


        /*
         * 9. Application shell.
         */
        initializeAppShell();


        /*
         * 10. Charts.
         */
        initializeChartResize();


        /*
         * 11. Keyboard.
         */
        initializeKeyboard();


        /*
         * 12. PWA.
         */
        initializePWAHints();


        /*
         * 13. Header.
         */
        updateHeaderDate();


        /*
         * 14. Service worker.
         */
        await initializeServiceWorker();


        /*
         * 15. First full refresh.
         */
        refreshAll();


        /*
         * 16. Overview timer.
         */
        startFarmOverviewRefresh();


        /*
         * 17. Global refresh/alarm timer.
         */
        initializeGlobalRefresh();


        /*
         * 18. Keep Dashboard as startup view.
         */
        restoreLastView();


        /*
         * 19. Store the current startup view.
         */
        writeStorage(
            APP.storage.lastView,
            "dashboard"
        );


        /*
         * 20. Automatic backup.
         */
        if (
            isAutomaticBackupEnabled()
        ) {
            createAutomaticBackupIfEnabled();
        }


        scheduleAutomaticBackup();


        /*
         * 21. Profile refresh after all
         * DOM elements are available.
         */
        refreshProfile();


        console.log(
            `${APP.name} ${APP.version} initialized.`
        );
    }


    /* ============================================================
       START
       ============================================================ */

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

})();
    }