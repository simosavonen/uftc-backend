/*const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String, //String? vs email
  password: String //String? vs password
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model("User", noteSchema);
*/
