const config = require("./utils/config");
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");

const usersRouter = require("./routes/users");
const challengesRouter = require("./routes/challenges");
const workoutRouter = require("./routes/workouts");
const activityRouter = require("./routes/activities");
const scoresRouter = require("./routes/scores");
const achievementsRouter = require("./routes/achievements");
const passwordsRouter = require("./routes/passwords");

const { errorHandler, requestLogger } = require("./utils/middleware");
const logger = require("./utils/logger");

app.use(passport.initialize());
require("./passport-config")(passport);

app.use(cors()); // todo: configure this
app.use(express.json({ extended: false }));
app.use(requestLogger);

// fix deprecation warnings
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

logger.info("connecting to", config.MONGODB_URI);
mongoose
  .connect(config.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    logger.error("connected to MongoDB");
  })
  .catch(error => {
    logger.error("error connection to MongoDB:", error.message);
  });

app.use("/api/users", usersRouter);
app.use("/api/challenges", challengesRouter);
app.use("/api/workouts", workoutRouter);
app.use("/api/activities", activityRouter);
app.use("/api/scores", scoresRouter);
app.use("/api/achievements", achievementsRouter);
app.use("/api/passwords", passwordsRouter);

app.use(errorHandler);

module.exports = app;
