const Template = require('../models/Template');
const expressionParser = require("docxtemplater/expressions.js");
const Field = require('../models/Field');
const User = require('../models/User');
const mongoose = require('mongoose');
const { COLLECTION } = require('../utils/enum');
const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");
const e = require('express');
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const InspectModule = require("docxtemplater/js/inspect-module.js");
const iModule = InspectModule();
const TemplateController = {
    Create: async (req, res) => {
        try {
            const username = req.user?.sub
            if (!username) return res.status(400).json({ message: "Không có người dùng" })
            const user = await User.findOne({ username })
            if (!user) return res.status(400).json({ message: "Không có người dùng" })
            const { name, comment, use_ai, fields, link } = req.body;
            const newTemplate = new Template({
                name,
                comment,
                creator: user._id,
                use_ai,
                fields,
                link
            });
            let error = newTemplate.validateSync();
            if (error) {
                return res.status(400).json({ message: "Tạo bài thi thất bại", error: error.message });
            }
            const result = await newTemplate.save();
            return res.status(200).json(result);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Lỗi thêm mẫu' });
        }
    },

    Get: async (req, res) => {
        try {
            const { id } = req.query;
            const template
                = await Template.findById(id)
            if (template) {
                return res.status(200).json(template);
            }
            return res.status(400).json({ message: 'Không tìm thấy mẫu' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Lỗi lấy mẫu' });
        }
    },

    AddField: async (req, res) => {
        try {
            const { id, field_id } = req.body;
            const template
                = await Template.findById(id)
            if (template) {
                const field = await
                    Field.findById(field_id)
                if (field) {
                    template.fields.push(field);
                    const result = await template.save();
                    return res.status(200).json(result);
                }
                return res.status(400).json({ message: 'Không tìm thấy trường' });
            }
            return res.status(400).json({ message: 'Không tìm thấy mẫu' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Lỗi thêm trường' + error });
        }
    },

    GetList: async (req, res) => {
        try {
            const templates = await Template.find().populate('fields');
            return res.status(200).json(templates);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Lỗi lấy danh sách mẫu' });
        }
    },
    Upload: async (req, res) => {
        let sampleFile;
        let uploadPath;
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }
        sampleFile = req.files.file;
        uploadPath = __dirname + path.sep + "public" + path.sep + sampleFile.name;
        sampleFile.mv(uploadPath, function (err) {
            if (err)
                return res.status(500).json(err);
            return res.status(200).json({ filePath: uploadPath });
        });
    },

    Update: async (req, res) => {
        try {
            const username = req.user?.sub
            if (!username) return res.status(400).json({ message: "Không có người dùng" })
            const user = await User.findOne({
                username
            })
            if (!user) return res.status(400).json({ message: "Không có người dùng" })

            const { id, name, comment, use_ai, fields, link } = req.body;
            const template = await Template.findById(id
            );
            if (template) {
                template.name = name;
                template.comment = comment;
                template.use_ai = use_ai;
                template.fields = fields;
                template.link = link;
                const result = await template.save();
                return res.status(200).json(result);
            }
            return res.status(400).json({ message: 'Không tìm thấy mẫu' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Lỗi cập nhật mẫu' });
        }

    },

    Delete: async (req, res) => {
        try {
            const username = req.user?.sub
            if (!username) return res.status(400).json({ message: "Không có người dùng" })
            const user = await User.findOne({
                username
            })
            if (!user) return res.status(400).json({ message: "Không có người dùng" })

            const { id } = req.query;
            const result = await Template.findByIdAndDelete(id);
            if (result) {
                return res.status(200).json(result);
            }
            return res.status(400).json({ message: 'Không tìm thấy mẫu' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Lỗi xóa mẫu' });
        }
    },
    GetSampleObject: async (req, res) => {

        try {
            const { linkTemplate } = req.body;
            const content = fs.readFileSync(
                path.resolve(linkTemplate),
                "binary"
            );

            const zip = new PizZip(content);

            const doc = new Docxtemplater(zip, {
                modules: [iModule],
            },
            )

            const tags = iModule.getAllTags();
            console.log(typeof tags);
            console.log(JSON.stringify(tags));

            return res.status(200).json({ message: "Get fields of document successfully!", fields: tags });
        }
        catch (err) {
            return res.status(500).json({ message: err.message, stackTrace: err.stack, properties: err.properties });
        }
    }

}

module.exports = { TemplateController };


