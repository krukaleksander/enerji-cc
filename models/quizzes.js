var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var quizzesSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    tariff: {
        type: Object,
        required: true
    },

});

module.exports = mongoose.model('Quizzes', quizzesSchema);