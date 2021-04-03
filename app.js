require("dotenv").config();
const express = require("express");
const app = express();
const routeIndex = require("./src/router/index");
const mongoose = require("mongoose");
const {checkAdmin} = require("./src/defaultCheck/checkAdmin")
var cors = require('cors')

const APP_PORT = process.env.APP_PORT || 3000;

app.use(cors())

app.use(express.json());
// Check if root admin user exists.

app.use("/api/", routeIndex);

console.log(process.env.NODE_ENV)

const test = process.env.NODE_ENV

let dbLink = process.env.DB_CONNECTION

if (test === "test"){
  dbLink = process.env.DB_CONNECTION_TEST
}

//connect db
mongoose.connect(
  dbLink,
  { useNewUrlParser: true, useUnifiedTopology: true ,useCreateIndex: true,useFindAndModify: true},
  () => console.log("db connected")
);

app.listen(APP_PORT, () => {
  console.log(`Server started on port ${APP_PORT}`);
});

checkAdmin();

module.exports = app