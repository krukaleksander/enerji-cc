var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var newsSchema = new Schema({
    target: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },

});

module.exports = mongoose.model('News', newsSchema);