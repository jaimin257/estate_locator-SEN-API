const express = require('express');
const router = express.Router();
const passportConf = require('../passport');

const PropController = require('../controllers/property');

// Get your properties
router.route('/getMyProps')
    .post(
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
    .delete(
        passportConf.checkToken,
        passportConf.jwtVerifier,
        PropController.removeProp
    );

// Update property
router.route('/updateProp')
    .post(
        passportConf.checkToken,
        passportConf.jwtVerifier,
        PropController.updateProp
    );

// Get specific Property
router.route('/getThisProp')
    .get(
        PropController.getThisProp
    );
router.route('/searchProp')
    .post(
        PropController.searchProp
    );

router.route('/addfile')
    .post(
        PropController.addfile
    );

router.route('/searchSuggestion')
    .post(
        PropController.searchSuggestion
    );

module.exports = router; 