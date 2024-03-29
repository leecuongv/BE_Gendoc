const Document = require('../models/Document');
const mongoose = require('mongoose');
const User = require('../models/User');
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");
const reader = require('xlsx')
const expressionParser = require("docxtemplater/expressions.js");

const http = require('http');
const axios = require('axios');


const DocumentController = {
    Create: async (req, res) => {
        try {

            const { name, comment, data, link, linkTemplate, linkOutput } = req.body;


            const content = fs.readFileSync(
                path.resolve(linkTemplate),
                "binary"
            );
            const zip = new PizZip(content);
            expressionParser.filters.upper = function (input) {
                if (!input) return input;
                return input.toUpperCase();
            };
            expressionParser.filters.lower = function (input) {
                if (!input) return input;
                return input.toLowerCase();
            };

            expressionParser.filters.sum = function (input, field) {
                if (!input) return input;

                return input.reduce(function (sum, object) {
                    return sum + object[field];
                }, 0);
            };
            expressionParser.filters.where = function (input, query) {
                return input.filter(function (item) {
                    return expressions.compile(query)(item);
                });
            };

            const doc = new Docxtemplater(zip, {
                parser: expressionParser,
                linebreaks: true,
                paragraphLoop: true
            },
            );

            doc.render(data);
            const buf = doc.getZip().generate({
                type: "nodebuffer",
                compression: "DEFLATE",
            });
            let outputTmpPath = linkOutput + "\\" + name;

            let fileName = path.basename(outputTmpPath).split(".")[0];
            let fileExtension = path.extname(outputTmpPath).replace(".", "");
            let directoryPath = path.dirname(outputTmpPath);

            let newPath = directoryPath + "\\" + fileName + "." + fileExtension;
            if (fs.existsSync(outputTmpPath)) {
                let newName = fileName;
                newPath = directoryPath + "\\" + newName + "." + fileExtension;
                let index = 1;
                while (fs.existsSync(newPath)) {
                    index++;
                    let newName2 = fileName + "(" + index + ")";
                    newPath = directoryPath + "\\" + newName2 + "." + fileExtension;

                }
            }

            console.log(newPath);
            fs.writeFileSync(path.resolve(newPath), buf);

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