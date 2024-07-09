const { storage } = require('../config/firebase-config');
//download, upload, delete file from firebase storage

const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('../config/firebase-service-account.json');

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    storageBucket: 'oes-gencertificate.appspot.com'
});
const FirebaseStorageController = {
    Upload: async (req, res) => {
        try {
            const filePath = req.file.path;
            const fileName = req.file.originalname;
            const url = await uploadFile(filePath, fileName);
            return res.status(200).json({ url });
        } catch (error) {
            console.error('Error uploading file:', error);
            return res.status(500).json({ error: 'Error uploading file' });
        }
    },
    Download: async (req, res) => {
        try {
            const fileName = req.query.fileName;
            const filePath = await downloadFile(fileName);
            res.download(filePath, fileName);
        } catch (error) {
            console.error('Error downloading file:', error);
            return res.status(500).json({ error: 'Error downloading file' });
        }
    },
    Delete: async (req, res) => {
        try {
            const fileName = req.query.fileName;
            await deleteFile(fileName);
            return res.status(200).json({ message: 'File deleted' });
        } catch (error) {
            console.error('Error deleting file:', error);
            return res.status(500).json({ error: 'Error deleting file' });
        }
    }
}

module.exports = { FirebaseStorageController }
uploadFile = async (filePath, fileName) => {
    try {
        const bucket = storage.bucket();
        const blob = bucket.file(fileName);
        const blobStream = blob.createWriteStream();
        const stream = require('fs').createReadStream(filePath);
        stream.pipe(blobStream);
        await new Promise((resolve, reject) => {
            blobStream.on('finish', resolve);
            blobStream.on('error', reject);
        });
        return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${blob.name}?alt=media`;
        // return blob.metadata.mediaLink;
        // return `gs://${bucket.name}/${blob.name}`;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
    // return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${blob.name}?alt=media`;
    // return blob.metadata.mediaLink;
    // return `gs://${bucket.name}/${blob.name}`;
};

downloadFile = async (filePath, fileName) => {
    try {
        const bucket = storage.bucket();
        const blob = bucket.file(fileName);
        const localFilePath = `./downloads/${fileName}`;
        const stream = blob.createReadStream();
        const writeStream = require('fs').createWriteStream(localFilePath);
        stream.pipe(writeStream);
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        return localFilePath;
    } catch (error) {
        console.error('Error downloading file:', error);
        throw error;
    }
};

deleteFile = async (fileName) => {
    try {
        const bucket = storage.bucket();
        const blob = bucket.file(fileName);
        await blob.delete();
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

