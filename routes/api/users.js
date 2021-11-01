const express = require("express");

const router = express.Router();
const User = require("../../modules/Users");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs"); // hash password
const jwt = require("jsonwebtoken");
const passport = require("passport");
const key = "secret";

//Load input validation
const validatorRegisterInput = require("../../validation/register");
const validatorLoginInput = require("../../validation/login");


//@route Get api/users/test
//@desc Tests users route
//@access public

router.get("/test", (req, res) => {
  res.json({ msg: "this is users page" });
});

//@route post api/users/register
//@desc register users route
//@access public

router.post("/register", (req, res) => {
  console.log("register called")
  const { errors, isValid } = validatorRegisterInput(req.body);

  // check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  try {
    User.findOne({ email: req.body.email }).then((user) => {
      if (user) {
        errors.email = "Email Already Exist";
        return res.status(404).json(errors);
      } else {
        const avatar = gravatar.url(req.body.email, {
          s: "200", //size
          r: "pg",
          d: "mm",
        });
  
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar,
          password: req.body.password,
        });
        // hashpassword
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
              throw err
            } else {
              newUser.password = hash;
              newUser.save().then((user) => {
                res.json(user);
              });
              
            }
          });
        });
      }
    });

  } catch (ex) {
    console.log("error", ex)
  }

  
});

//@route post api/users/login
//@desc login user / returning jwt token
//@access public

router.post("/login", (req, res) => {
  const { errors, isValid } = validatorLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;

  //find users
  User.findOne({ email }).then((user) => {
    if (!user) {
      errors.email = 'User Not Found'
      return res.status(404).json(errors);
    }
    // Match password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        //user matched
        const payLoad = { id: user.id, name: user.name, avatar: user.avatar }; // create jwt payload
        //sign token
        jwt.sign(payLoad, key, { expiresIn: 3600 }, (err, token) => {
          res.json({
            success: true,
            token: "Bearer " + token,
          });
        });
      } else {
        errors.password = 'Password Incorrect'
        res.status(400).json(errors);
      }
    });
  });
});

//@route post api/users/current
//@desc return current user
//@access private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json(req.user);
  }
);

module.exports = router;
