const firebase = require("firebase/compat/app");
require("firebase/compat/storage");
require("firebase/compat/firestore");
const { firebaseConfig } = require("./config");

// Initialize Firebase
const initializedFirebase = firebase.initializeApp(firebaseConfig);

const storage = initializedFirebase.storage();
var storageRef = storage.ref();
const db = initializedFirebase.firestore();

module.exports = { initializedFirebase, storage, storageRef, db };