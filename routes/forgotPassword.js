const config = require("../utils/config");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const forgotPasswordRouter = require("express").Router();
const User = require("../models/User");
const ResetRequest = require("../models/ResetRequest");

// unprotected routes
forgotPasswordRouter.post("/", async (req, res, next) => {
  try {
    const { email } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetRequest = new ResetRequest({
        token: resetToken,
        expires: Date.now() + 36000
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
          "You were sent this because a password reset request was made for this email.\n\n" +
          "The following link can be used within the next hour to reset your password:\n\n" +
          `http://localhost:3000/passwordreset/${resetToken}\n\n` +
          "If you did not request this, please ignore this email and your password will remain unchanged.\n\n"
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

module.exports = forgotPasswordRouter;
