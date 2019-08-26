const workoutRouter = require("express").Router();
const Workout = require("../models/Workout");
const Activity = require("../models/Activity");
const Challenge = require("../models/Challenge");
const passport = require("passport");
const moment = require("moment");

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
  "/:activityid",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const challenges = await Challenge.find({});
    if (challenges.length === 0) {
      return res
        .status(400)
        .send({ error: "There is no challenge to add workouts to." });
    }

    const startDate = moment(challenges[0].startDate);
    const endDate = moment(challenges[0].endDate);
    if (
      moment(req.body.date).isBefore(startDate) ||
      moment(req.body.date).isAfter(endDate)
    ) {
      return res.status(400).send({
        error: "Cannot save a workout outside the challenge timeline"
      });
    }

    if (moment(req.body.date).isAfter(moment())) {
      return res
        .status(400)
        .send({ error: "Cannot save a workout in the future" });
    }

    const activity = req.params.activityid;
    const workoutExists = await Workout.findOne({
      user: req.user.id,
      activity
    });
    if (workoutExists) {
      const updatedWorkout = await createWorkoutInstance(
        { date: req.body.date, amount: req.body.amount },
        workoutExists
      );
      res.json(updatedWorkout.toJSON());
    } else {
      const workout = new Workout({
        instances: [{ date: req.body.date, amount: req.body.amount }],
        user: req.user.id,
        activity
      });

      const createdWorkout = await workout.save();
      res.status(201).json(createdWorkout.toJSON());
    }
  }
);

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

    if (workout.user.toString() !== req.user.id.toString()) {
      return res
        .status(400)
        .send({ error: "Can only update your own workouts." });
    }

    const oldInstance = workout.instances.find(i => {
      return i._id.toString() === req.body.instance.id;
    });
    if (!oldInstance) {
      return res
        .status(400)
        .send({ error: "Could not find the workout instance" });
    }

    workout.instances = workout.instances.map(i =>
      i._id.toString() !== req.body.instance.id
        ? i
        : {
            date: req.body.instance.date,
            amount: req.body.instance.amount,
            _id: i._id
          }
    );

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
    if (workout && workout.user.toString() === req.user.id.toString()) {
      await Workout.findByIdAndRemove(req.params.id);
      res.status(200).send({
        message: "Successfully deleted the whole workout"
      });
    } else {
      res.status(404).send({
        error: "Could not delete the workout."
      });
    }
  }
);

workoutRouter.delete(
  "/:workout/:instance",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const workout = await Workout.findById(req.params.workout);
    if (workout && workout.user.toString() === req.user.id.toString()) {
      workout.instances = workout.instances.filter(
        i => i._id.toString() !== req.params.instance.toString()
      );

      if (workout.instances.length === 0) {
        await Workout.findByIdAndRemove(req.params.workout);
        return res.status(204).send({
          message: "It was the last instance, deleted whole workout object"
        });
      }

      const updatedWorkout = await Workout.findByIdAndUpdate(
        workout.id,
        workout,
        { new: true }
      );
      res.json(updatedWorkout.toJSON());
    } else {
      res.status(404).send({
        error: "Could not delete the instance."
      });
    }
  }
);

async function createWorkoutInstance(instance, workout) {
  // is there an instance for this day already?
  const repeated = workout.instances.find(i => {
    return moment(i.date).format("YYYY-MM-DD") === instance.date;
  });

  if (repeated) {
    const summed = {
      _id: repeated._id,
      date: repeated.date,
      amount: repeated.amount + instance.amount
    };

    workout.instances = workout.instances.map(i =>
      i.date !== summed.date ? i : summed
    );
  } else {
    workout.instances = [
      ...workout.instances,
      {
        date: instance.date,
        amount: instance.amount
      }
    ];
  }

  const updatedWorkout = await Workout.findByIdAndUpdate(workout.id, workout, {
    new: true
  });
  return updatedWorkout;
}

module.exports = workoutRouter;
