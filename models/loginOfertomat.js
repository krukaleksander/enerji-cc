var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var longinOfertomat = new Schema({
    login: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },

});

module.exports = mongoose.model('Longinus', longinOfertomat);