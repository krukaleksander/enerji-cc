var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var newsSchema = new Schema({
    target: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: false
    },
    content: {
        type: String,
        required: false
    },

});

module.exports = mongoose.model('News', newsSchema);