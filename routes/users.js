const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
var jwt = require('jsonwebtoken');
const config = require('../config/database');

// Register
router.post('/register', (req, res, next) => {
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        type: req.body.type
    });

    User.addUser(newUser, (err, user) => {
        if (err) {
            res.json({ success: false, msg: 'Failed to register user' });
        }
        else {
            res.json({ success: true, msg: 'User registered' });
        }
    });
    // res.send("REGISTER");
});

// Authenticate
router.post('/authenticate', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    const type = req.body.type;

    User.getUsersByType(type, (err, users) => {
        if (err) throw err;
        if (!users) {
            return res.json({ success: false, msg: 'User not found' });
        }
        users.forEach(function(user){

        User.getUserByUsername(user.username, (err, user) => {
            if (err) throw err;
            if (!user) {
                return res.json({ success: false, msg: 'User not found' });
            }
            User.comparePassword(password, user.password, (err, isMatch) => {
                //console.log(user.password);
                //console.log(user.username);
                if (err) throw err;
                if (isMatch) {
                    const token = jwt.sign({ _id: user._id.toHexString() }, config.secret, { expiresIn: 604000 }).toString();

                    res.json({
                        success: true,

                        token: 'JWT ' + token,
                        user: {
                            id: user._id,
                            name: user.name,
                            username: user.username,
                            email: user.email,
                            type: user.type
                        }
                    });
                } else {
                    return res.json({ success: false, msg: "Wrong Password" });
                }
            });
        });
    });
    });
    // res.send("AUTHENTICATE");
});

// Profile
router.get('/profile', passport.authenticate('jwt', { session: false }), function (req, res) {
    return res.json({ user: req.user });
});

// // Register
// router.get('/validate',(req,res,next)=>{
//     res.send("VALIDATE");
// });

module.exports = router;