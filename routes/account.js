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

// Login-logout Handles
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

// get-update user handels
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


// verification-forgetpassword-resetpassword routers...
router.route('/resendVerificationLink') 
    .post(
        AccountController.resendVerificationLink
    );

router.route('/forgetPassword')
    .post(
        AccountController.forgetPassword
    );

router.route('/resetPassword')
    .get(
        AccountController.verifyResetPasswordLink
    )
    .post(
        AccountController.resetPassword 
    );

router.route('/verify/:email')
    .get(
        AccountController.verify
    );


// WishList...
router.route('/addToWishList')
    .post(
        AccountController.addPropToWishlist
    );

router.route('/delPropFromWishlist')
    .post(
        AccountController.delPropFromWishlist
    );

module.exports = router; 