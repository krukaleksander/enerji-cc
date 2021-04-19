const mongoose = require('mongoose');
const Schema = mongoose.Schema;

clientsreadySchema = new Schema({
    id: {
        type: String,
        // required: true
    },
    name: {
        type: String,
        // required: true
    },
    category: {
        type: String,
        // required: true
    },
    phone: {
        type: String,
        // required: true
    },
    email: {
        type: String,
        // required: true
    },
    consumption: {
        type: String,
        // required: true
    },
    owner: {
        type: String,
        // required: true
    },
    city: {
        type: String,
        // required: true
    },
    street: {
        type: String,
        // required: true
    },
    streetNumber: {
        type: String,
        // required: true
    },
    postalCode: {
        type: String,
        // required: true
    },
    description: {
        type: String,
        // required: true
    },
    tasks: {
        type: Array,
        // required: true
    },
    status: {
        type: String,
        // required: true
    }
}, {
    collection: 'clientsready'
});

module.exports = mongoose.model('clientsready', clientsreadySchema);