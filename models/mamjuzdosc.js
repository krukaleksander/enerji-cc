var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mamjuzdoscSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    }

});

module.exports = mongoose.model('mamjuzdosc', mamjuzdoscSchema);