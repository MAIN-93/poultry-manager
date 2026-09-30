const today = new Date().toISOString().split("T")[0];
let savedDate = localStorage.getItem("eggDate");
let eggs = Number(localStorage.getItem("eggs")) || 0;
// Check if the saved eggs are from today
if (savedDate !== today) {
  eggs = 0;
  localStorage.setItem("eggs", eggs);
  localStorage.setItem("eggDate", today);
}
const eggCount = document.getElementById("eggCount");
const addEggButton = document.getElementById("addEggButton");
eggCount.textContent = eggs;
addEggButton.addEventListener("click", function() {
  eggs = eggs + 1;
  eggCount.textContent = eggs;
  localStorage.setItem("eggs", eggs);
  localStorage.setItem("eggDate", today);
});

let feed = Number(localStorage.getItem("feed")) || 0;
const feedAmount = document.getElementById("feedAmount");
const feedInput = document.getElementById("feedInput");
const addFeedButton = document.getElementById("addFeedButton");
feedAmount.textContent = feed + " kg";
addFeedButton.addEventListener("click", function() {
  const amount = Number(feedInput.value);
  if (amount <= 0) {
    return;
  }
  feed = feed + amount;
  feedAmount.textContent = feed + " kg";
  localStorage.setItem("feed", feed);
  feedInput.value = "";
});

const morningFeedTime = document.getElementById("morningFeedTime");
const afternoonFeedTime = document.getElementById("afternoonFeedTime");
const saveScheduleButton = document.getElementById("saveScheduleButton");
const scheduleStatus = document.getElementById("scheduleStatus");
const savedMorningTime = localStorage.getItem("morningFeedTime");
const savedAfternoonTime = localStorage.getItem("afternoonFeedTime");
if (savedMorningTime) {
  morningFeedTime.value = savedMorningTime;
}
if (savedAfternoonTime) {
  afternoonFeedTime.value = savedAfternoonTime;
}
if (savedMorningTime && savedAfternoonTime) {
  scheduleStatus.textContent =
    "Morning: " + savedMorningTime +
    " | Afternoon: " + savedAfternoonTime;
}
saveScheduleButton.addEventListener("click", function() {
  const morning = morningFeedTime.value;
  const afternoon = afternoonFeedTime.value;
  if (!morning || !afternoon) {
    scheduleStatus.textContent = "Please set both feeding times.";
    return;
  }
  localStorage.setItem("morningFeedTime", morning);
  localStorage.setItem("afternoonFeedTime", afternoon);
  scheduleStatus.textContent =
    "Morning: " + morning +
    " | Afternoon: " + afternoon;
});

function updateNextFeed() {
  const nextFeed = document.getElementById("nextFeed");
  const morning = localStorage.getItem("morningFeedTime");
  const afternoon = localStorage.getItem("afternoonFeedTime");
  if (!morning || !afternoon) {
    nextFeed.textContent = "Not set";
    return;
  }
  const now = new Date();
  const todayMorning = new Date();
  const [morningHour, morningMinute] = morning.split(":");
  todayMorning.setHours(
    Number(morningHour),
    Number(morningMinute),
    0,
    0
  );
  const todayAfternoon = new Date();
  const [afternoonHour, afternoonMinute] = afternoon.split(":");
  todayAfternoon.setHours(
    Number(afternoonHour),
    Number(afternoonMinute),
    0,
    0
  );
  if (now < todayMorning) {
    nextFeed.textContent = "Morning • " + morning;
  } else if (now < todayAfternoon) {
    nextFeed.textContent = "Afternoon • " + afternoon;
  } else {
    nextFeed.textContent = "Tomorrow • " + morning;
  }
}
updateNextFeed();
setInterval(updateNextFeed, 30000);

let alarmEnabled = false;
let lastAlarmTime = "";

const alarmButton = document.getElementById("alarmButton");
const alarmStatus = document.getElementById("alarmStatus");
const alarmMessage = document.getElementById("alarmMessage");

alarmButton.addEventListener("click", function() {
  alarmEnabled = !alarmEnabled;
  
  if (alarmEnabled) {
    alarmButton.textContent = "🔕 Turn Alarm Off";
    alarmStatus.textContent = "Alarm is on.";
  } else {
    alarmButton.textContent = "🔔 Turn Alarm On";
    alarmStatus.textContent = "Alarm is off.";
    alarmMessage.textContent = "";
  }
});

function checkFeedAlarm() {
  if (!alarmEnabled) {
    return;
  }
  
  const now = new Date();
  
  const currentTime =
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0");
  
  const morning = localStorage.getItem("morningFeedTime");
  const afternoon = localStorage.getItem("afternoonFeedTime");
  
  if (
    (currentTime === morning || currentTime === afternoon) &&
    lastAlarmTime !== currentTime
  ) {
    alarmMessage.textContent = "🐔⏰ It's feeding time!";
    lastAlarmTime = currentTime;
  }
}

setInterval(checkFeedAlarm, 1000);
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(() => {
      console.log("Poultry Manager service worker registered.");
    })
    .catch(error => {
      console.error("Service worker registration failed:", error);
    });
}
const notificationButton = document.getElementById("enableNotifications");

if (notificationButton) {
  notificationButton.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      alert("Notifications are not supported on this device/browser.");
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      alert("🔔 Notifications enabled!");
    } else {
      alert("Notifications were not enabled.");
    }
  });
}
