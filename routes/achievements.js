const achievementsRouter = require("express").Router();
const Achievement = require("../models/Achievement");
const passport = require("passport");

achievementsRouter.get("/", async (req, res) => {
  const achievements = await Achievement.find({});
  res.json(achievements.map(a => a.toJSON()));
});

achievementsRouter.get("/daily", async (req, res) => {
  const today = new Date().toISOString().substr(0, 10);
  const achievements = await Achievement.find({ date: today });
  res.json(achievements.map(a => a.toJSON()));
});

achievementsRouter.get("/daily/:date", async (req, res, next) => {
  try {
    const date = new Date(req.params.date).toISOString().substr(0, 10);
    const achievements = await Achievement.find({ date });
    res.json(achievements.map(a => a.toJSON()));
  } catch (error) {
    next(error);
  }
});

achievementsRouter.get("/activity/:id", async (req, res, next) => {
  try {
    const achievements = await Achievement.find({
      activity: req.params.id
    });
    res.json(achievements.map(a => a.toJSON()));
  } catch (error) {
    next(error);
  }
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
      date: req.body.date === "" ? null : req.body.date,
      fontAwesomeIcon: req.body.fontAwesomeIcon,
      iconColor: req.body.iconColor,
      activity: req.body.activity === "" ? null : req.body.activity
    });

    if (!achievement.date && !achievement.activity) {
      return res
        .status(400)
        .send({ error: "Invalid data, both date and activity were null." });
    }

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
