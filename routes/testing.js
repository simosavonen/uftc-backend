const testRouter = require("express").Router();
const User = require("../models/User");
const Challenge = require("../models/Challenge");
const Activity = require("../models/Activity");
const bcrypt = require("bcryptjs");

testRouter.get("/reset", async (request, response) => {
  await User.deleteMany({}); //delete Users
  await Challenge.deleteMany({}); //delete challenges
  await Activity.deleteMany({}); //delete activities

  const password = "salasana";
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const testuser = new User({
    name: "Random Person",
    email: "random.person@ambientia.fi",
    password: passwordHash,
    location: "Hämeenlinna",
    activeChallenge: null
  });

  const testchallenge = new Challenge({
    name: "Syksy 19 megahaaste",
    pointsGoal: 7500,
    releaseDate: "2019-07-01",
    startDate: "2019-08-01",
    endDate: "2019-11-30",
    deadline: "2019-12-14",
    seriesTitle: "Kaikki pelaa!",
    //description: req.body.description,
    //icon: req.body.icon,
    pointBonus: 1,
    //organizers: [testsavedUser._id]
    organizers: [testuser._id]
    //organizers: [testuser.user._id]
    //activities: activityIDs
  });
  testuser.activeChallenge = testchallenge._id;

  const activityTestFst = new Activity({
    name: "Pushup - punnerus",
    points: 4,
    type: "Lihaskuntoharjoitus",
    unit: "10 pushups",
    description: "Punnerra jalat suorana",
    url: "",
    icon: "icon.svg"
  });

  const activityTestSnd = new Activity({
    name: "Kahvakuulanosto",
    points: 3,
    type: "Lihaskuntoharjoitus",
    unit: "5 nostoa",
    description: "Nosta kahvakuulaa maan tasolta hartioiden yläpuolelle",
    url: "http://fake.you.tube/123",
    icon: "icon.svg"
  });

  const testsavedUser = await testuser.save();
  console.log(testsavedUser);
  const testChallenge = await testchallenge.save();
  console.log(testChallenge);
  const createdActivityFst = await activityTestFst.save();
  const createdActivitySnd = await activityTestSnd.save();
  console.log(createdActivityFst);
  console.log(createdActivitySnd);
  response.status(204).end();
});

module.exports = testRouter;
