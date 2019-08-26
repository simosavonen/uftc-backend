const scoresRouter = require("express").Router();
const Score = require("../models/Score");
const Workout = require("../models/Workout");
const Challenge = require("../models/Challenge");
const Achievement = require("../models/Achievement");
const passport = require("passport");
const moment = require("moment");

const differenceInWeeks = (dt2, dt1) => {
  return moment(dt2).diff(moment(dt1), "weeks");
};

const abbreviate = name => {
  const nameArray = name.split(" ");
  if (nameArray.length === 1) return name; // nickname?

  // feature: Tommy Lee Jones  =>  Tommy L.
  return nameArray[0] + " " + nameArray[1][0] + ".";
};

const activityScore = (workouts, activity, bonus) => {
  const workout = workouts.find(w => {
    return w.activity.id.toString() === activity.toString();
  });
  if (workout) {
    return (
      workout.instances.reduce((sum, i) => sum + i.amount, 0) *
      workout.activity.points *
      bonus
    );
  }
  return 0;
};

const dayScore = (workouts, date, bonus) => {
  const theDay = moment(date);
  let dayTotal = 0;
  for (let w of workouts) {
    for (let i of w.instances) {
      if (moment(i.date).isSame(theDay, "day")) {
        dayTotal += i.amount * w.activity.points;
      }
    }
  }
  return dayTotal * bonus;
};

const badgeRewardsTotal = (workouts, achievements, bonus) => {
  const activityAchievements = achievements
    .filter(ach => ach.activity !== null)
    .filter(
      ach => ach.requirement <= activityScore(workouts, ach.activity, bonus)
    );

  const dailyAchievements = achievements
    .filter(ach => ach.date !== null)
    .filter(ach => ach.requirement <= dayScore(workouts, ach.date, bonus));

  return activityAchievements
    .concat(dailyAchievements)
    .reduce((sum, i) => sum + i.pointsReward, 0);
};

// Returns the weekly scores, formatted for easier
// use in the leaderboard view
scoresRouter.get("/weekly", async (req, res) => {
  // is this calculation slow with 100+ participants?
  const hrStart = process.hrtime();

  const challenges = await Challenge.find({});
  const achievements = await Achievement.find({});

  if (challenges.length === 0) {
    res.status(404).end();
  }

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
      let bonus = 1;
      if (w.user.activeChallenge) {
        const challenge = challenges.find(c => {
          return c._id.toString() === w.user.activeChallenge.toString();
        });
        title = challenge.seriesTitle;
        bonus = challenge.pointBonus;
      }

      // calculate total points from achievements
      const usersWorkouts = workouts.filter(uw => uw.user.id === w.user.id);
      const pointsFromAchievements = badgeRewardsTotal(
        usersWorkouts,
        achievements,
        bonus
      );

      weeklyScores.push({
        name: abbreviate(w.user.name),
        id: w.user._id,
        location: w.user.location,
        seriesTitle: title,
        pointBonus: bonus,
        pointsFromAchievements: pointsFromAchievements,
        data: new Array(weeks).fill(0)
      });
      lastUser = w.user.id;
      userIndex += 1;
    }
    const points = w.activity.points;
    w.instances.forEach(i => {
      const weekIndex = differenceInWeeks(new Date(i.date), startDate);
      const pb = weeklyScores[userIndex].pointBonus;
      const oldValue = weeklyScores[userIndex].data[weekIndex];
      weeklyScores[userIndex].data[weekIndex] = Math.round(
        oldValue + i.amount * points * pb
      );
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

scoresRouter.get("/byactivity", async (req, res) => {
  const workouts = await Workout.find({}).populate("user", [
    "name",
    "location"
  ]);

  const result = {};
  for (let w of workouts) {
    // spread syntax only works on iterable objects
    if (result[w.activity.toString()] === undefined) {
      result[w.activity.toString()] = [];
    }

    result[w.activity.toString()] = [
      ...result[w.activity.toString()],
      {
        name: abbreviate(w.user.name),
        location: w.user.location,
        total: w.instances.reduce((sum, instance) => sum + instance.amount, 0)
      }
    ];
  }

  res.json(result);
});

module.exports = scoresRouter;
