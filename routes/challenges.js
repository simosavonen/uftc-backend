const challengesRouter = require("express").Router();
const Challenge = require("../models/Challenge");
const passport = require("passport");

challengesRouter.get("/", async (req, res) => {
  const challenges = await Challenge.find({}).populate("participants");
  res.json(challenges);
});

// passport protected route(s)
// http://www.passportjs.org/docs/authenticate/
challengesRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const challenge = new Challenge({
      name: req.body.name,
      pointsGoal: req.body.pointsGoal,
      releaseDate: req.body.releaseDate,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      deadline: req.body.deadline,
      seriesTitle: req.body.seriesTitle,
      description: req.body.description,
      icon: req.body.icon,
      pointBonus: req.body.pointBonus,
      organizers: [req.user.id]
    });

    const createdChallenge = await challenge.save();
    res.status(201).json(createdChallenge.toJSON());
  }
);

module.exports = challengesRouter;
