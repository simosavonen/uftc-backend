const mongoose = require("mongoose");

const workoutSchema = mongoose.Schema({
  instances: [
    {
      date: { type: Date, required: true },
      amount: { type: Number, required: true }
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Activity",
    required: true
  }
});

workoutSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Workout = mongoose.model("Workout", workoutSchema);

module.exports = Workout;
