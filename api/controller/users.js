const { storage, storageRef, db } = require("../config/firebaseConfig");
const User = require("../model/users");
const { uploadImage, deleteImage } = require("../helper");
const niv = require("node-input-validator");
const usersDb = db.collection('users');

exports.addUser = async (req, res) => {

    const validator = new niv.Validator(req.body, {
        username: "required|maxLength:52|minLength:4",
        email: "required|email",
        country_code: "required",
        phone_number: "required|maxLength:15",
    });

    const matched = await validator.check();
    if (!matched) {
        return res.status(422).send({
            message: "Validation error",
            errors: validator.errors,
        });
    };

    try {

        const {
            username,
            email,
            country_code,
            phone_number,
        } = req.body;
        let hostedImageURL = "";

        if (req.file) {
            hostedImageURL = await uploadImage("users", req.file);
        };

        const addUserObj = {
            username,
            email,
            country_code,
            phone_number,
            flag: 1,
            profile_pic: hostedImageURL,
            role: "User",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await usersDb.doc().set(addUserObj);

        return res.status(200).send({
            message: "User added successfully",
        });
    } catch (error) {
        console.log(error, "error");
        return res.status(500).send({
            message: "Error occured, Please try again"
        });
    }
}

exports.getAll = async (req, res) => {
    try {
        const response = await usersDb.get();

        const arr = [];
        let total = 0;
        if (response.empty) {
            res.status(200).json({ message: "No records found", result: [] });
        } else {
            response.forEach((item) => {
                const user = new User(
                    item.id,
                    item.data()?.username,
                    item.data()?.email,
                    item.data()?.country_code,
                    item.data()?.phone_number,
                    item.data().flag,
                    item.data()?.profile_pic,
                    item.data().role,
                    new Date(item.data().createdAt.seconds * 1000),
                    new Date(item.data().updatedAt.seconds * 1000),
                );
                arr.push(user);
                total = total + 1;
            });
        };

        return res.status(200).send({
            message: "User details retreived successfully",
            result: arr,
            count: total
        });
    } catch (error) {
        console.log(error, "error");
        return res.status(500).send({
            message: "Error occured, Please try again"
        });
    }
}

exports.getDetail = async (req, res) => {
    const id = req.params.id;
    if (id === null || id === undefined || id === '') {
        return res.status(404).send({
            message: "Error occurred, Please try again later",
        });
    };

    try {
        const userRef = usersDb.doc(id);
        const response = await userRef.get();
        const data = response.data();

        const result = {
            username: data?.username,
            email: data?.email,
            flag: data.flag,
            role: data.role,
            phone_number: `${data?.country_code} ${data?.phone_number}`,
            profile_pic: data?.profile_pic,
            createdAt: new Date(data.createdAt.seconds * 1000),
            updatedAt: new Date(data.updatedAt.seconds * 1000),
        }

        return res.status(200).send({
            message: "User details retreived successfully",
            result: result,
        });
    } catch (error) {
        console.log(error, "error");
        return res.status(500).send({
            message: "Error occured, Please try again"
        });
    }
};

exports.updateUser = async (req, res) => {
    const id = req.params.id;

    try {
        const {
            username,
            email,
            country_code,
            phone_number,
        } = req.body;
        let hostedImageURL = "";

        const updateObj = {};

        if (username) updateObj.username = username;
        if (email) updateObj.email = email;
        if (country_code) updateObj.country_code = country_code;
        if (phone_number) updateObj.phone_number = phone_number;

        if (req.file) {
            const userRef = usersDb.doc(id);
            const response = await userRef.get();
            const oldData = response.data();

            if (oldData.profile_pic !== "" && oldData.profile_pic !== null && oldData.profile_pic !== undefined) {
                await deleteImage(oldData.profile_pic);
                hostedImageURL = await uploadImage("users", req.file);
                updateObj.profile_pic = hostedImageURL;
            }
        }

        const user = await usersDb.doc(id);
        await user.update(updateObj);

        return res.status(200).send({
            message: "User details updated successfully",
        });
    } catch (error) {
        console.log(error, "error");
        return res.status(500).send({
            message: "Error occured, Please try again"
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {

        return res.status(200).send({
            message: "User details updated successfully",
        });

    } catch (error) {
        console.log(error, "error");
        return res.status(500).send({
            message: "Error occured, Please try again"
        });
    }
}