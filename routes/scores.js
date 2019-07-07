const scoresRouter = require("express").Router();
const Score = require("../models/Score");

scoresRouter.get("/", async (req, res) => {
  const scores = await Score.find({})
    .populate("user", "name")
    .populate("challenge", ["name", "seriesTitle", "pointsGoal"]);
  res.json(scores.map(s => s.toJSON()));
});

module.exports = scoresRouter;
