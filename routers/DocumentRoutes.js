const { DocumentController } = require('../controllers/DocumentController');
const express = require('express');
const router = express.Router();
router.post('/create', DocumentController.Create);
router.post('/create-and-send-in-buck', DocumentController.CreateAndSendInBuck);
module.exports = router;