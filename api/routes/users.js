const express = require("express");
const router = express.Router();
const multer = require("multer");
const UsersController = require("../controller/users");

// Multer as a middleware to grab photo uploads
const upload = multer({ storage: multer.memoryStorage() });

router.post("/add", upload.single("profile_pic"), UsersController.addUser);

router.get("/detail/:id", UsersController.getDetail);

router.get("/list", UsersController.getAll);

router.post("/update/:id", upload.single("profile_pic"), UsersController.updateUser);

module.exports = router;