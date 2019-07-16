const mongoose = require("mongoose");

const achievementSchema = mongoose.Schema({
  name: String,
  requirement: Number,
  pointsReward: Number,
  date: Date,
  fontAwesomeIcon: String,
  iconColor: String,
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Activity"
  }
});

achievementSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Achievement = mongoose.model("Achievement", achievementSchema);

module.exports = Achievement;
