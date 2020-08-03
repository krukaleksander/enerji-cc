const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const chattotalSchema = new Schema({
    id: {
        type: Number,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    login: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    chatName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    }

});

module.exports = mongoose.model('clients', chattotalSchema);