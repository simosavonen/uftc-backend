<div align="center">
<a href="" rel="noopener"><img width=200px height=200px src="./plank_over_red_circle.png" alt="UFTC project logo"></a>
</div>

<div align="center"><h3>Ultimate Functional Training Challenge</h3></div>

<div align="center">
 <a href="https://github.com/simosavonen/uftc-backend/issues" rel="noopener">
 <img alt="GitHub issues" src="https://img.shields.io/github/issues/simosavonen/uftc-backend"></a>
 <a href="https://github.com/simosavonen/uftc-backend/blob/master/LICENSE" rel="noopener">
 <img alt="GitHub" src="https://img.shields.io/github/license/simosavonen/uftc-backend"></a>
 <a href="https://github.com/simosavonen/uftc-backend/graphs/contributors" rel="noopener"><img alt="GitHub contributors" src="https://img.shields.io/github/contributors/simosavonen/uftc-backend"></a>
 <a href="https://github.com/simosavonen/uftc-backend/commits/master" rel="noopener"><img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/simosavonen/uftc-backend"></a>
</div>

---

<p>
 A single-page applipation for a team to track their progress in the Ultimate Functional Training Challenge, a fun exercise competition designed to promote an active lifestyle and get software engineers up from their desks during the work day.
 </p>

<p>
Participants record their exercises and gain points, trying to reach a set goal. Upon gaining enough points on a single activity, or during a special one-day-challenge, participants are rewarded with badges.
</p>

## 🧐 About <a name = "about"></a>

<p>
This was a capstone project for a University of Turku <a href="https://tech.utu.fi/fi/full-stack/" rel="noopener">Full Stack bootcamp</a>, which took place between March and August of 2019. A <a href="https://github.com/simosavonen/uftc-frontend/graphs/contributors" rel="noopener">team of five</a> was given two months and free hands to design and build it. Original concept and support was provided by <a href="https://www.ambientia.fi/">Ambientia</a>.
</p>

## 🏁 Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system.

### Prerequisites

Make sure you have a recent version of <a href="https://nodejs.org/en/" rel="noopener">Node.js</a> installed.

This backend server should be started on the same host as the <a href="https://github.com/simosavonen/uftc-frontend" rel="noopener">React frontend</a>.

### Installing

Clone the repository.

```
git clone https://github.com/simosavonen/uftc-backend.git
cd uftc-backend
```

Install Node.js modules.

```
npm install
```

### Important environment variables

Create a file '.env' at the root, in the same folder as index.js or app.js.
Copy the following lines and edit the values to work with your setup.

Define the ports for express server, port 3000 is taken by the React frontend.

```
PORT=3001
TEST_PORT=3001
```

For password reset emails, the backend needs to know what the host URL is.

```
SITE_URL=http://localhost:3000
PROD_SITE_URL=https://yourdomain.com
```

We used <a href="https://www.mongodb.com/cloud/atlas" rel="noopener">MongoDB Atlas</a> as our development and testing database.
For deployment, MongoDB was installed on the Ubuntu server.

```
MONGODB_URI=mongodb+srv://username:password@server/uftc?retryWrites=true&w=majority
TEST_MONGODB_URI=mongodb+srv://username:password@server/uftctest?retryWrites=true&w=majority
PROD_MONGODB_URI=mongodb://username:password@localhost/uftc?retryWrites=true&w=majority
```

Define the secret phrase used to encrypt the JSON Web Tokens.

```
SECRET=youbetterchangethistoalongrandomtext
```

To create an account on the React frontend, users enter the site using a provided link containing this secret phrase.

```
SECRET_FOR_REGISTERING=keepthisurlsafe
```

Password reset emails are sent using <a href="https://nodemailer.com/about/" rel="noopener">Nodemailer</a> and a gmail account.
To get this to work, needed to loosen the security settings in gmail.

```
EMAIL_ADDRESS=email.address@gmail.com
EMAIL_PASSWORD=password
```

## 🎈 Usage <a name="usage"></a>

Start the backend with nodemon, any changes to the files will restart the server.

```
npm run watch
```

## 🚀 Deployment <a name = "deployment"></a>

We chose to deploy this on an AWS EC2 Ubuntu server. After gaining SSH access to it, install a webserver, Node.js and MongoDB.

```
sudo apt update
sudo apt upgrade
sudo apt install nginx npm nodejs mongodb
```

NGINX was used to serve the React frontend files, and the backend was started and kept running on host restarts by <a href="http://pm2.keymetrics.io/" rel="nopopener">PM2</a>.

Deploying the backend involved copying the files over to the user 'ubunbu' home folder, installing the Node.js modules and starting the Express server with PM2.

```
npm install
sudo npm install -g pm2
pm2 start npm -- start
```

Setting up NGINX and securing the MongoDB are beyond the scope of this readme.

## ⛏️ Built Using <a name = "built_using"></a>

- [Express](https://expressjs.com/) - Web Framework for Node.js
- [Passport](http://www.passportjs.org/) - Authentication for Node.js
- [Nodemailer](https://nodemailer.com/about/) - Send emails from Node.js
- [Mongoose](https://mongoosejs.com/) - MongoDB object modeling for Node.js
- [MongoDB](https://www.mongodb.com/) - Database

## ✍️ Authors <a name = "authors"></a>

- [@shonkala](https://github.com/shonkala) - endpoint for achievements
- [@MMattila75](https://github.com/MMattila75) - endpoint for resetting the DB for Cypress tests
- [@simosavonen](https://github.com/simosavonen) - the rest

## 🎉 Acknowledgements <a name = "acknowledgement"></a>

- [FullStackOpen](https://fullstackopen.com/) - Helsinki University's free course material
- [Ambientia](https://www.ambientia.fi/) - Original concept, support and guidance
- [Jarko Papalitsas](https://www.utu.fi/fi/ihmiset/jarko-papalitsas) - Tutorial on deploying to AWS EC2

## API endpoints

**\$** = protected by <a href="http://www.passportjs.org/" rel="noopener">Passport.js</a>, and requires an Authorization header with a valid JSON Web Token

##### Users

- POST /api/users/register (checks for the secret phrase)
- POST /api/users/login
- \$ PUT /api/users/:id (can only update your own info)
- \$ GET /api/users/me
- \$ GET /api/users/ (retuns a list of abbreviated names)

##### Challenges

- GET /api/challenges
- \$ POST /api/challenges (if the database was empty, you are set as the organizer)
- \$ PUT /api/challenges/:id (limited to organizers)
- \$ DELETE /api/challenges:id (organizers, cannot delete the last object)

##### Activities

- GET /api/activities
- \$ POST /api/activities (organizers)
- \$ PUT /api/activities (organizers)

##### Workouts

- \$ GET /api/workouts (returns your workouts)
- \$ GET /api/workouts/:userid
- \$ POST /api/workouts/:activityid
- \$ PUT /api/workouts/:id (can only update your own workouts)
- \$ DELETE /api/workouts/:id
- \$ DELETE /api/workouts/:workout/:instance (deletes a date from instances array)

##### Achievements

- GET /api/achievements
- GET /api/achievements/daily (one-day-challenges for today)
- GET /api/achievements/daily/:date
- GET /api/achievements/activity/:id
- \$ POST /api/achievements (organizers)
- \$ PUT /api/achievements/:id (organizers)
- \$ DELETE /api/achievements/:id (organizers)

##### Scores

- GET /api/scores/weekly (returns a formatted result for use in Apex Chart diagram)

##### Forgotten password reminders

- POST /api/passwords (sends the reminder email)
- POST /api/passwords/verify (checks the token is still valid)
- POST /api/passwords/reset
