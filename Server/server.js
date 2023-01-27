if(process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");

const app = express();
const session = require("express-session");
const passport = require("passport");
const models = require("./models");

const MySQLStore = require("express-mysql-session")(session);

const routes = require("./routes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const secret = process.env.SECRET_KEY || "Thisisaverybadkey";

const options = {
  host: "localhost",
  port: 3306,
  user: "Flak",
  password: "BadLuck",
  database: "session",
};

const store = new MySQLStore(options);

const sessionConfig = {
  store,
  name: "notasession",
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport/Passport.js')(passport, models.user);

//Sync Database
models.sequelize.sync().then(function() {
    console.log('Nice! Database looks fine');
}).catch(function(err) {
    console.log(err, "Something went wrong with the Database Update!");
});

// passport.use(new LocalStrategy((username, password, done) => {})); //work needed here

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use("/inventoryManagement", routes);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
