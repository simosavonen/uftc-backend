const scoresRouter = require("express").Router();
const Score = require("../models/Score");
const passport = require("passport");

scoresRouter.get("/", async (req, res) => {
  const scores = await Score.find({});
  res.json(scores.map(s => s.toJSON()));
});

module.exports = scoresRouter;
