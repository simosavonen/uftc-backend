const activityRouter = require("express").Router();
const Activity = require("../models/Activity");
const passport = require("passport");

// unprotected routes
activityRouter.get("/", async (req, res) => {
  const activities = await Activity.find({});
  res.json(activities.map(a => a.toJSON()));
});

// passport protected route(s)
// http://www.passportjs.org/docs/authenticate/
activityRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const activity = new Activity({
      name: req.body.name,
      points: req.body.points,
      type: req.body.type,
      unit: req.body.unit,
      description: req.body.description,
      url: req.body.url,
      icon: req.body.icon
    });

    const createdActivity = await activity.save();
    res.status(201).json(createdActivity.toJSON());
  }
);

module.exports = activityRouter;
