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
  const response = await api
    .post("/api/users/login")
    .send(initialUser[0])
    .expect(200);

  //expect("Content-Type", /application\/json/);

  // login ei palauta taulukkoa, vaan yhden olion
  expect(response.body.name).toContain("Random Person");
  expect(response.body.token).toContain("Bearer");
});

afterAll(() => {
  mongoose.connection.close();
});

beforeEach(async () => {
  //await User.remove({});

  // tämä oli mulle uutta, että voi kysyä app.get("env")
  if (app.get("env") === "test") {
    await User.deleteMany({});
  }

  // älä itse tallenna olioita kantaan, vaan käytä jo olemassa olevia endpointeja
  // register bcryptaa salasanan, ja näin loginkin toimii ja testi menee läpi
  await api.post("/api/users/register").send(initialUser[0]);
  await api.post("/api/users/register").send(initialUser[1]);
});
