importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);
// // Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: "AIzaSyCSVvhHYeb793Jkx9SIxYJTg1YSpcYZNGE",
  authDomain: "dealplexnew.firebaseapp.com",
  projectId: "dealplexnew",
  storageBucket: "dealplexnew.firebasestorage.app",
  messagingSenderId: "683252992551",
  appId: "1:683252992551:web:4527e4493bb3d3856d9c02",
  measurementId: "G-YQSQJMW2FF",
};

firebase?.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase?.messaging();

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
