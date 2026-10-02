const today = new Date().toISOString().split("T")[0];
let savedDate = localStorage.getItem("eggDate");
let eggs = Number(localStorage.getItem("eggs")) || 0;
// Check if the saved eggs are from today
if (savedDate !== today) {
  let eggHistory =
    JSON.parse(localStorage.getItem("eggHistory")) || {};

  if (savedDate) {
  const flockSize =
    Number(localStorage.getItem("chickenCount")) || 0;

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

  localStorage.setItem("eggs", eggs);
  localStorage.setItem("eggDate", today);
}
const eggCount = document.getElementById("eggCount");
const addEggButton = document.getElementById("addEggButton");
const removeEggButton = document.getElementById("removeEggButton");

eggCount.textContent = eggs;

addEggButton.addEventListener("click", function() {
  eggs = eggs + 1;

  eggCount.textContent = eggs;

  localStorage.setItem("eggs", eggs);
  localStorage.setItem("eggDate", today);

  updateLayingRate();
  displayEggHistory();
});

removeEggButton.onclick = function() {
  if (eggs <= 0) {
    return;
  }

  eggs--;

  eggCount.textContent = eggs;

  localStorage.setItem("eggs", eggs);
  localStorage.setItem("eggDate", today);

  updateLayingRate();
  displayEggHistory();
};

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
saveScheduleButton.addEventListener("click", async function() {
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

  try {
    const response = await fetch(
      "https://poultry-manager-hppo.onrender.com/schedule",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          morning: morning,
          afternoon: afternoon
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Schedule could not be saved.");
    }

    scheduleStatus.textContent =
      "Morning: " + morning +
      " | Afternoon: " + afternoon +
      " • Server saved";
  } catch (error) {
    console.error("Schedule sync failed:", error);

    scheduleStatus.textContent =
      "Saved on phone, but server sync failed.";
  }
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
  if (
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    notificationButton.textContent = "✅ Notifications Enabled";
    notificationButton.disabled = true;
  } else {
    notificationButton.addEventListener("click", async () => {
      if (!("Notification" in window)) {
        alert("Notifications are not supported on this device/browser.");
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        await subscribeToPush();

        notificationButton.textContent = "✅ Notifications Enabled";
        notificationButton.disabled = true;
      } else {
        alert("Notifications were not enabled.");
      }
    });
  }
}

async function enablePushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    alert("Push notifications are not supported on this device/browser.");
    return;
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    alert("Notifications were not enabled.");
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  alert("Notifications permission granted. Push setup is next.");
}
const VAPID_PUBLIC_KEY =
  "BIcVdte-foGuqHPNOv1m9XhBHconqjfIVSNUH7m9FcUlp9aRJn7XT3PT42vBbk9qN2ZPINXisFjOYhTAdoJapOU";


async function subscribeToPush() {
  try {
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    const response = await fetch(
      "https://poultry-manager-hppo.onrender.com/subscribe",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(subscription)
      }
    );

    const result = await response.json();

    alert(result.message);
  } catch (error) {
    console.error("Push subscription failed:", error);
    alert("Push subscription failed.");
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);

  return Uint8Array.from(
    [...rawData].map(char => char.charCodeAt(0))
  );
}

const testPushButton = document.getElementById("testPush");

if (testPushButton) {
  testPushButton.addEventListener("click", async () => {
    try {
      const response = await fetch(
        "https://poultry-manager-hppo.onrender.com/send-test",
        {
          method: "POST"
        }
      );

      const result = await response.json();

      alert(result.message || result.error);
    } catch (error) {
      console.error("Test push failed:", error);
      alert("Test push failed.");
    }
  });
}

if (
  "Notification" in window &&
  Notification.permission === "granted"
) {
  notificationButton.textContent = "✅ Notifications Enabled";
  notificationButton.disabled = true;
}

let chickenCountValue =
  Number(localStorage.getItem("chickenCount")) || 0;

const chickenCount =
  document.getElementById("chickenCount");

const addChickenButton =
  document.getElementById("addChicken");

const removeChickenButton =
  document.getElementById("removeChicken");

const flockInput =
  document.getElementById("flockInput");

const setFlockButton =
  document.getElementById("setFlockButton");

chickenCount.textContent = chickenCountValue;

addChickenButton.onclick = function() {
  chickenCountValue++;

  chickenCount.textContent =
    chickenCountValue;

  localStorage.setItem(
    "chickenCount",
    chickenCountValue
  );
};

removeChickenButton.onclick = function() {
  if (chickenCountValue <= 0) {
    return;
  }

  chickenCountValue--;

  chickenCount.textContent =
    chickenCountValue;

  localStorage.setItem(
    "chickenCount",
    chickenCountValue
  );
};

setFlockButton.onclick = function() {
  const inputValue = flockInput.value.trim();

  if (inputValue === "") {
    return;
  }

  const newFlockSize = Number(inputValue);

  if (
    !Number.isInteger(newFlockSize) ||
    newFlockSize < 0
  ) {
    return;
  }

  chickenCountValue = newFlockSize;

  chickenCount.textContent =
    chickenCountValue;

  localStorage.setItem(
    "chickenCount",
    chickenCountValue
  );

  flockInput.value = "";
};

function updateLayingRate() {
  const layingRate =
    document.getElementById("layingRate");

  const flockSize =
  Number(localStorage.getItem("chickenCount"));


  if (!flockSize || flockSize <= 0) {
    layingRate.textContent = "0%";
    return;
  }

  const rate =
    (eggs / flockSize) * 100;

  if (rate >= 100) {
    layingRate.textContent = "100%+";
    return;
  }

  layingRate.textContent =
    Math.round(rate) + "%";
}

updateLayingRate();
let eggHistory =
  JSON.parse(localStorage.getItem("eggHistory")) || {};

eggHistory[today] = eggs;

localStorage.setItem(
  "eggHistory",
  JSON.stringify(eggHistory)
);

function displayEggHistory() {
  const historyList =
    document.getElementById("eggHistoryList");

  const history =
    JSON.parse(localStorage.getItem("eggHistory")) || {};
const currentFlock =
  Number(localStorage.getItem("chickenCount")) || 0;

history[today] = {
  eggs: eggs,
  flock: currentFlock
};
  
  const dates = Object.keys(history).sort().reverse();
  const viewHistoryButton =
  document.getElementById("viewHistoryButton");

let showAllHistory = false;

  if (dates.length === 0) {
    historyList.innerHTML =
      "<p>No history yet.</p>";
    return;
  }

  historyList.innerHTML = "";

 dates.slice(0, showAllHistory ? dates.length : 4).forEach(function(date) { {
  const row = document.createElement("div");

  const formattedDate =
  date === today
    ? "Today"
    : new Date(date + "T00:00:00").toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric"
        }
      );
   
   const record = history[date];

   

const eggsForDay =
  typeof record === "object"
    ? record.eggs
    : record;

const flockForDay =
  typeof record === "object"
    ? record.flock
    : Number(localStorage.getItem("chickenCount")) || 0;

let rate = 0;

if (flockForDay > 0) {
  rate = Math.round(
    (eggsForDay / flockForDay) * 100
  );
}

row.innerHTML =
  "<strong>" + formattedDate + "</strong>" +
  "<span>" +
  eggsForDay +
  " eggs • " +
  rate +
  "%" +
  "</span>"; historyList.appendChild(row);
  });
}

displayEggHistory();
