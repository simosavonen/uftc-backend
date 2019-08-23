const testRouter = require("express").Router();
const User = require("../models/User");

testRouter.get("/reset", async (request, response) => {
  await User.deleteMany({});

  response.status(204).end();
});

module.exports = testRouter;
