const { TemplateController } = require('../controllers/TemplateController');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path')

router.post("/create", TemplateController.Create);
router.post("/get", TemplateController.Get);
router.post("/add-field", TemplateController.AddField);
router.post("/get-sample", TemplateController.GetSampleObject)
router.post("/upload", TemplateController.Upload)
module.exports = router;
