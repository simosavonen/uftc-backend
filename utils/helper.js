const Challenge = require("../models/Challenge");

const isOrganizer = async userId => {
  const challenge = await Challenge.findOne({});
  if (challenge) {
    return challenge.organizers.includes(userId.toString());
  }
  return false;
};

module.exports = {
  isOrganizer
};
