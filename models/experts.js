var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expertsSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    whenToCall: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    starting: {
        type: String,
        required: true
    },
    regions: {
        type: String,
        required: true
    },
    extraInfo: {
        type: String,
        required: true
    },

});

module.exports = mongoose.model('Experts', expertsSchema);