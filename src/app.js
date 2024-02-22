require("./config/db");
require("dotenv").config();

const express = require("express");
const routes = require("./routes");


const cors = require("cors");
const app = express();

const corsOptions = {
  origin: ["http://localhost:3000", "https://zprompter.com", "virtron-beta.netlify.app"],
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use("/api/v1", routes);

// Custom middleware to handle session data
app.use((req, res, next) => {
  // Check if session exists
  if (req.session && req.session.user) {
    // User is logged in, you can access session data like req.session.user
    console.log('User is logged in:', req.session.user);
  } else {
    // User is not logged in
    console.log('User is not logged in');
  }
  next(); // Call next to continue processing the request
});

module.exports = app;
