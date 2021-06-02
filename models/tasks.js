const mongoose = require('mongoose');
const Schema = mongoose.Schema;

tasksSchema = new Schema({
    title: {
        type: String,
        // required: true
    },
    clientName: {
        type: String,
        // required: true
    },
    clientNip: {
        type: String,
        // required: true
    },
    description: {
        type: String,
        // required: true
    },
    phone: {
        type: String,
        // required: true
    },
    date: {
        type: Date,
        // required: true
    },
    owner: {
        type: String
    },
    clientId: {
        type: String
    },
    opened: {
        type: Boolean
    }
}, {
    collection: 'tasks'
});

module.exports = mongoose.model('tasks', tasksSchema);