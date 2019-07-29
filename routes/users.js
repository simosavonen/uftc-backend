const config = require("../utils/config");
const usersRouter = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const passport = require("passport");
const jwt = require("jsonwebtoken");

// passport protected route(s)
// http://www.passportjs.org/docs/authenticate/
usersRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // If this function gets called, authentication was successful.
    // 'req.user' contains the authenticated user.
    const user = await User.findById(req.user.id);
    res.json(user);
  }
);

// unprotected routes
usersRouter.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, location } = req.body;

    const taken = await User.findOne({ email });
    if (taken) {
      return res
        .status(400)
        .json({ error: "You already have an account, log in instead." });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      name,
      email,
      password: passwordHash,
      location,
      activeChallenge: null
    });

    const savedUser = await user.save();
    res.json({ savedUser });
  } catch (exception) {
    next(exception);
  }
});

usersRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.password);

  if (!(user && passwordCorrect)) {
    return res.status(401).json({ error: "invalid username or password" });
  }

  const userForToken = {
    name: user.name,
    id: user._id
  };

  const token = jwt.sign(userForToken, config.SECRET);

  res
    .status(200)
    .send({ token: `Bearer ${token}`, id: user._id, name: user.name });
});

module.exports = usersRouter;
