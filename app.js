const config = require("./utils/config");
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");

const usersRouter = require("./routes/users");
// const challengesRouter = require("./routes/challenges")
const workoutRouter = require("./routes/workouts");

const { errorHandler } = require("./utils/middleware");

app.use(passport.initialize());
require("./passport-config")(passport);

app.use(cors());
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
// app.use("/api/challenges", challengesRouter);
app.use("/api/workouts", workoutRouter);

app.use(errorHandler);

module.exports = app;
