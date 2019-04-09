const express = require('express');
const router = express.Router();
const passport = require('passport');
const passportConf = require('../passport');

const AccountController = require('../controllers/account');

// Register Handle
router.route('/register')
    .post(
        AccountController.register
    );

// Registeration step2
// router.route('/register/step2')
//     .post(
//         passport.authenticate('local', {
//             failureRedirect: '/account/register/step2'
//         }),
//         AccountController.registerStep2
//     );

// Login Handle
router.route('/logIn')
    .post(
        passport.authenticate('local', { session: false }),
        AccountController.logIn
);

router.route('/logOut')
    .get(
        passportConf.checkToken,
        passportConf.jwtVerifier,
        AccountController.logOut
);

router.route('/getUser')
    .get(
        AccountController.getUser,
);

router.route('/getAllProps')
    .get(
        AccountController.getAllProps
);

// Verify
router.route('/verify/:email')
    .get(
        AccountController.verify
);

module.exports = router; 