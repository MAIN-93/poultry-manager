"use strict";

const express = require("express");
const cors = require("cors");
const webpush = require("web-push");

const app = express();

app.use(cors());
app.use(express.json({ limit: "100kb" }));

// ============================================================
// CONFIGURATION
// ============================================================

const PORT = process.env.PORT || 3000;
const TIME_ZONE = "Africa/Lagos";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT;

if (
    !VAPID_PUBLIC_KEY ||
    !VAPID_PRIVATE_KEY ||
    !VAPID_SUBJECT
) {
    throw new Error(
        "Missing VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, or VAPID_SUBJECT."
    );
}

webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

// ============================================================
// IN-MEMORY STORAGE
// ============================================================

// IMPORTANT:
// These values reset when the server restarts.
// Use a persistent database for production.

const subscriptions = new Map();

let feedSchedule = {
    morning: null,
    afternoon: null
};

let lastSentFeedTime = "";

let notificationSending = false;

// ============================================================
// HELPERS
// ============================================================

function isValidTime(value) {
    return (
        typeof value === "string" &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
    );
}

function getLagosTime() {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: TIME_ZONE,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    }).formatToParts(new Date());

    const hour = parts.find(
        part => part.type === "hour"
    )?.value;

    const minute = parts.find(
        part => part.type === "minute"
    )?.value;

    return `${hour}:${minute}`;
}

function getSubscriptionKey(subscription) {
    return subscription.endpoint;
}

function sendPush(subscription, payload) {
    return webpush.sendNotification(
        subscription,
        JSON.stringify(payload),
        {
            TTL: 60
        }
    );
}

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/", (req, res) => {
    res.json({
        status: "running",
        application: "Poultry Manager API",
        timeZone: TIME_ZONE
    });
});

// ============================================================
// VAPID PUBLIC KEY
// ============================================================

app.get("/vapid-public-key", (req, res) => {
    res.json({
        publicKey: VAPID_PUBLIC_KEY
    });
});

// ============================================================
// SAVE PUSH SUBSCRIPTION
// ============================================================

app.post("/subscribe", (req, res) => {
    const subscription = req.body;

    if (
        !subscription ||
        typeof subscription.endpoint !== "string" ||
        !subscription.endpoint.startsWith("https://") ||
        !subscription.keys ||
        typeof subscription.keys.p256dh !== "string" ||
        typeof subscription.keys.auth !== "string"
    ) {
        return res.status(400).json({
            error: "Invalid push subscription."
        });
    }

    subscriptions.set(
        getSubscriptionKey(subscription),
        subscription
    );

    console.log("Push subscription saved.");

    return res.status(201).json({
        message: "Push subscription saved."
    });
});

// ============================================================
// REMOVE PUSH SUBSCRIPTION
// ============================================================

app.post("/unsubscribe", (req, res) => {
    const endpoint = req.body?.endpoint;

    if (
        typeof endpoint !== "string" ||
        !endpoint.startsWith("https://")
    ) {
        return res.status(400).json({
            error: "A valid subscription endpoint is required."
        });
    }

    const removed = subscriptions.delete(endpoint);

    console.log(
        removed
            ? "Push subscription removed."
            : "No matching subscription was stored."
    );

    return res.json({
        message: "Subscription removal processed.",
        removed
    });
});

// ============================================================
// FEED SCHEDULE
// ============================================================

app.post("/schedule", (req, res) => {
    const { morning, afternoon } = req.body || {};

    if (
        !isValidTime(morning) ||
        !isValidTime(afternoon)
    ) {
        return res.status(400).json({
            error: "Provide valid morning and afternoon times in HH:MM format."
        });
    }

    feedSchedule = {
        morning,
        afternoon
    };

    // Reset the reminder guard when the schedule changes.
    lastSentFeedTime = "";

    console.log("Feed schedule updated:", feedSchedule);

    return res.json({
        message: "Feed schedule saved.",
        schedule: feedSchedule
    });
});

// ============================================================
// READ FEED SCHEDULE
// ============================================================

app.get("/schedule", (req, res) => {
    res.json({
        schedule: feedSchedule,
        timeZone: TIME_ZONE
    });
});

// ============================================================
// SEND TEST NOTIFICATION
// ============================================================

app.post("/send-test", async (req, res) => {
    if (subscriptions.size === 0) {
        return res.status(404).json({
            error: "No push subscriptions are registered."
        });
    }

    const results = await Promise.allSettled(
        Array.from(subscriptions.entries()).map(
            async ([endpoint, subscription]) => {
                try {
                    await sendPush(subscription, {
                        title: "Poultry Manager",
                        body: "🐔 Test notification received!",
                        tag: "poultry-manager-test"
                    });
                } catch (error) {
                    if (
                        error.statusCode === 404 ||
                        error.statusCode === 410
                    ) {
                        subscriptions.delete(endpoint);
                    }

                    throw error;
                }
            }
        )
    );

    const successful = results.filter(
        result => result.status === "fulfilled"
    ).length;

    if (successful === 0) {
        return res.status(502).json({
            error: "The push service could not deliver the test notification."
        });
    }

    return res.json({
        message: "Test notification processed.",
        successful,
        total: results.length
    });
});

// ============================================================
// AUTOMATIC FEEDING REMINDERS
// ============================================================

async function checkFeedSchedule() {
    if (
        notificationSending ||
        subscriptions.size === 0
    ) {
        return;
    }

    const currentTime = getLagosTime();

    const isFeedTime =
        currentTime === feedSchedule.morning ||
        currentTime === feedSchedule.afternoon;

    if (!isFeedTime) {
        lastSentFeedTime = "";
        return;
    }

    // Avoid sending the same reminder repeatedly
    // during the same scheduled minute.
    if (lastSentFeedTime === currentTime) {
        return;
    }

    notificationSending = true;

    try {
        const entries = Array.from(
            subscriptions.entries()
        );

        const results = await Promise.allSettled(
            entries.map(
                async ([endpoint, subscription]) => {
                    try {
                        await sendPush(subscription, {
                            title: "Poultry Manager",
                            body: "🐔⏰ It's feeding time!",
                            tag: "poultry-manager-feed"
                        });
                    } catch (error) {
                        if (
                            error.statusCode === 404 ||
                            error.statusCode === 410
                        ) {
                            subscriptions.delete(endpoint);
                        }

                        throw error;
                    }
                }
            )
        );

        const successful = results.filter(
            result => result.status === "fulfilled"
        ).length;

        if (successful > 0) {
            lastSentFeedTime = currentTime;

            console.log(
                `Feed reminder sent to ${successful} subscription(s).`
            );
        } else {
            console.error(
                "No feed reminders were delivered."
            );
        }
    } finally {
        notificationSending = false;
    }
}

setInterval(() => {
    checkFeedSchedule().catch(error => {
        console.error(
            "Feed schedule check failed:",
            error
        );
    });
}, 15000);

// ============================================================
// ERROR HANDLER
// ============================================================

app.use((error, req, res, next) => {
    console.error("API error:", error);

    if (res.headersSent) {
        return next(error);
    }

    return res.status(500).json({
        error: "An internal server error occurred."
    });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
    console.log(
        `Poultry Manager API running on port ${PORT}`
    );

    console.log(
        `Feeding schedule uses ${TIME_ZONE}.`
    );
});