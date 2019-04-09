const httpStatusCodes = require('http-status-codes');
const errorMessages = require('../configuration/error');
const Prop = require('../models/property');
const User = require('../models/user');

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
        const { propId } = req.query;

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
        var {noOfRooms, furnishedType} = req.body;
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

        if(noOfRooms == undefined)  noOfRooms = 'None';
        if(furnishedType == undefined)  furnishedType = 'None';

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
            noOfRooms,
            furnishedType,
            createdOn,
            lastModified,
        });


        // Adding Property...
        await User.findById(seller)
            .then(foundUser => {
                if(!foundUser)
                {
                    res.status(httpStatusCodes.FORBIDDEN)
                        .send(errorMessages.userNotExist);
                } else if(foundUser.verified == false || foundUser.addedExtraInfo == false) {
                    res.status(httpStatusCodes.FORBIDDEN)
                        .send(errorMessages.userIsNotMature);
                } 
                else {
                    console.log(foundUser);
                    newProp.save()
                        .then(savedProp => {
                            console.log('Property added'); 
                            foundUser.properties.push(savedProp);
                            User.findByIdAndUpdate(seller,foundUser,{new:true})
                                .then(updatedUser => {
                                    console.log(updatedUser);
                                    res.status(httpStatusCodes.CREATED)
                                        .json({ prop: savedProp });
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(httpStatusCodes.FORBIDDEN)
                                        .send(err);
                                });
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(httpStatusCodes.FORBIDDEN)
                                .send(err);
                        });
                }  
            })
            .catch(err => {
                console.log(err);
                res.status(httpStatusCodes.FORBIDDEN)
                    .send(err);
            });
    },
    removeProp: async (req, res, next) => {
        const {propId} = req.query;
        const {userId} = req.body;
      //  const {propId} = req.params;

        console.log('removeProp : '+propId);

        // May need to perform some verifications such as user, etc..

        // Deleting property from database...
        await User.findById(userId)
            .then(foundUser => {
                if(!foundUser)
                {
                    res.status(httpStatusCodes.FORBIDDEN)
                        .send(errorMessages.userNotExist);
                } else {
                    var index = foundUser.properties.indexOf(propId);
                    if (index > -1) {
                        foundUser.properties.splice(index, 1);
                    }
                    User.findByIdAndUpdate(userId,foundUser,{new:true})
                        .then(updatedUser => {
                            Prop.findByIdAndRemove(propId,
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
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(httpStatusCodes.FORBIDDEN)
                                .send(err);
                        });
                }
            })
            .catch(err => {
                console.log(err);
                res.status(httpStatusCodes.FORBIDDEN)
                    .send(err);
            });
    },
    updateProp: async (req, res, next) => {
        var {propId, propertyName, propertyLocation, constructionStatus, bookingStatus, property_type, property_amount, contract_type, floor, carpet_area, state, city, description, noOfRooms, furnishedType} = req.body;

        const foundProp = await Prop.findById(propId)
            .then()
            .catch(err => {
                res.status(httpStatusCodes.FORBIDDEN)
                    .send(errorMessages.propNotFound);
            });

        if(foundProp == undefined)
        {
            res.status(httpStatusCodes.FORBIDDEN)
                .send(errorMessages.propNotFound);
        } else {
            if(propertyName)            foundProp.propertyName = propertyName;
            if(propertyLocation)        foundProp.propertyLocation = propertyLocation;
            if(constructionStatus)      foundProp.constructionStatus = constructionStatus;
            if(bookingStatus)           foundProp.bookingStatus = bookingStatus;
            if(property_type)           foundProp.property_type = property_type;
            if(property_amount)         foundProp.property_amount = property_amount;
            if(contract_type)           foundProp.contract_type = contract_type;
            if(floor)                   foundProp.floor = floor;
            if(carpet_area)             foundProp.carpet_area = carpet_area;
            if(state)                   foundProp.state = state;
            if(city)                    foundProp.city = city;
            if(description)             foundProp.description =description;
            if(noOfRooms)               foundProp.noOfRooms =noOfRooms;
            if(furnishedType)           foundProp.furnishedType =furnishedType;
    
//            const lastModified = new Date();
            foundProp.lastModified = new Date();

            console.log(foundProp);
            await Prop.findByIdAndUpdate(propId,foundProp, {new : true})
                .then(propUpd => {
                    console.log('Property updated succesfully..');
                    res.status(httpStatusCodes.OK)
                        .json({ prop: foundProp});
                })
                .catch(err => {
                    console.log(err);
                    res.status(httpStatusCodes.FORBIDDEN)
                        .send(errorMessages.errorUpdatingProp);
                });
        }
    },

    searchProp: async (req, res, next) => {
       // var { searchStr } = req.body;
      //  console.log(searchStr);

        const foundProps = await Prop.find({
            "$text": {
                "$search": req.body.query
            }
            },
            {
                document: 1,
                created: 1,
                _id: 1,
                textScore: {
                    $meta: "textScore"
                }
            },
            {
                sort: {
                    textScore: {
                        $meta: "textScore"
                    }
                }
            }
        );
        // .toArray(function(err, items) {
        //     res.send(items);
        // });
            
        if(foundProps != undefined) {
            res.status(httpStatusCodes.OK)
                .send(foundProps);
        } else {
            res.status(httpStatusCodes.FORBIDDEN)
                .send('errororro');
        }
    
    }
};