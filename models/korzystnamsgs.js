const mongoose = require('mongoose');
const Schema = mongoose.Schema;

korzystnamsgsSchema = new Schema({
    name: {
        type: String,
    },
    phone: {
        type: String,
    },
    email: {
        type: String,
    },
    msg: {
        type: String,
    }
}, {
    collection: 'korzystnamsgs'
});

module.exports = mongoose.model('korzystnamsgs', korzystnamsgsSchema);