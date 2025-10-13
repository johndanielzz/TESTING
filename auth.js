
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBZpLELrmplsK66YNPycGLO2Aab9jvxa9k",
    authDomain: "matrixmarketpace.firebaseapp.com",
    projectId: "matrixmarketpace",
    storageBucket: "matrixmarketpace.firebasestorage.app",
    messagingSenderId: "200867795667",
    appId: "1:200867795667:web:64de1ece48ddc07fa4ba26",
    measurementId: "G-10TFPP3LDD"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);




