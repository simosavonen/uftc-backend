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

// TODO: ota huomioon sarjan bonuskerroin
// jos käyttäjä poisti viimeisen merkinnän, poista koko workout olio
workoutRouter.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const activity = await Activity.findById(req.body.activity);
    const workout = await Workout.findById(req.params.id);
    const score = await Score.findOne({ user: req.user.id });
    if (!activity || !workout || !score) {
      return res.status(400).send({
        error: "Could not find the activity, the workout or the score."
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
    const oldAmount = oldInstance.amount;

    // if user set amount to 0, filter out this instance
    if (req.body.instance.amount === 0) {
      workout.instances = workout.instances.filter(
        i => i._id.toString() !== req.body.instance.id
      );

      workout.totalAmount -= oldAmount;
      workout.totalPoints -= oldAmount * activity.points; // series bonus?
      score.totalPoints -= oldAmount * activity.points; // series bonus?
    } else {
      // user changed the amount
      const delta = req.body.instance.amount - oldAmount;
      workout.totalAmount += delta;
      workout.totalPoints += delta * activity.points; // series bonus?
      score.totalPoints += delta * activity.points; // series bonus?

      workout.instances = workout.instances.map(i =>
        i._id.toString() !== req.body.instance.id ? i : req.body.instance
      );
    }

    const updatedWorkout = await Workout.findByIdAndUpdate(
      workout.id,
      workout,
      { new: true }
    );

    await Score.findByIdAndUpdate(score.id, score);

    res.json(updatedWorkout.toJSON());
  }
);

module.exports = workoutRouter;
