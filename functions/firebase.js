const admin = require('firebase-admin');
const serviceAccount = require('./credentials/nyaard-31d3b-firebase-adminsdk-clvv8-9ce63602c4.json');

// Initialize Firebase only if it hasn't been initialized already
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

// Export the admin and firestore references
const db = admin.firestore();
module.exports = { admin, db };