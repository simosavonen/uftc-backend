const config = require("./utils/config");
const express = require("express");
const app = express();

const mongoose = require("mongoose");
const passport = require("passport");

const usersRouter = require("./routes/users");

const { errorHandler } = require("./utils/middleware");

app.use(passport.initialize());
require("./passport-config")(passport);

app.use(express.json({ extended: false }));

mongoose.set("useCreateIndex", true);
mongoose
  .connect(config.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch(error => {
    console.log("error connection to MongoDB:", error.message);
  });

app.use("/api/users", usersRouter);
// app.use("/api/challenges", require("./routes/challenges"));
// app.use("/api/activities", require("./routes/activities"));

app.use(errorHandler);

module.exports = app;
