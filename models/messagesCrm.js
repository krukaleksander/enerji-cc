const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const messagesSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    messages: {
        type: Array,
        required: true
    }
});

module.exports = mongoose.model('messages', messagesSchema);