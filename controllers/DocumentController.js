const Document = require('../models/Document');
const mongoose = require('mongoose');
const User = require('../models/User');
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");
const reader = require('xlsx')
const expressionParser = require("docxtemplater/expressions.js");
const InspectModule = require("docxtemplater/js/inspect-module.js");
const iModule = InspectModule();
const topdf = require('docx2pdf-converter')
const http = require('http');
const axios = require('axios');
const ImageModule = require('docxtemplater-image-hyperlink-module-free');
const moment = require('moment');
const { upper, lower, size, sum_by, average, format_date, max, min, area, perimeter, mul, where, parseImageString, sort_by, to_fixed, getHttpData, base64DataURLToArrayBuffer, sum_by_qty } = require('./handler/Expression');
const { generateNewPath } = require('./handler/FileHandler');
const DocumentController = {
    Create: async (req, res) => {
        try {
            const { name, comment, data, link, linkTemplate, linkOutput } = req.body;
            const content = fs.readFileSync(
                path.resolve(linkTemplate),
                "binary"
            );

            expressionParser.filters.upper = function (input) {
                return upper(input);
            };
            expressionParser.filters.lower = function (input) {
                return lower(input);
            };
            expressionParser.filters.size = function (input) {
                return size(input);
            };
            expressionParser.filters.sum_by = function (input, field) {
                return sum_by(input, field);
            };
            expressionParser.filters.average = function (input, field) {
                return average(input, field);
            };
            expressionParser.filters.format_date = function (input, format) {
                return format_date(input, format);
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
            expressionParser.filters.to_fixed = function (input, precision) {
                return to_fixed(input, precision);
            };
            expressionParser.filters.sum_by_qty = function (input, field, qty) {
                return sum_by_qty(input, field, qty);
            };


            expressionParser.filters.set_size = function (input, width, height) {
                console.log('set_size', input, width, height);
                return {
                    data: input,
                    set_size: [width, height],
                };
            };
            function nullGetter(part) {
                if (part.raw) {
                    return "{" + part.raw + "}";
                }
                if (!part.module && part.value) {
                    return "{" + part.value + "}";
                }
                return "........";
            }


            //add image
            const imageOpts = {
                centered: false,
                fileType: "docx",
                getImage: function (tagValue, tagName) {
                    if (tagValue.startsWith("data:image/")) {
                        return base64DataURLToArrayBuffer(tagValue);
                    }
                    return fs.readFileSync(tagValue);

                },
                getSize: function (img, tagValue, tagName) {
                    const config = parseImageString(img, tagName);
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

            const doc = new Docxtemplater(zip, {
                nullGetter,
                modules: [new ImageModule(imageOpts), iModule],
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

            let newPath = generateNewPath(directoryPath, fileName, fileExtension);

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
function convertToJSON(inputString) {

    inputString = inputString.replace(/‘/g, "'");
    inputString = inputString.replace(/’/g, "'");

    inputString = inputString.replace(/'/g, '"');

    try {
        console.log('inputString:', JSON.stringify(inputString));
        const jsonObject = JSON.parse(inputString);
        return jsonObject;
    } catch (e) {
        console.error('Lỗi khi chuyển đổi thành JSON:', e);
        return null;
    }
}