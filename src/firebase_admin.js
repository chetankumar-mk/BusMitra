const admin = require("firebase-admin");

let firebaseDB;

if (!admin.apps.length) {
  if (process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL || "https://busmitra-d4dc0-default-rtdb.firebaseio.com"
    });
    console.log("✅ Firebase Admin (Cloud) Initialized");
  } else {
    try {
      const path = require("path");
      const serviceAccount = require(path.join(__dirname, "../serviceAccountKey.json"));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || "https://busmitra-d4dc0-default-rtdb.firebaseio.com"
      });
      console.log("✅ Firebase Admin (Local JS) Initialized");
    } catch (error) {
      console.error("❌ Firebase Admin Local Init Error:", error.message);
    }
  }
}

if (admin.apps.length) {
  firebaseDB = admin.database();
}

module.exports = { admin, firebaseDB };
