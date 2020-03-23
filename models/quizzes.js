var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var quizzesSchema = new Schema({
    id: {
        type: Number,
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