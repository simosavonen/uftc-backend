require("dotenv").config();

let SITE_URL = process.env.SITE_URL;

let PORT = process.env.PORT || 3001;
let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/uftc";
const SECRET = process.env.SECRET || "the_default_secret_string";
const SECRET_FOR_REGISTERING = process.env.SECRET_FOR_REGISTERING;

const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

if (process.env.NODE_ENV === "test") {
  MONGODB_URI = process.env.TEST_MONGODB_URI;
}

if (process.env.NODE_ENV === "production") {
  MONGODB_URI = process.env.PROD_MONGODB_URI;
  SITE_URL = process.env.PROD_SITE_URL;
}

module.exports = {
  SITE_URL,
  MONGODB_URI,
  PORT,
  SECRET,
  SECRET_FOR_REGISTERING,
  EMAIL_ADDRESS,
  EMAIL_PASSWORD
};
