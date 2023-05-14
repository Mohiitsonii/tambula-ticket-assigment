const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    ticket:[[Number]],
    user: Object
});

module.exports = mongoose.model("Ticket",ticketSchema);
