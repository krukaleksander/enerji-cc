var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var quizzesSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },

});

module.exports = mongoose.model('Quizzes', quizzesSchema);