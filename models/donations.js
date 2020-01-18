var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var donationsSchema = new Schema({
    target: {
        type: String,
        required: false
    },
    who: {
        type: String,
        required: false
    },
    created: {
        type: String,
        required: false
    },
    working: {
        type: Boolean,
        required: false
    },
});

module.exports = mongoose.model('Donations', donationsSchema);