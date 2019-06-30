const config = require("../utils/config");
const usersRouter = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");

const passport = require("passport");
const jwt = require("jsonwebtoken");

// passport protected route(s)
usersRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = await User.findById(req.body.id);
    if (user) {
      res.json(user);
    }
  }
);

// unprotected routes
usersRouter.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

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
      password: passwordHash
    });

    const savedUser = await user.save();
    res.json(savedUser);
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
