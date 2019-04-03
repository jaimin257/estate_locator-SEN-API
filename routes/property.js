const express = require('express');
const router = express.Router();
const passportConf = require('../passport');

const PropController = require('../controllers/property');

// Get your properties
router.route('/')
    .get(
        passportConf.checkToken,
        passportConf.jwtVerifier,
        PropController.getMyProps
    );

// Get all Properties
router.route('/all')
    .get(
        PropController.getAllProps
    );

// Add new Property
router.route('/addProp')
    .post(
        passportConf.checkToken,
        passportConf.jwtVerifier,
        PropController.addProp
    );

// Remove Property
router.route('/removeProp')
    .patch(
        passportConf.checkToken,
        passportConf.jwtVerifier,
        PropController.removeProp
    );

// Update property
router.route('/updateProp')
    .patch(
        passportConf.checkToken,
        passportConf.jwtVerifier,
        PropController.updateProp
    );

// Get specific Property
router.route('/getThisProp')
    .patch(
        PropController.getThisProp
    );

module.exports = router; 