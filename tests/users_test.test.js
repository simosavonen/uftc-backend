const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const User = require("../models/User");

const api = supertest(app);

//const password = process.argv[2];
const password = "salasana";
const initialUser = [
  {
    name: "Random Person",
    email: "random.person@ambientia.fi",
    password: password,
    location: "Hämeenlinna"
  },
  {
    name: "Paha Vastustaja",
    email: "paha.vastustaja@ambientia.fi",
    password: password,
    location: "Turku"
  }
];

test("user log in", async () => {
  const response = await api.post("/api/users/register").expect(200);

  const contents = response.body.map(r => r.content);

  //expect("Content-Type", /application\/json/);
  expect(contents).toContain("name ");
});

afterAll(() => {
  mongoose.connection.close();
});

beforeEach(async () => {
  //await User.remove({});
  if (app.get("env") === "test") {
    await User.deleteMany({});
  }
  let userObject = new User(initialUser[0]);

  await userObject.save();

  userObject = new User(initialUser[1]);
  await userObject.save();
});
