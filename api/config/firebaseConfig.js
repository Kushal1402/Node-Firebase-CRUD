const firebase = require("firebase/compat/app");
require("firebase/compat/storage");
const { firebaseConfig } = require("./config");

// Initialize Firebase
const initializedFirebase = firebase.initializeApp(firebaseConfig);

// const storage = initializedFirebase.storage();
// Create a storage reference from our storage service
// var storageRef = storage.ref();

module.exports = initializedFirebase;