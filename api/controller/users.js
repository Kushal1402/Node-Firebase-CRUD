const { storage, storageRef, db } = require("../config/firebaseConfig");
const User = require("../model/users");
const { uploadImage, deleteImage, uploadFile } = require("../helper");
const niv = require("node-input-validator");
const usersDb = db.collection('users');
const moment = require('moment');
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;

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
    let {
        limit = 10, // Default limit field if not provided
        searchField,
        search,
        sortByField = 'createdAt', // Default sorting field if not provided
        sortBy = 'desc' // Default sorting order if not provided
    } = req.query;

    try {
        // Method 1
        // const response = await usersDb.get();

        // Method 2 -> Static Filters
        // const response = await usersDb.orderBy('createdAt', 'desc').limit(50).get();

        // Method 3 -> Dynamic Filters
        var query = usersDb;
        if (search && searchField) {
            query = query.where(searchField, "==", search);
        }
        if (sortByField) {
            query = query.orderBy(sortByField, sortBy);
        }
        // console.log("response:", query);

        const response = await query.limit(parseInt(limit)).get();

        const arr = [];
        if (response.empty) {
            console.log("No user's found for query:", req.query);
        } else {
            // response.forEach((doc) => {
            //     arr.push({
            //         id: doc.id,
            //         ...doc.data()
            //     });
            // })
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
            });
        };

        return res.status(200).json({
            message: "User details retreived successfully",
            result: arr,
            count: arr.length
        });
    } catch (error) {
        console.error("Error retrieving users:", error);
        return res.status(500).json({
            message: "Error occurred, Please try again"
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

        if (!data || data === null || data === undefined) {
            return res.status(500).send({
                message: `No record mathched with id: ${id}`
            });
        };

        const result = {
            username: data?.username,
            email: data?.email,
            flag: data.flag,
            role: data.role,
            phone_number: `${data?.country_code} ${data?.phone_number}`,
            profile_pic: data?.profile_pic,
            createdAt: new Date(data.createdAt.seconds * 1000),
            updatedAt: new Date(data.updatedAt.seconds * 1000),
        };

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
    if (id === null || id === undefined || id === '') {
        return res.status(404).send({
            message: "Error occurred, Please try again later",
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

        const updateObj = {};

        if (username) updateObj.username = username;
        if (email) updateObj.email = email;
        if (country_code) updateObj.country_code = country_code;
        if (phone_number) updateObj.phone_number = phone_number;

        if (req.file) {
            const userRef = usersDb.doc(id);
            const response = await userRef.get();
            const oldData = response.data();

            if (!oldData || oldData === null || oldData === undefined) {
                return res.status(500).send({
                    message: `No record mathched with id: ${id}`
                });
            };

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
    const id = req.params.id;
    if (id === null || id === undefined || id === '') {
        return res.status(404).send({
            message: "Error occurred, Please try again later",
        });
    };

    try {
        const userRef = usersDb.doc(id);
        const response = await userRef.get();
        const oldData = response.data();

        if (!oldData || oldData === null || oldData === undefined) {
            return res.status(500).send({
                message: `No record mathched with id: ${id}`
            });
        };

        if (oldData.profile_pic !== "" && oldData.profile_pic !== null && oldData.profile_pic !== undefined) {
            await deleteImage(oldData.profile_pic);
        };

        await usersDb.doc(id).delete();

        return res.status(200).send({
            message: "User deleted successfully",
        });

    } catch (error) {
        console.log(error, "error");
        return res.status(500).send({
            message: "Error occured, Please try again"
        });
    }
}

exports.generateCsv = async (req, res) => {
    try {

        const response = await usersDb.orderBy("createdAt", "desc").get();

        const arr = [];
        if (response.empty) {
            console.log("No user's found");
        } else {
            response.forEach((item) => {
                const local_data = item.data();

                const user = {
                    id: item.id,
                    username: local_data.username,
                    email: local_data.email,
                    contact_number: `${local_data?.country_code} ${local_data?.phone_number}`,
                    flag: local_data.flag,
                    profile_pic: local_data?.profile_pic,
                    role: local_data.role,
                    createdAt: new Date(local_data.createdAt.seconds * 1000),
                    updatedAt: new Date(local_data.updatedAt.seconds * 1000)
                };

                // Optionally filter out phone_number & country_code here
                delete user.phone_number;
                delete user.country_code;

                // Add the combine contact-number here
                // user.contact_number = `${item.data()?.country_code} ${item.data()?.phone_number}`;

                arr.push(user);
            });
        };

        if (arr?.length < 0) {
            return res.status(500).send({
                message: "No user's found to print",
                error: error,
            });
        }

        // Getting current date and time using Moment.js
        const dateTimeString = moment().format("YYYY-MM-DD_HH-mm-ss");

        // Setting FileName
        const fileName = `NODE_FB_User_List_${dateTimeString}.csv`;

        // Create CSV-String
        const csvStringifier = createCsvStringifier({
            header: [
                { id: 'id', title: 'ID' },
                { id: 'username', title: 'Name' },
                { id: 'email', title: 'Email' },
                { id: 'contact_number', title: 'Phone Number' },
                { id: 'role', title: 'Role' },
                { id: 'profile_pic', title: 'Profile Pic' },
            ]
        });

        // Create CSV header by joining header strings
        const csvHeader = csvStringifier.getHeaderString();

        // Create CSV string by joining record strings        
        const csvString = csvStringifier.stringifyRecords(arr);

        // Combine header row and CSV data
        const csvData = csvHeader + '\n' + csvString;

        const fileAltText = `User's csv file generated on ${moment().format("DD-MM-YYYY")}`;

        uploadFile(csvData, fileName, fileAltText)
            .then(hostedFileURL => {
                return res.status(200).json({
                    message: "CSV file generated successfully",
                    generated_file: hostedFileURL,
                    file_name: fileName
                });
            })
            .catch(error => {
                console.error("Failed to upload CSV", error);
                return res.status(500).send({ message: "Failed to generate CSV file" });
            });

        // return res.status(200).json({
        //     message: "CSV file generated successfully",
        //     generated_file: hostedFileURL,
        //     file_name: fileName
        // });

    } catch (error) {
        console.log("CSV generate error", error);
        return res.status(500).send({
            message: "Error occurred, Please try again",
            error: error,
        });
    }
}