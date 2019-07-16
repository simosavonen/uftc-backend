const achievementsRouter = require("express").Router();
const Achievement = require("../models/Achievement");
const passport = require("passport");

achievementsRouter.get("/", async (req, res) => {
  const achievements = await Achievement.find({});
  res.json(achievements.map(a => a.toJSON()));
});

// passport protected route(s)
// http://www.passportjs.org/docs/authenticate/
achievementsRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const achievement = new Achievement({
      name: req.body.name,
      requirement: req.body.requirement,
      pointsReward: req.body.pointsReward,
      date: req.body.date,
      fontAwesomeIcon: req.body.fontAwesomeIcon,
      iconColor: req.body.iconColor,
      activity: req.body.activity
    });
    const createdAchievement = await achievement.save();
    res.status(201).json(createdAchievement.toJSON());
  }
);

achievementsRouter.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Achievement.findByIdAndRemove(req.params.id);
    res.status(204).end();
  }
);

module.exports = achievementsRouter;
