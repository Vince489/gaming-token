require("./config/db");
require("dotenv").config();

const express = require("express");
const routes = require("./routes");


const cors = require("cors");
const app = express();

const corsOptions = {
  origin: ["http://localhost:3000", "https://zprompter.com", "https://gaming-token-production.up.railway.app/"],
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use("/api/v1", routes);

module.exports = app;