const config = require("../utils/config");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const passwordsRouter = require("express").Router();
const User = require("../models/User");
const ResetRequest = require("../models/ResetRequest");

// unprotected routes
passwordsRouter.post("/", async (req, res, next) => {
  try {
    // housekeeping, delete expired ResetRequests
    // notice: this hides repeated attempts from admins
    const now = new Date().toISOString();
    await ResetRequest.deleteMany({
      expires: { $lt: now }
    });

    const { email } = req.body;
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetRequest = new ResetRequest({
        email,
        token: resetToken,
        expires: Date.now() + 3600000
      });
      await resetRequest.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.EMAIL_ADDRESS,
          pass: config.EMAIL_PASSWORD
        }
      });

      // todo: fix the localhost to work in production or when testing with mobile
      const mailOptions = {
        from: config.EMAIL_ADDRESS,
        to: email,
        subject: "Password reset link for UFTC",
        text:
          "You were sent this because a password reset request was made for this email.\n" +
          "The following link can be used within the next hour to reset your password:\n\n" +
          `http://localhost:3000/passwordreset/${resetToken}\n\n` +
          "If you did not request a password reset, please ignore this email and your password will remain unchanged.\n\n"
      };

      transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          console.error("error while sending email", err);
        } else {
          res.status(200).json("password reset email sent");
        }
      });
    } else {
      console.error("tried to reset password of an unknown email");
      res.status(403).send("unknown email");
    }
  } catch (exception) {
    next(exception);
  }
});

passwordsRouter.post("/verify", async (req, res, next) => {
  try {
    const { token } = req.body;

    const isVerified = await ResetRequest.findOne({ token });

    if (isVerified && isVerified.expires.getTime() > Date.now()) {
      res.status(200).json(isVerified);
    } else {
      console.error("token was expired or not found");
      res.status(403).send("token expired or not found");
    }
  } catch (exception) {
    next(exception);
  }
});

passwordsRouter.post("/reset", async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const isVerified = await ResetRequest.findOne({ token });

    if (isVerified && isVerified.expires.getTime() > Date.now()) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const user = await User.findOne({ email: isVerified.email });
      await User.findByIdAndUpdate(user.id, { password: passwordHash });
      res.status(200).send("Password update OK");
    } else {
      console.error("token was expired or not found");
      res.status(403).send("token expired or not found");
    }
  } catch (exception) {
    next(exception);
  }
});

module.exports = passwordsRouter;
