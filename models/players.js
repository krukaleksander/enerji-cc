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
    pointsWeek: {
        type: Number,
        required: true
    },
    pointsMonth: {
        type: Number,
        required: true
    },
    pointsNextMonth: {
        type: Number,
        required: true
    },
    allPoints: {
        type: Number,
        required: true
    },

});

module.exports = mongoose.model('Players', playersSchema);