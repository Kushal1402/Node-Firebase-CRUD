const { storageRef } = require("../config/firebaseConfig");

exports.generateRandomString = (length, isNumber = false) => {
    var result = "";
    if (isNumber) {
        var characters = "0123456789";
    } else {
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    }
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

exports.uploadImage = async (folder, file) => {
    let randomString = exports.generateRandomString(5);

    var imagesRef = storageRef.child(`${folder}/${randomString}-${file.originalname}`);

    await imagesRef.put(file.buffer, { contentType: file.mimetype });

    let hostedImageURL = await imagesRef.getDownloadURL();

    return hostedImageURL;

    // const imageBlob = imagesRef.put(req.file.buffer, { contentType: req.file.mimetype });
    // await imageBlob.on('state_changed',
    //     (snapshot) => {
    //         var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    //         console.log('Upload is ' + progress + '% done');
    //         switch (snapshot.state) {
    //             case 'paused':
    //                 console.log('Upload is paused');
    //                 break;
    //             case 'running':
    //                 console.log('Upload is running');
    //                 break;
    //         }
    //     },
    //     (error) => {
    //         // Handle unsuccessful uploads
    //         return res.status(500).send({
    //             message: "Error occurred, Please try again later",
    //             error: error,
    //         });
    //     },
    //     () => {
    //         // Handle successful uploads on complete
    //         imagesRef.getDownloadURL().then((downloadURL) => {
    //             hostedImageURL = downloadURL;
    //         });
    //     }
    // )
}

exports.deleteImage = async (imageURL) => {
    try {
        // Extract the path from the image URL
        const path = imageURL.split('https://firebasestorage.googleapis.com/v0/b/node-firebase-crud-fa642.appspot.com/o/users')[1].split('?')[0].replace('%2F', '');

        var imageRef = storageRef.child(`users/${path}`);

        // Delete the file
        imageRef.delete().then(() => { }).catch((error) => { })

        console.log('Image deleted successfully');
        return true;
    } catch (error) {
        console.error('Error deleting image:', error);
        return false;
    }
}

/**
 * Converts CSV data to a Buffer and uploads it to Firebase Storage.
 * 
 * @param {string} csvData - The CSV data as a string.
 * @param {string} fileName - The name of the file to be saved.
 * @param {string} fileAltText - Detailed description of the CSV content.
 * @returns {Promise<string>} A promise that resolves with the download URL of the uploaded file.
 */
exports.uploadFile = async (csvData, fileName, fileAltText) => {
    return new Promise((resolve, reject) => {

        // Convert CSV data to a Buffer
        const csvBuffer = Buffer.from(csvData);

        // Reference to where the file will be uploaded within Firebase Storage
        const fileRef = storageRef.child(`users/csv/${fileName}`);

        // Prepare metadata
        const metadata = {
            contentType: 'application/octet-stream',
            customMetadata: {
                'alt': fileAltText
            }
        }

        // Upload CSV to Firebase Storage
        const uploadTask = fileRef.put(csvBuffer, metadata);

        uploadTask.on('state_changed', snapshot => {
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
                case 'paused':
                    console.log('Upload is paused');
                    break;
                case 'running':
                    console.log('Upload is running');
                    break;
            }
        }, error => {
            console.error('Error uploading CSV:', error);
            reject(new Error("Error occurred during file upload"));
        }, async () => {
            // Upload completed successfully
            try {
                const hostedFileURL = await fileRef.getDownloadURL();
                resolve(hostedFileURL);
            } catch (error) {
                reject(new Error("Error getting download URL"));
            }
        });
    });
}