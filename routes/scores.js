const scoresRouter = require("express").Router();
const Score = require("../models/Score");
const passport = require("passport");

scoresRouter.get("/", async (req, res) => {
  const scores = await Score.find({});
  res.json(scores.map(s => s.toJSON()));
});

// passport protected route(s)
// http://www.passportjs.org/docs/authenticate/
scoresRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const scoreExists = await Score.findOne({
      challenge: req.body.challenge,
      user: req.body.user
    });
    if (scoreExists) {
      scoreExists = {
        ...scoreExists,
        totalPoints: (scoreExists.totalPoints += req.body.points)
      };

      const updatedScore = await Score.findByIdAndUpdate(
        scoreExists.id,
        scoreExists,
        { new: true }
      );

      res.json(updatedScore.toJSON());
    } else {
    }
  }
);

module.exports = scoresRouter;
