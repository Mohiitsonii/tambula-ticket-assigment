const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const { createTicket, getTickets } = require('../Controller/ticketController');
const router = express.Router()
router.route("/create-ticket").post(isAuthenticated,createTicket);
router.route("/get-tickets").get(isAuthenticated,getTickets);

module.exports = router