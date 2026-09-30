self.addEventListener("install", () => {
  console.log("Poultry Manager service worker installed.");
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};

  event.waitUntil(
    self.registration.showNotification(
      data.title || "Poultry Manager",
      {
        body: data.body || "🐔 It's feeding time!",
        icon: "icon-192.png",
        badge: "icon-192.png"
      }
    )
  );
});
