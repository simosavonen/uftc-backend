const workoutRouter = require("express").Router();
const Workout = require("../models/Workout");
const Activity = require("../models/Activity");
const Score = require("../models/Score");
const passport = require("passport");

// passport protected route(s)
// http://www.passportjs.org/docs/authenticate/
workoutRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const workouts = await Workout.find({ user: req.user.id });
    res.json(workouts.map(w => w.toJSON()));
  }
);

workoutRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const workoutExists = await Workout.findOne({
      user: req.user.id,
      activity: req.body.activity
    });

    // dont trust the clients, check what the real points / activity are
    const activity = await Activity.findById(req.body.activity);

    const scoreExists = await Score.findOne({
      user: req.user.id,
      challenge: req.body.challenge
    });
    const score = new Score({
      totalPoints: req.body.amount * activity.points,
      challenge: req.body.challenge,
      user: req.user.id
    });

    if (workoutExists) {
      workoutExists.instances = [
        ...workoutExists.instances,
        {
          date: req.body.date,
          amount: req.body.amount
        }
      ];

      workoutExists.totalAmount += req.body.amount;
      workoutExists.totalPoints += req.body.amount * activity.points;

      const updatedWorkout = await Workout.findByIdAndUpdate(
        workoutExists.id,
        workoutExists,
        {
          new: true
        }
      );

      // update total scores
      if (scoreExists) {
        scoreExists.totalPoints += req.body.amount * activity.points;
        await Score.findByIdAndUpdate(scoreExists.id, scoreExists);
      } else {
        await score.save();
      }

      res.json(updatedWorkout.toJSON());
    } else {
      const workout = new Workout({
        instances: [{ date: req.body.date, amount: req.body.amount }],
        user: req.user.id,
        activity: req.body.activity,
        totalAmount: req.body.amount,
        totalPoints: req.body.amount * activity.points
      });

      const createdWorkout = await workout.save();

      // update total scores
      await score.save();

      res.status(201).json(createdWorkout.toJSON());
    }
  }
);

module.exports = workoutRouter;
