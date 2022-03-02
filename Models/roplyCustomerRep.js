const { Schema, model } = require('mongoose');

const roplyCustomerRep =  Schema({
    customerRepId: String,
    webhookURL: String,
    onShift: Boolean,
    totalTickets: Number,
});

module.exports = model('roplyCustomerRep', roplyCustomerRep);