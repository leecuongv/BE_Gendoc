const mongoose = require('mongoose');
const { COLLECTION } = require('../utils/enum');

const templateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: false
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    use_ai: {
        type: Boolean,
        default: false
    },
    // fields: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     required: true,
    //     ref: COLLECTION.FIELD
    // }],
    fields: [{
        key: {
            type: String,
            required: true
        },
    }],
    link: {
        type: String,
        required: true
    }
});

const Template = mongoose.model(COLLECTION.TEMPLATE, templateSchema);

module.exports = Template;
