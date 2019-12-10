var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var importants = new Schema({
    title: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('Importants', importantsSchema);