const mongoose = require('mongoose');
const { COLLECTION, DEFAULT_VALUES, STATUS, CERTIFICATION } = require("../utils/enum")
const documentSchema = new mongoose.Schema({
    template_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    name: {
        type: String,
        required: true
    },
    comment: {
        type: String
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    data: {
        type: Object,
        default: {}
    },
    link: {
        type: String
    }
});

const Document = mongoose.model(COLLECTION.DOCUMENT, documentSchema);

module.exports = Document;
