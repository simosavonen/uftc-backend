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
      organizers:
        req.body.organizers.length === 0 ? [req.user.id] : req.body.organizers
    });

    const createdChallenge = await challenge.save();
    res.status(201).json(createdChallenge.toJSON());
  }
);

challengesRouter.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(400).send({
        error: "Could not find the challenge or series to update."
      });
    }

    const updatedChallenge = await Challenge.findByIdAndUpdate(
      challenge.id,
      { organizers: req.body.organizers },
      { new: true }
    );
    res.json(updatedChallenge.toJSON());
  }
);

module.exports = challengesRouter;
