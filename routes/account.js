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
    .post(
        AccountController.getUser,
);

router.route('/getAllProps')
    .post(
        AccountController.getAllProps
);

router.route('/updateUser')
    .post(
        AccountController.updateUser
);

// Verify
router.route('/verify/:email')
    .get(
        AccountController.verify
);

router.route('/addToWishList')
    .post(
        AccountController.addPropToWishlist
);

module.exports = router; 