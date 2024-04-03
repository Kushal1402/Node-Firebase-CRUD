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