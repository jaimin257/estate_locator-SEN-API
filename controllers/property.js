const httpStatusCodes = require('http-status-codes');
const errorMessages = require('../configuration/error');
const Prop = require('../models/property');


module.exports = {
    getMyProps: async (req, res, next) => {
        const { user } = req.body;

        console.log('getMyProps');

        const foundProps = await Prop.find({ seller: user })
            .then(function (props) {
                res.status(httpStatusCodes.OK)
                    .send(props);
            })
            .catch(err => {
                res.status(httpStatusCodes.FORBIDDEN)
                    .send(errorMessages.problemFatchingProps);  
            });
    },

    getThisProp: async (req, res, next) => {
        //const { user } = req;
        const { propId } = req.body;

        console.log('getThisProp : '+propId);

        const foundProp = await Prop.findById(propId);

        if(!foundProp) {
            res.status(httpStatusCodes.FORBIDDEN)
                .send(errorMessages.propNotFound);  
        } else {
            res.status(httpStatusCodes.OK)
                .json({ prop: foundProp });
        }
    },

    getAllProps: async (req, res, next) => {
//        const { user } = req;

        console.log('getAllProps...');

        await Prop.find({})
            .then(function (props) {
                res.status(httpStatusCodes.OK)
                    .send(props);
            })
            .catch(err => {
                res.status(httpStatusCodes.FORBIDDEN)
                    .send(errorMessages.problemFatchingProps);  
            });
    },

    addProp: async (req, res, next) => {
        const {propertyName, propertyLocation, constructionStatus, bookingStatus, seller, property_type, property_amount, contract_type, floor, carpet_area, state, city, description} = req.body;

        console.log('addProp...');

        // Check required Fields
        if(!propertyName || !propertyLocation || !constructionStatus || !bookingStatus || !seller || !property_type || !property_amount || !contract_type || !floor || !carpet_area || !state || !city || !description) {
            res.status(httpStatusCodes.PRECONDITION_FAILED)
                .send(errorMessages.requiredFieldsEmpty);            
        } else {
            // Extra verifications...
            // Nothing for now...
            // May be used to check weather seller is verified.. or upgraded account or not.. or seller profile detail is filled properly or not... 
        }
        
        console.log('property details are ok.');

        const createdOn = new Date();
        const lastModified = new Date();

        const newProp = new Prop({
            propertyName,
            propertyLocation,
            constructionStatus, 
            bookingStatus, 
            seller, 
            property_type, 
            property_amount, 
            contract_type, 
            floor, 
            carpet_area, 
            //address,
            state,
            city,
            description,
            createdOn,
            lastModified,
        });

        // Adding property
        const addedProp = await newProp.save()
            .then(savedProp => {
                console.log('Property added'); 
                res.status(httpStatusCodes.CREATED)
                    .json({ prop: savedProp });
            })
            .catch(err => {
                console.log(err);
                res.status(httpStatusCodes.FORBIDDEN)
                    .send(err);
            });
    },
    removeProp: async (req, res, next) => {
        const {user, propId} = req.body;
//        const {propId} = req.params.propId;

        console.log('removeProp : '+propId);

        // May need to perform some verifications such as user, etc..

        // Deleting property from database...
        await Prop.findByIdAndRemove(propId,
            function(err, docs){
                if(err) {
                    res.status(httpStatusCodes.FORBIDDEN)
                        .send(err);
                } else {
                    console.log('Property deleted succesfully...');
                    res.redirect('/property');
                }
        });
    },
    updateProp: async (req, res, next) => {
        const {userId, propId} = req;
        const propUpdateAttr = req.value.body;

        console.log('updateProp : '+propId);

        propUpdateAttr.lastModified = new Date();
        
        const updatedProp = await Prop.findByIdAndUpdate(propId, propUpdateAttr, {new : true});
        
        console.log('Property updated succesfully..');
        
        res.status(httpStatusCodes.OK)
            .json({ prop: updatedProp});
    }
};