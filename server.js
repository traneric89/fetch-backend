const uniqid = require("uniqid");
const express = require("express");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

//Mock database object
let pointsDatabase = {};

//Validate ID function to check if ID exists in our 'database'
const validateId = (req, res, next) => {
  const id = req.params.id;
  if (pointsDatabase[id] != undefined) {
    next();
  } else {
    res.status(404).json({ message: "ID not found." });
  }
};

//POST request generating unique id and calculate total points using calculatePoints function
app.post("/receipts/process", (req, res, next) => {
  const id = uniqid();
  const pointsResult = calculatePoints(req.body);
  pointsDatabase[id] = pointsResult;
  res.status(201).send({ id: id });
});

//GET request to get points based on provided id param
app.get("/receipts/:id/points", validateId, (req, res, next) => {
  res.status(200).send({ points: pointsDatabase[req.params.id] });
});

//Function to calculate points based on rules
const calculatePoints = (receipt) => {
  let totalPoints = 0;

  //One point for every alphanumeric character in the retailer name
  totalPoints += receipt.retailer.replace(/[^0-9a-z]/gi, "").length;

  //50 points if the total is a round dollar amount with no cents
  if (
    receipt.total[receipt.total.length - 1] == 0 &&
    receipt.total[receipt.total.length - 2] == 0
  ) {
    totalPoints += 50;
  }

  //25 points if the total is a multiple of 0.25
  if (receipt.total % 0.25 == 0) {
    totalPoints += 25;
  }

  //5 points for every two items on the receipt
  totalPoints += Math.floor(receipt.items.length / 2) * 5;

  //If the trimmed length of the item description is a multiple of 3,
  //multiply the price by 0.2 and round up to the nearest integer.
  //The result is the number of points earned.
  receipt.items.forEach((item) => {
    if (item.shortDescription.length % 3 == 0) {
      totalPoints += Math.ceil(item.price * 0.2);
    }
  });

  //6 points if the day in the purchase date is odd
  if (receipt.purchaseDate[receipt.purchaseDate.length - 1] % 2 != 0) {
    totalPoints += 6;
  }

  //10 points if the time of purchase is after 2:00pm and before 4:00pm.
  if (
    receipt.purchaseTime.split(":")[0] >= 14 &&
    receipt.purchaseTime.split(":")[0] <= 16
  ) {
    totalPoints += 10;
  }

  return totalPoints;
};

// Error handling middleware
app.use(validateId);
app.use((err, req, res, next) => {
  res.status(500).send("Error!");
});
app.listen(PORT, () => {
  console.log(`Running on port: ${PORT}`);
});
