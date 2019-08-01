const mongoose = require("mongoose");

const challengeSchema = mongoose.Schema({
  name: String,
  pointsGoal: Number,
  releaseDate: Date,
  startDate: Date,
  endDate: Date,
  deadline: Date,
  seriesTitle: String,
  description: String,
  icon: String,
  pointBonus: Number,
  organizers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
});

challengeSchema.virtual("participants", {
  ref: "User",
  localField: "_id",
  foreignField: "activeChallenge",
  count: true
});

challengeSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
  virtuals: true
});

const Challenge = mongoose.model("Challenge", challengeSchema);

module.exports = Challenge;
