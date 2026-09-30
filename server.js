const express = require("express");
const cors = require("cors");
const webpush = require("web-push");

const app = express();

app.use(cors());
app.use(express.json());

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

app.get("/", (req, res) => {
  res.send("Poultry Manager API is running.");
});

let savedSubscription = null;

let feedSchedule = {
  morning: null,
  afternoon: null
};

app.post("/subscribe", (req, res) => {
  const subscription = req.body;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({
      error: "Invalid push subscription."
    });
  }

  savedSubscription = subscription;

  console.log("Push subscription saved.");

  res.status(201).json({
    message: "Push subscription saved."
  });
});

app.post("/schedule", (req, res) => {
  const { morning, afternoon } = req.body;

  if (!morning || !afternoon) {
    return res.status(400).json({
      error: "Both feeding times are required."
    });
  }

  feedSchedule.morning = morning;
  feedSchedule.afternoon = afternoon;

  console.log("Feed schedule updated:", feedSchedule);

  res.json({
    message: "Feed schedule saved.",
    schedule: feedSchedule
  });
});

app.post("/send-test", async (req, res) => {
  if (!savedSubscription) {
    return res.status(404).json({
      error: "No push subscription saved."
    });
  }

  try {
    await webpush.sendNotification(
      savedSubscription,
      JSON.stringify({
        title: "Poultry Manager",
        body: "🐔 Test notification received!"
      })
    );

    res.json({
      message: "Test notification sent."
    });
  } catch (error) {
    console.error("Push notification failed:", error);

    res.status(500).json({
      error: "Push notification failed."
    });
  }
});

let lastSentFeedTime = "";

setInterval(async () => {
  if (!savedSubscription) {
    return;
  }

  const now = new Date();

  const currentTime =
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0");

  if (
    (currentTime === feedSchedule.morning ||
     currentTime === feedSchedule.afternoon) &&
    lastSentFeedTime !== currentTime
  ) {
    try {
      await webpush.sendNotification(
        savedSubscription,
        JSON.stringify({
          title: "Poultry Manager",
          body: "🐔⏰ It's feeding time!"
        })
      );

      console.log("Automatic feed notification sent.");

      lastSentFeedTime = currentTime;
    } catch (error) {
      console.error(
        "Automatic feed notification failed:",
        error
      );
    }
  }
}, 1000);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Poultry Manager API running on port ${PORT}`);
});
