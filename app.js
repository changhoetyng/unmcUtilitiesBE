require("dotenv").config();
const express = require("express");
const app = express();
const routeIndex = require("./src/router/index");
const mongoose = require("mongoose");

const APP_PORT = process.env.APP_PORT || 3000;

app.use(express.json());
app.use("/api/", routeIndex);

//connect db
mongoose.connect(
  process.env.DB_CONNECTION,
  { useNewUrlParser: true, useUnifiedTopology: true ,useCreateIndex: true},
  () => console.log("db connected")
);

app.listen(APP_PORT, () => {
  console.log(`Server started on port ${APP_PORT}`);
});
