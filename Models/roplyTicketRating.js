const { Schema, model } = require('mongoose');

const roplyTicketRating =  Schema({
    ticketCount: Number,
    ticketChannelId: String,
    userRating: String,
    repSummary: String,
});

module.exports = model('roplyTicketRating', roplyTicketRating);