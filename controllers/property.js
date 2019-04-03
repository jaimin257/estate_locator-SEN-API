const httpStatusCodes = require('http-status-codes');
const errorMessages = require('../configuration/error');
const Prop = require('../models/property');


module.exports = {
    getMyProps: async (req, res, next) => {
        const { user } = req.body;

        console.log('getMyProps : ::');

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
        const {propId} = req.body;
      //  const {propId} = req.params;

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
                    res.status(httpStatusCodes.OK)
                        .send('property deleted succesfully');
                }
        });
    },
    updateProp: async (req, res, next) => {
        //const {propId} = req;
       // const {propId,propertyLocation,propertyName} = req.body;
        var {propId, propertyName, propertyLocation, constructionStatus, bookingStatus, seller, property_type, property_amount, contract_type, floor, carpet_area, state, city, description} = req.body;

        const foundProp = await Prop.findById(propId)
            .then()
            .catch(err => {
                console.log('etrrererere');
            });

        if(!propertyName)           propertyName = foundProp.propertyName;
        if(!propertyLocation)       propertyLocation = foundProp.propertyLocation;
        if(!constructionStatus)     constructionStatus = foundProp.constructionStatus;
        if(!bookingStatus)          bookingStatus = foundProp.bookingStatus;
        if(!seller)                 seller =  foundProp.seller;
        if(!property_type)          property_type = foundProp.property_type;
        if(!property_amount)        property_amount = foundProp.property_amount;
        if(!contract_type)          contract_type = foundProp.contract_type;
        if(!floor)                  floor = foundProp.floor;
        if(!carpet_area)            carpet_area = foundProp.carpet_area;
        if(!state)                  state = foundProp.state;
        if(!city)                   city = foundProp.city;
        if(!description)            description = foundProp.description;

        const lastModified = new Date();

        const propUpdateAttr = {
            propertyName : propertyName, 
            propertyLocation : propertyLocation, 
            constructionStatus : constructionStatus, 
            bookingStatus : bookingStatus, 
            seller : seller, 
            property_type : property_type, 
            property_amount : property_amount, 
            contract_type : contract_type, 
            floor : floor, 
            carpet_area : carpet_area, 
            state : state, 
            city : city, 
            description : description,
            lastModified: lastModified
        };

        console.log(propUpdateAttr);
        
        const updatedProp = await Prop.findByIdAndUpdate(propId,propUpdateAttr, {new : true})
            .then(propUpd => {
                console.log('Property updated succesfully..');
                res.status(httpStatusCodes.OK)
                    .json({ prop: propUpd});
            })
            .catch(err => {
                console.log(err);
            });
    }
};