const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
const bcrypt = require("bcryptjs");
const moment = require("moment");

if (process.argv.length < 4) {
  console.log("give 2 arguments: how many users and activities to generate?");
  console.log("for example: node seed.js 10 10");
  process.exit(1);
}

const numUsers = +process.argv[2];
const numActivities = +process.argv[3];

const User = require("./models/User");
const Challenge = require("./models/Challenge");
const Activity = require("./models/Activity");
const Workout = require("./models/Workout");

const url = "mongodb://localhost:27017/uftc?retryWrites=true&w=majority";

const locations = [
  "Hämeenlinna",
  "Helsinki",
  "Joensuu",
  "Tampere",
  "Turku",
  "Tallinn",
  "Tartu"
];
let locationIdx = 0;
function getLocation() {
  if (locationIdx === locations.length - 1) {
    locationIdx = -1;
  }
  locationIdx++;
  return locations[locationIdx];
}

let challengeIdx = 0;
function getChallenge(length) {
  if (challengeIdx === length - 1) {
    challengeIdx = 0;
    return challengeIdx;
  }
  challengeIdx++;
  return challengeIdx;
}

let challenges = [];
let duration = 0;
let start = "";
let end = "";

async function fetchChallenges() {
  challenges = await Challenge.find({});
  start = moment(challenges[0].startDate);
  end = moment(challenges[0].endDate);
  duration = end.diff(start, "days");

  console.log("fetching challenges, found", challenges.length);
}

async function generateActivities() {
  console.log(`generating ${numActivities} activitites...`);

  await Activity.deleteMany({});
  for (let i = 1; i <= numActivities; i++) {
    const activity = new Activity({
      name: `Activity ${i}`,
      points: i,
      type: i % 2 === 0 ? "During workday" : "Free time",
      unit: "1 workout",
      description: "Generated activity",
      url: "",
      icon: "icon.svg"
    });
    await activity.save();
  }
}

async function generateUsers() {
  console.log(`generating ${numUsers} users...`);

  await User.deleteMany({ email: { $ne: "random.person@ambientia.fi" } });
  for (let i = 1; i <= numUsers; i++) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash("salasana", saltRounds);

    const user = new User({
      name: `user${i}`,
      email: `user${i}@fake.com`,
      password: passwordHash,
      location: getLocation(),
      activeChallenge: challenges[getChallenge(challenges.length)].id
    });
    await user.save();
  }
}

async function generateWorkouts() {
  console.log(
    `generating workouts for ${duration} days for every activity, for each user...`
  );

  await Workout.deleteMany({});
  const users = await User.find({
    email: { $ne: "random.person@ambientia.fi" }
  });
  const activities = await Activity.find({});

  for (let user of users) {
    for (let activity of activities) {
      const instances = [];
      for (let i = 0; i < duration; i++) {
        const dayOne = moment(start);
        instances.push({
          date: dayOne.add(i, "days").format("YYYY-MM-DD"),
          amount: Math.floor(Math.random() * 10 + 1)
        });
      }
      const workout = new Workout({
        instances,
        activity: activity.id,
        user: user.id
      });
      await workout.save();
    }
  }
}

async function generateAll() {
  mongoose.connect(url, { useNewUrlParser: true });
  await fetchChallenges();
  await generateActivities();
  await generateUsers();
  await generateWorkouts();
  mongoose.connection.close();
}

generateAll();
