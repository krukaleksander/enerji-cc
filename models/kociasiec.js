const mongoose = require('mongoose');
const Schema = mongoose.Schema;

kociasiecSchema = new Schema({
    name: {
        type: String,
    },
    phone: {
        type: String,
    },
    message: {
        type: String,
    }
}, {
    collection: 'kociasiec'
});

module.exports = mongoose.model('kociasiec', kociasiecSchema);