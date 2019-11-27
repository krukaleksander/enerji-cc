var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var importantlinksSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },

});

module.exports = mongoose.model('Importantlinks', importantlinksSchema);