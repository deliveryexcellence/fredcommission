const { Schema, model } = require('mongoose');

const roplyCurrentTicketCount =  Schema({
    key: String,
    currentTicketCount: Number,
});

module.exports = model('roplyCurrentTicketCount', roplyCurrentTicketCount);