const mongoose = require("mongoose");

const activitySchema = mongoose.Schema({
  name: String,
  points: Number,
  type: String,
  unit: String,
  description: String,
  url: String,
  icon: String
});

activitySchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
