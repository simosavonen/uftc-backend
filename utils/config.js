if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

let PORT = process.env.PORT;
let MONGODB_URI = process.env.MONGODB_URI;
const SECRET = process.env.SECRET;

if (process.env.NODE_ENV === "test") {
  PORT = process.env.TEST_PORT;
  MONGODB_URI = process.env.TEST_MONGODB_URI;
}

module.exports = {
  MONGODB_URI,
  PORT,
  SECRET
};
