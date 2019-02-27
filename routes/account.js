const express = require('express');
const router = express.Router();
const passport = require('passport');


const AccountController = require('../controllers/account');

// Login Page
router.get('/logIn',(req,res) => res.send('Login'));

// Register Page
router.get('/register', (req,res) => res.send('Register'));

// Register Handle
router.route('/register')
    .post(
        AccountController.register
    );

// Login Handle
router.post('/logIn', (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/account/logIn'
    })(req,res,next);
});

// Verify
router.route('/verify/:email')
    .get(
        AccountController.verify
);

module.exports = router; 