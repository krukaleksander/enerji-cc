const mongoose = require('mongoose');
const Schema = mongoose.Schema;

expertsSchema = new Schema({
    clients: {
        type: Array,
        required: true
    }
});

module.exports = mongoose.model('Experts', expertsSchema);