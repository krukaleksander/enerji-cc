var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statystykiSchema = new Schema({
    name: {
        type: String,
        required: false
    },
    ammount: {
        type: Number,
        required: false
    },
    description: {
        type: String,
        required: false
    },
});

module.exports = mongoose.model('Statystyki', statystykiSchema);