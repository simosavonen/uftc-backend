const mongoose = require("mongoose");

const challengeSchema = mongoose.Schema({
  name: String,
  pointsGoal: Number,
  releaseDate: Date,
  startDate: Date,
  endDate: Date,
  deadline: Date,
  seriesTitle: String,
  pointBonus: Number,
  organizers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  activities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity"
    }
  ]
});

challengeSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Challenge = mongoose.model("Challenge", challengeSchema);

module.exports = Challenge;
