const { TemplateController } = require('../controllers/TemplateController');
const express = require('express');
const router = express.Router();
router.post("/get-field", TemplateController.GetListField);
router.post("/create", TemplateController.Create);
router.post("/get", TemplateController.Get);
router.post("/add-field", TemplateController.AddField);
router.post("/get-sample", TemplateController.GetSampleObject);
module.exports = router;
