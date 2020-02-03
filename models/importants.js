var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var importants = new Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    ammount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('importants', importants);