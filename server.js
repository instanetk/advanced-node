"use strict";
require("dotenv").config();
const express = require("express");
const myDB = require("./connection");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const session = require("express-session");
const passport = require("passport");
const routes = require("./routes.js");
const auth = require("./auth.js");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

myDB(async (client) => {
  const myDataBase = await client.db("advanced").collection("node");

  let currentUsers = 0;
  ++currentUsers;

  io.on("connection", (socket) => {
    console.log("A user has connected");
    io.emit("user count", currentUsers);
  });

  socket.on("user count", function (data) {
    console.log(data);
  });

  routes(app, myDataBase);
  auth(app, myDataBase);
  // Be sure to change the title

  app.use((req, res, next) => {
    res.status(404).type("text").send("Not Found");
  });

  // Be sure to add this...
}).catch((e) => {
  app.route("/").get((req, res) => {
    res.render("pug", { title: e, message: "Unable to login" });
  }); //DB ends
});

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "pug");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

http.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});
