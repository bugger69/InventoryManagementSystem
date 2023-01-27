const bCrypt = require("bcryptjs");
const shortid = require("shortid");

module.exports = (passport, user) => {
  const User = user;
  const LocalStrategy = require("passport-local");

  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true, // allows us to pass back the entire request to the callback
      },
      (req, username, password, done) => {
        let generateHash = (password) => {
          return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
        };
        User.findOne({
          where: {
            username: username,
          },
        }).then(function (user) {
          if (user) {
            return done(null, false, {
              message: "That Username is already taken",
            });
          } else {
            let userPassword = generateHash(password);
            let uid = shortid.generate();
            let data = {
              uid: uid,
              username: username,
              password: userPassword,
              user_type: req.body.user_type || 'customer',
            };
            User.create(data).then(function (newUser, created) {
              if (!newUser) {
                return done(null, false);
              }
              if (newUser) {
                return done(null, newUser);
              }
            });
          }
        }).catch(e => {
          console.log(e);
        });
      }
    )
  );

  passport.use(
    "local-signin",
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true, // allows us to pass back the entire request to the callback
      },
      function (req, username, password, done) {
        let User = user;
        let isValidPassword = function (userpass, password) {
          return bCrypt.compareSync(password, userpass);
        };
        User.findOne({
          where: {
            username: username,
          },
        })
          .then(function (user) {
            if (!user) {
              return done(null, false, {
                message: "Username does not exist",
              });
            }
            if (!isValidPassword(user.password, password)) {
              return done(null, false, {
                message: "Incorrect password.",
              });
            }
            var userinfo = user.get();
            return done(null, userinfo);
          })
          .catch(function (err) {
            console.log("Error:", err);
            return done(null, false, {
              message: "Something went wrong with your Signin",
            });
          });
      }
    )
  );
};
