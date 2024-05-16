const Document = require('../models/Document');
const mongoose = require('mongoose');
const User = require('../models/User');
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");
const reader = require('xlsx')
const expressionParser = require("docxtemplater/expressions.js");
const topdf = require('docx2pdf-converter')
const http = require('http');
const axios = require('axios');
const ImageModule = require('docxtemplater-image-hyperlink-module-free');
const moment = require('moment');
const { upper, lower, size, sum, average, formatDate, max, min, area, perimeter, mul, where, parseImageString } = require('./handler/Expression');
const DocumentController = {
    Create: async (req, res) => {
        try {
            const { name, comment, data, link, linkTemplate, linkOutput } = req.body;
            const content = fs.readFileSync(
                path.resolve(linkTemplate),
                "binary"
            );
            //add image
            const imageOpts = {
                centered: true,
                fileType: "docx",
                getImage: function (tagValue, tagName) {
                    return fs.readFileSync(tagValue);
                },
                getSize: function (img, tagValue, tagName) {
                    const config = parseImageString(img, tagName);
                    console.error("image confi: " + config);
                    return [
                        config.width,
                        config.height
                    ];
                },
                getProps: function (tagValue, tagName) {
                    // if (tagName === 'image') {
                    //     return {
                    //         link: 'https://domain.example',
                    //     };
                    // }
                    return null;
                }
            };

            const zip = new PizZip(content);
            expressionParser.filters.upper = function (input) {
                return upper(input);
            };
            expressionParser.filters.lower = function (input) {
                return lower(input);
            };
            expressionParser.filters.size = function (input) {
                return size(input);
            };
            expressionParser.filters.sum = function (input, field) {
                return sum(input, field);
            };
            expressionParser.filters.average = function (input, field) {
                return average(input, field);
            };
            expressionParser.filters.formatDate = function (input, format) {
                return formatDate(input, format);
            };
            expressionParser.filters.max = function (input, field) {
                return max(input, field);
            };
            expressionParser.filters.min = function (input, field) {
                return min(input, field);
            };
            expressionParser.filters.area = function (...numbers) {
                return area(...numbers);
            };
            expressionParser.filters.perimeter = function (...numbers) {
                return perimeter(...numbers);
            };
            expressionParser.filters.mul = function (input, field) {
                return mul(input, field);
            };
            expressionParser.filters.where = function (input, query) {
                return where(input, query);
            };

            const doc = new Docxtemplater(zip, {
                modules: [new ImageModule(imageOpts)],
                parser: expressionParser,
                linebreaks: true,
                paragraphLoop: true
            },
            )

            doc.render(data);
            const buf = doc.getZip().generate({
                type: "nodebuffer",
                compression: "DEFLATE",
            });
            let outputTmpPath = linkOutput + path.sep + name;

            let fileName = path.basename(outputTmpPath).split(".")[0];
            let fileExtension = path.extname(outputTmpPath).replace(".", "");
            let directoryPath = path.dirname(outputTmpPath);

            let newPath = directoryPath + path.sep + fileName + "." + fileExtension;
            if (fs.existsSync(outputTmpPath)) {
                let newName = fileName;
                newPath = directoryPath + path.sep + newName + "." + fileExtension;
                let index = 1;
                while (fs.existsSync(newPath)) {
                    index++;
                    let newName2 = fileName + "(" + index + ")";
                    newPath = directoryPath + path.sep + newName2 + "." + fileExtension;
                }
            }

            let docxFile = newPath.replace("pdf", "docx")
            fs.writeFileSync(path.resolve(docxFile), buf);

            if (fileExtension == "pdf") {
                console.log("haha " + docxFile);
                topdf.convert(path.resolve(docxFile), path.resolve(newPath), true)
                fs.unlinkSync(path.resolve(docxFile));
            }
            const document = new Document({ name, comment, creator: "63414e7fd302008763538e62", link });
            let error = document.validateSync()
            if (error) {
                return res.status(400).json({
                    message: "Create document unsuccessfully", error: error
                })
            }
            const newDocument = await document.save();
            return res.status(200).json({ message: "Create document successfully", newDocument, linkOutput: newPath, linkTemplate: linkTemplate });
        }
        catch (err) {
            return res.status(500).json({ message: err.message, stackTrace: err.stack, properties: err.properties });
        }
    },
    CreateAndSendInBuck: async (req, res) => {
        const { hostname, port, path, excelPath, bearerToken } = req.body;
        const file = reader.readFile(excelPath)

        let excelData = []

        const sheets = file.SheetNames

        for (let i = 0; i < sheets.length; i++) {
            const temp = reader.utils.sheet_to_json(
                file.Sheets[file.SheetNames[i]])
            temp.forEach((res) => {
                excelData.push(res)
            })
        }
        let bodyData = {
            "documents": [],
            "comment": "This is buck send"
        }
        excelData.forEach(element => {
            let fields = Object.entries(element).map(([key, value]) => {
                let id;
                if (key.trim().toString().includes("field_")) {
                    id = key.trim().toString().replace("field_", "")
                    return { id, value }
                }
            })
            let recipients = {
                step_type: element.step_type.toString(),
                use_mail: element.use_mail,
                use_sms: element.use_sms,
                member: {
                    name: element.member_name.toString(),
                    id: element.member_id.toString(),
                    sms: {
                        country_code: element.phone_country_code.toString(),
                        phone_number: element.phone_number.toString()
                    }

                },
                auth: {
                    password: element.password.toString(),
                    password_hint: element.password_hint.toString(),
                    valid: {
                        day: element.valid_day,
                        hour: element.valid_hour
                    }
                }
            }
            bodyData.documents.push({
                select_group_name: element.select_group_name,
                document_name: element.document_name,
                fields: fields.filter(function (el) {
                    return el != null;
                }),
                recipients: [recipients]
            })
        });

        const headersToSend = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`
        };
        const post_url = `http://${hostname}:${port}${path}`
        const post_req = await axios.post(post_url, removeNull(bodyData), { headers: headersToSend }).then((res) => {
            return res.data
        }).catch((err) => {
            return err
        })
        return res.status(200).json(post_req)
    }
}
module.exports = { DocumentController };
function removeNull(obj) {
    let newObj = {};
    for (let key in obj) {
        if (obj[key] !== null) {
            newObj[key] = obj[key];
        }
    }
    return newObj;
}