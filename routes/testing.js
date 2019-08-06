const testRouter = require("express").Router();
const User = require("../models/User");
const Challenge = require("../models/Challenge");
const bcrypt = require("bcryptjs");

testRouter.get("/reset", async (request, response) => {
  await User.deleteMany({});
  //make c onst challenge table
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

  const testsavedUser = await testuser.save();
  //console.log(testsavedUser);
  //console.log("id", testsavedUser._id);
  if (testsavedUser) {
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
      organizers: [testsavedUser._id]
      //organizers: [testuser.user._id]
      //activities: activityIDs
    });
    await testchallenge.save();
  }
  //const testcreatedChallenge = await testchallenge.save();
  //    res.status(201).json(testcreatedChallenge.toJSON());

  response.status(204).end();
});

module.exports = testRouter;
