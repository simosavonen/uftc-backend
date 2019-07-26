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

// try not to use this, since it returns the whole dataset
workoutRouter.get(
  "/all",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const workouts = await Workout.find({}).populate("activity");
    res.json(workouts.map(w => w.toJSON()));
  }
);

workoutRouter.get(
  "/:userid",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const workouts = await Workout.find({ user: req.params.userid }).populate(
      "activity"
    );
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
        activity: req.body.activity
      });

      const createdWorkout = await workout.save();

      res.status(201).json(createdWorkout.toJSON());
    }
  }
);

// TODO: allow user to update only their own workout
workoutRouter.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const activity = await Activity.findById(req.body.activity);
    const workout = await Workout.findById(req.params.id);
    if (!activity || !workout) {
      return res.status(400).send({
        error: "Could not find the activity or the workout."
      });
    }

    const oldInstance = workout.instances.find(i => {
      return i._id.toString() === req.body.instance.id;
    });
    if (!oldInstance) {
      return res
        .status(400)
        .send({ error: "Could not find the workout instance" });
    }

    // if user set amount to 0, filter out this instance
    if (req.body.instance.amount === 0) {
      workout.instances = workout.instances.filter(
        i => i._id.toString() !== req.body.instance.id
      );
      // delete the workout if instances array got emptied
      if (workout.instances.length === 0) {
        await Workout.findByIdAndRemove(workout.id);
        res.status(204).end();
      }
    } else {
      // user changed the amount
      workout.instances = workout.instances.map(i =>
        i._id.toString() !== req.body.instance.id
          ? i
          : {
              date: req.body.instance.date,
              amount: req.body.instance.amount,
              _id: i._id
            }
      );
    }

    const updatedWorkout = await Workout.findByIdAndUpdate(
      workout.id,
      workout,
      { new: true }
    );
    res.json(updatedWorkout.toJSON());
  }
);

workoutRouter.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const workout = await Workout.findById(req.params.id);
    const score = await Score.findOne({ user: req.user.id });
    if (workout && workout.user.toString() === req.user.id.toString()) {
      score.totalPoints -= workout.totalPoints;
      await Workout.findByIdAndRemove(req.params.id);
      await Score.findByIdAndUpdate(score.id, score);

      res.status(204).end();
    } else {
      res.status(404).send({
        error: "Could not delete the workout."
      });
    }
  }
);

module.exports = workoutRouter;
