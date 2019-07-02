const workoutRouter = require("express").Router();
const Workout = require("../models/Workout");

const passport = require("passport");
const jwt = require("jsonwebtoken");

// passport protected route(s)
// http://www.passportjs.org/docs/authenticate/
workoutRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // If this function gets called, authentication was successful.
    // 'req.user' contains the authenticated user.
    //res.json(req.user);

    const workouts = await Workout.find({ User: req.user.id });

    response.json(workouts.map(w => w.toJSON()));
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
    console.log(workoutExists);
    if (workoutExists) {
      workoutExists.instances = [
        ...workoutExists.instances,
        { date: req.body.date, amount: req.body.amount }
      ];

      workoutExists.totalAmount += req.body.amount;
      workoutExists.totalPoints += req.body.points;

      await workoutExists.save();

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
        totalPoints: req.body.points
      });

      const result = await workout.save();
      res.status(201).json(result);
    }
  }
);

module.exports = workoutRouter;
