if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

let PORT = process.env.PORT || 3001;
let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/uftc";
const SECRET = process.env.SECRET || "the_default_secret_string";

if (process.env.NODE_ENV === "test") {
  PORT = process.env.TEST_PORT;
  MONGODB_URI = process.env.TEST_MONGODB_URI;
}

module.exports = {
  MONGODB_URI,
  PORT,
  SECRET
};
