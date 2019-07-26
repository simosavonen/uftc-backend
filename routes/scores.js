const scoresRouter = require("express").Router();
const Score = require("../models/Score");
const Workout = require("../models/Workout");
const Challenge = require("../models/Challenge");
const passport = require("passport");

const differenceInWeeks = (dt2, dt1) => {
  let diff = (dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60 * 60 * 24 * 7;
  return Math.abs(Math.round(diff));
};

const abbreviate = name => {
  const nameArray = name.split(" ");
  if (nameArray.length === 1) return name; // nickname?

  // feature: Tommy Lee Jones  =>  Tommy L.
  return nameArray[0] + " " + nameArray[1][0] + ".";
};

// this becomes obsolete soon
scoresRouter.get("/", async (req, res) => {
  const scores = await Score.find({})
    .populate("user", "name")
    .populate("challenge", ["name", "seriesTitle", "pointBonus", "pointsGoal"]);
  res.json(scores.map(s => s.toJSON()));
});

// Returns the weekly scores, formatted like
// [{ name: "Random P.",
//    id: user._id,
//    seriesTitle: user.activeChallenge.seriesTitle
//    data: [w1, w2, w3, ...]}]
scoresRouter.get("/weekly", async (req, res) => {
  // is this calculation slow with 100+ participants?
  const hrStart = process.hrtime();

  const challenges = await Challenge.find({});

  const startDate = new Date(challenges[0].startDate);
  const endDate = new Date(challenges[0].endDate);
  const weeks = differenceInWeeks(endDate, startDate);

  const workouts = await Workout.find({})
    .sort({ user: "asc" })
    .populate("activity", "points")
    .populate("user", ["name", "location", "activeChallenge"]);

  const weeklyScores = [];

  let lastUser = "";
  let userIndex = -1;
  workouts.forEach(w => {
    if (w.user.id !== lastUser) {
      let title = "null";
      if (w.user.activeChallenge) {
        title = challenges.find(c => {
          return c._id.toString() === w.user.activeChallenge.toString();
        }).seriesTitle;
      }

      weeklyScores.push({
        name: abbreviate(w.user.name),
        id: w.user._id,
        location: w.user.location,
        seriesTitle: title,
        data: new Array(weeks).fill(0)
      });
      lastUser = w.user.id;
      userIndex += 1;
    }
    const points = w.activity.points;
    w.instances.forEach(i => {
      const weekIndex = differenceInWeeks(new Date(i.date), startDate);
      weeklyScores[userIndex].data[weekIndex] += i.amount * points;
    });
  });

  // do we need to cache the results or not?
  const hrEnd = process.hrtime(hrStart);
  console.info(
    "Calculating weekly scores took %ds %dms",
    hrEnd[0],
    hrEnd[1] / 1000000
  );

  res.json(weeklyScores);
});

scoresRouter.get(
  "/today",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const workouts = await Workout.find({ user: req.user.id }).populate(
      "activity",
      "points"
    );
    const today = new Date().toISOString().substr(0, 10);
    let total = 0;
    workouts.forEach(w => {
      const points = w.activity.points;
      w.instances.forEach(i => {
        if (i.date.toISOString().substr(0, 10) === today) {
          total += i.amount * points; // todo: series bonus
        }
      });
    });
    res.json({ totalToday: total });
  }
);

module.exports = scoresRouter;
