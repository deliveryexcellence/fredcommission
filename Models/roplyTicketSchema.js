const { Schema, model } = require('mongoose');

const roplyTicketModel =  Schema({
    userId: String,
    ticketId: Number,
    ticketChannelId: String,
    ticketType: String,
    isClaimed: Boolean,
    claimedBy: String,
});

module.exports = model('roplyTicketModel', roplyTicketModel);