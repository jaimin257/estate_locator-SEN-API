const express = require('express');
const router = express.Router();
const passport = require('passport');
const passportConf = require('../passport');


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

// Registeration step2
router.route('/register/step2')
    .post(
        passport.authenticate('local', {
            failureRedirect: '/account/register/step2'
        }),
        AccountController.registerStep2
    );


// Login Handle
// router.post('/logIn', (req, res, next) => {

//     passport.authenticate('local', {
//         successRedirect: '/dashboard',
//         failureRedirect: '/account/logIn'
//     })(req,res,next);
// });

// Login Handle
router.route('/logIn')
    .post(
        passport.authenticate('local', { session: false }),
        AccountController.logIn
);

// LogOut Handle
router.route('/logOut')
    .get(
        passport.authenticate('jwt', { session: false }),
        AccountController.logOut
);

// Verify
router.route('/verify/:email')
    .get(
        AccountController.verify
);


module.exports = router; 