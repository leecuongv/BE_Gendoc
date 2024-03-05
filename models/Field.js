const mongoose = require('mongoose');
const { COLLECTION } = require('../utils/enum');

const fieldSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    }
});

const Field = mongoose.model(COLLECTION.FIELD, fieldSchema);

module.exports = Field;
