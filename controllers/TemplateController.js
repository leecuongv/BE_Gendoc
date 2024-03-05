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
    }
    ,
    GetList: async (req, res) => {
        try {
            const templates = await Template.find().populate('fields');
            return res.status(200).json(templates);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Lỗi lấy danh sách mẫu' });
        }
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
    GetListField: async (req, res) => {
        try {
            const { filePath } = req.body;

            const fields = await extractFieldsFromWordFile(filePath);
            let jsonObject = [];
            fields.forEach(element => {
                if (element.type === "text") {
                    let field = { name: element.name, type: element.type };
                    jsonObject = { ...field, ...jsonObject };
                }
                else
                    if (element.type === "loop") {
                        jsonObject.push({ name: element.name, type: element.type });
                    }
            });
            console.log(jsonObject);
            return res.status(200).json(fields);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Lỗi lấy danh sách trường', error });
        }
    },
    GetSampleObject: async (req, res) => {
        try {
            const { filePath } = req.body;

            const fields = await extractFieldsFromWordFile(filePath);
            let jsonObject = parseArrayToJSON(fields);

            console.log(jsonObject);
            return res.status(200).json(fields);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Lỗi lấy danh sách trường', error });
        }
    }

}

module.exports = { TemplateController };

function extractFieldsFromWordFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            mammoth.extractRawText({ path: filePath })
                .then(result => {
                    const text = result.value;
                    const regex = /{([^{}]*)}/g; // Regex để tìm các trường trong dấu {}
                    const fields = [];
                    let match;
                    while ((match = regex.exec(text)) !== null) {

                        // let type = 'text';
                        // if (isConditionField(match[1])) {
                        //     type = 'open condition';
                        // }
                        // if (match[1].includes("/")) {
                        //     type = 'close condition';
                        // }
                        // if (match[1].includes("#")) {
                        //     type = 'loop';
                        // }
                        // let field = {
                        //     name: match[1].toString().replace(/#|\/|$|^|/g, ''),
                        //     type: type
                        // };
                        // if (field.type !== "text")
                        if (!match[1].includes("$"))
                            fields.push(match[1]);

                    }
                    resolve(fields);
                })
                .catch(err => {
                    reject(err);
                });
        });
    });
    function isConditionField(field) {
        const operations = ["<", ">", "=", "&", "^"];
        for (let i = 0; i < operations.length; i++) {
            if (field.includes(operations[i])) {
                return true;
            }
        }
        return false;
    }
    function isLoopField(field) {
        return field.includes("#");
    }
    function isCloseConditionField(field) {
        return field.includes("/");
    }


}
function parseArrayToJSON(arr, index = 0) {
    const jsonObject = {};
    let currentObject = jsonObject;

    while (index < arr.length) {
        const item = arr[index];

        if (item.startsWith('#') || item.startsWith('^')) {
            const key = item.substring(1);
            currentObject[key] = parseArrayToJSON(arr, index + 1);

            while (arr[index] !== '/') {
                index++;
            }
        } else if (item === '/') {
            return jsonObject;
        } else {
            const [key, modifier] = item.split(' | ');
            currentObject[key] = modifier === 'upper' ? '' : null;
        }

        index++;
    }

    return jsonObject;
}
