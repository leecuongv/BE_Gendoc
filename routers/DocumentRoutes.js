const { DocumentController } = require('../controllers/DocumentController');
const express = require('express');
const router = express.Router();
router.post('/create', DocumentController.Create);
module.exports = router;