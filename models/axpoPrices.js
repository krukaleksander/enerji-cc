const mongoose = require('mongoose');
const Schema = mongoose.Schema;

axpopricesSchema = new Schema({
    name: {
        type: String,
        // required: true
    },
    description: {
        type: String,
        // required: true
    },
    tariffs: {
        type: Array,
        // required: true
    }
}, {
    collection: 'axpoprices'
});

module.exports = mongoose.model('axpoprices', axpopricesSchema);