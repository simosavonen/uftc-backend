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

workoutRouter.get(
  "/all",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const workouts = await Workout.find({}).populate("activity");
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

    // voiko tämän siirtää tiedoston loppuun, ettei pisteitä lisätä
    // jos suorituksen tallentaminen epäonnistui?
    const scoreExists = await Score.findOne({
      user: req.user.id,
      challenge: req.body.challenge
    });
    if (scoreExists) {
      scoreExists.totalPoints += req.body.amount * activity.points;
      await Score.findByIdAndUpdate(scoreExists.id, scoreExists);
    } else {
      const score = new Score({
        totalPoints: req.body.amount * activity.points,
        challenge: req.body.challenge,
        user: req.user.id
      });
      await score.save();
    }

    if (workoutExists) {
      // is there an instance for this day already?
      const repeated = workoutExists.instances.find(i => {
        return i.date.toISOString().substr(0, 10) === req.body.date;
      });

      if (repeated) {
        const summed = {
          _id: repeated._id,
          date: repeated.date,
          amount: repeated.amount + req.body.amount
        };

        workoutExists.instances = workoutExists.instances.map(i =>
          i.date !== summed.date ? i : summed
        );
      } else {
        workoutExists.instances = [
          ...workoutExists.instances,
          {
            date: req.body.date,
            amount: req.body.amount
          }
        ];
      }

      workoutExists.totalAmount += req.body.amount;
      workoutExists.totalPoints += req.body.amount * activity.points;

      const updatedWorkout = await Workout.findByIdAndUpdate(
        workoutExists.id,
        workoutExists,
        {
          new: true
        }
      );

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

      res.status(201).json(createdWorkout.toJSON());
    }
  }
);

module.exports = workoutRouter;
