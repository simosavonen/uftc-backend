const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const resetRequestSchema = new Schema({
  token: {
    type: String,
    required: true
  },
  expires: {
    type: Date,
    required: true
  }
});

resetRequestSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = ResetRequest = mongoose.model(
  "ResetRequest",
  resetRequestSchema
);
