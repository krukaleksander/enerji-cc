var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var playersSchema = new Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        required: true
    },

});

module.exports = mongoose.model('Players', playersSchema);