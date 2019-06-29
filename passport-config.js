const passportJWT = require("passport-jwt");
const Strategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const mongoose = require("mongoose");
const User = require("./models/user");

require("dotenv").config();

const secret = process.env.SECRET || "some other secret as default";

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secret
};

module.exports = passport => {
  passport.use(
    new Strategy(opts, (payload, done) => {
      User.findById(payload.id)
        .then(user => {
          if (user) {
            return done(null, {
              id: user.id,
              name: user.name,
              email: user.email
            });
          }
          return done(null, false);
        })
        .catch(err => console.error(err));
    })
  );
};
