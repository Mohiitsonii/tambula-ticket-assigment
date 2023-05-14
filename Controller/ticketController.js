const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHander = require("../utils/errorHander");
var tambola = require("tambola-generator").default;
const Ticket = require("../models/ticketModel");
const ApiFeatures = require("../utils/apifeatures");

exports.createTicket = catchAsyncError(async (req, res, next) => {
  req.body.user = req.user.id;
  const { numofticket } = req.body;
  if (!numofticket) {
    return next(
      new ErrorHander(
        "Please give the number of how many tickets are you want to create"
      )
    );
  }
  const tickets = tambola.generateTickets(Number(numofticket));
  // console.log(tickets);
  for (let i = 0; i < numofticket; i++) {
    // console.log(tickets[i]._entries);
    const post = await Ticket.create({
      ticket: tickets[i]._entries,
      user: req.body.user,
    })
      .then(() => {})
      .catch((err) => {
        return next(
          new ErrorHander(
            "Something errror is happend or create some new ticket may be",
            400
          )
        );
      });
  }
  res.status(201).json({
    success: true,
    message:
      "tickets created successfully Call the fetch api to see your tickets",
  });
});

exports.getTickets = catchAsyncError(async (req, res, next) => {
  const tickets = await Ticket.find({ user: req.user.id });
  const resultPerPage = 10;
  const ApiFeature = new ApiFeatures(
    Ticket.find({ user: req.user.id }),
    req.query
  )
    .filter()
    .pagination(resultPerPage);
    const ticket = await ApiFeature.query;
  res.status(200).json({
    success: true,
    tickets: ticket,
  });
});
