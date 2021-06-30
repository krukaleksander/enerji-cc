const mongoose = require('mongoose');
const Schema = mongoose.Schema;

chatSchema = new Schema({
    name: {
        type: String,
        // required: true
    },
    text: {
        type: String,
        // required: true
    },
    date: {
        type: Date,
        // required: true
    }
}, {
    collection: 'chat'
});

module.exports = mongoose.model('chat', chatSchema);