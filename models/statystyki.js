var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statystyki = new Schema({
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

module.exports = mongoose.model('statystyki', statystyki);