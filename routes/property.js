const express = require('express');
const router = express.Router();
const passport = require('passport');

const PropController = require('../controllers/property');

// Get your properties
router.route('/')
    .get(
        PropController.myProps
    );

// Get all Properties
router.route('/all')
    .get(
        PropController.getAllProps
    );

// Get specific Property
router.route('/:propId')
    .get(
        PropController.getProp
    );

// Add new Property
router.route('/addProp')
    .post(
        PropController.addProp
    );

// Remove Property
router.route('/removeProp/:propId')
    .patch(
        PropController.removeProp
    );

// Update property
router.route('/updateProp/:propId')
    .patch(
        PropController.updateProp
    );