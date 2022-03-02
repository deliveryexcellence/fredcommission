const { Schema, model } = require('mongoose');

const roplyShift =  Schema({
    userId: String,
    startTime: String,
    endTime: String,
    ticketsCompleted: Number,
});

module.exports = model('roplyShift', roplyShift);