const challengesRouter = require("express").Router();
const Challenge = require("../models/Challenge");
const Activity = require("../models/Activity");
const passport = require("passport");

challengesRouter.get("/", async (req, res) => {
  const challenges = await Challenge.find({}).populate("activities");
  res.json(challenges.map(c => c.toJSON()));
});

// passport protected route(s)
// http://www.passportjs.org/docs/authenticate/
challengesRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const activities = await Activity.find({});
    const activityIDs = activities.map(a => a._id);

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
      organizers: [req.user.id],
      activities: activityIDs
    });

    const createdChallenge = await challenge.save();
    res.status(201).json(createdChallenge.toJSON());
  }
);

module.exports = challengesRouter;
