const express = require('express')
const { verifyToken, verifyTokenAdmin } = require("../controllers/middlewareController")
const { FirebaseControllers } = require('../controllers/FirebaseControllers')
const router = express.Router();

router.post('/upload', FirebaseControllers.Upload);

router.post('/download', FirebaseControllers.Download);

router.post('/delete', FirebaseControllers.Delete);


module.exports = router