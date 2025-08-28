const express = require("express");
const session = require("express-session");
const passport = require("passport");
const User = require("../models/user.model");
const authRouter = require("../routes/auth.routes");
const secretRouter = require("../routes/secrets.routes");
const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs");

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});


app.use("/", authRouter);
app.use("/", secretRouter)

module.exports = app;
