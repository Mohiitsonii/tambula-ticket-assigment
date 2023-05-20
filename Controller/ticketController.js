const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHander = require("../utils/errorHander");
var tambola = require("tambola-generator").default;
const Ticket = require("../models/ticketModel");
const ApiFeatures = require("../utils/apifeatures");
const lod = require("lodash");
class TambolaTicket {
  constructor() {
    this._entries = new Array(3)
      .fill(0)
      .map(() => new Array(9).fill(0).map(() => 0));
  }

  get numOfEntries() {
    return this._entries
      .map((r) => r.filter((c) => c).length)
      .reduce((a, b) => a + b, 0);
  }

  get isCompleted() {
    return this.numOfEntries === 15;
  }

  isRowCompleted(rowIndex) {
    const rowValues = this.getRowValues(rowIndex);
    return rowValues.filter((r) => r).length == 5;
  }

  isColCompleted(colIndex) {
    const colValues = this.getColumnValues(colIndex);
    return colValues.filter((c) => c).length == 3;
  }

  updateEntry(rowIndex, colIndex, value) {
    this._entries[rowIndex][colIndex] = value;
  }

  getColumnValues(colIndex) {
    return this._entries.map((row) => row[colIndex]);
  }

  getRowValues(rowIndex) {
    return this._entries[rowIndex];
  }

  generate() {
    const numbers = new Array(9)
      .fill(0)
      .map((r, rI) => new Array(10).fill(0).map((c, cI) => rI * 10 + cI + 1));

    this.getRowValues(0).forEach((c, cIndex) => {
      const randomIndex = lod.random(0, numbers[cIndex].length - 1);
      const selectedNumber = numbers[cIndex][randomIndex];

      const randomRow =
        lod.sample([0, 1, 2].filter((r) => !this.isRowCompleted(r))) || 0;

      if (
        !this.isColCompleted(cIndex) &&
        this._entries[randomRow][cIndex] === 0
      ) {
        this.updateEntry(randomRow, cIndex, selectedNumber);
        numbers[cIndex].splice(randomIndex, 1);
      }
    });

    const fillRecursively = () => {
      this.getColumnValues(0).forEach((r, rIndex) => {
        this.getRowValues(0).forEach((c, cIndex) => {
          const randomIndex = lod.random(0, numbers[cIndex].length - 1);
          const selectedNumber = numbers[cIndex][randomIndex];

          const setOrNot = Math.random() > 0.5;

          if (
            setOrNot &&
            !this.isCompleted &&
            !this.isRowCompleted(rIndex) &&
            !this.isColCompleted(cIndex) &&
            this._entries[rIndex][cIndex] === 0
          ) {
            this.updateEntry(rIndex, cIndex, selectedNumber);
            numbers[cIndex].splice(randomIndex, 1);
          }
        });
      });

      if (!this.isCompleted) {
        fillRecursively();
      } else {
        this.sort();
      }
    };

    fillRecursively();
  }

  sort() {
    let ticket = this._entries;

    for (let col = 0; col < 9; col++) {
      if (ticket[0][col] != 0 && ticket[1][col] != 0 && ticket[2][col] != 0) {
        for (let i = 0; i < 2; i++) {
          for (let j = i + 1; j < 3; j++) {
            if (ticket[i][col] > ticket[j][col]) {
              let temp = ticket[i][col];
              ticket[i][col] = ticket[j][col];
              ticket[j][col] = temp;
            }
          }
        }
      } else if (
        ticket[0][col] != 0 &&
        ticket[1][col] != 0 &&
        ticket[2][col] == 0
      ) {
        if (ticket[0][col] > ticket[1][col]) {
          let temp = ticket[0][col];
          ticket[0][col] = ticket[1][col];
          ticket[1][col] = temp;
        }
      } else if (
        ticket[0][col] != 0 &&
        ticket[1][col] == 0 &&
        ticket[2][col] != 0
      ) {
        if (ticket[0][col] > ticket[2][col]) {
          let temp = ticket[0][col];
          ticket[0][col] = ticket[2][col];
          ticket[2][col] = temp;
        }
      } else if (
        ticket[0][col] == 0 &&
        ticket[1][col] != 0 &&
        ticket[2][col] != 0
      ) {
        if (ticket[1][col] > ticket[2][col]) {
          let temp = ticket[1][col];
          ticket[1][col] = ticket[2][col];
          ticket[2][col] = temp;
        }
      }
    }
    return ticket;
  }

  print() {
    return this._entries;
  }
}
const generateTickets = (Num) => {
  let tickets = [];
  for (let i = 0; i < Num; i++) {
    const ticket = new TambolaTicket();
    ticket.generate();
    tickets.push(ticket.print());
  }
  return tickets;
};
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
  const tickets = generateTickets(Number(numofticket));
  // console.log(tickets);
  for (let i = 0; i < numofticket; i++) {
    // console.log(tickets[i]._entries);
    const post = await Ticket.create({
      ticket: tickets[i],
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
