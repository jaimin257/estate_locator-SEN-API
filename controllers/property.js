const httpStatusCodes = require('http-status-codes');
const errorMessages = require('../configuration/error');
const Prop = require('../models/property');
const User = require('../models/user');

function occurrences(string, subString, allowOverlapping) {
    string += "";
    subString += "";

    //If string is empty...
    if (subString.length <= 0) return (string.length + 1);

    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length;

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}


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
        const { propId } = req.query;

        console.log('getThisProp : '+propId);

        const foundProp = await Prop.findById(propId);

        if(!foundProp) {
            return res.status(httpStatusCodes.FORBIDDEN)
                .send(errorMessages.propNotFound);  
        } else {
            return res.status(httpStatusCodes.OK)
                .json({ prop: foundProp });
        }
    },

    getAllProps: async (req, res, next) => {
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

    //add property...
    addProp: async (req, res, next) => {
        const {propertyName, propertyLocation, constructionStatus, seller, property_type, property_amount, contract_type, floor, carpet_area, state, city, description} = req.body;
        var {noOfRooms, furnishedType} = req.body;

        console.log('addProp...');

        // Check required Fields
        if(!propertyName || !propertyLocation || !constructionStatus || !seller || !property_type || !property_amount || !contract_type || !floor || !carpet_area || !state || !city || !description) {
            return res.status(httpStatusCodes.PRECONDITION_FAILED)
                .send(errorMessages.requiredFieldsEmpty);            
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
                    return res.status(httpStatusCodes.FORBIDDEN)
                        .send(errorMessages.userNotExist);
                } else if(foundUser.verified == false || foundUser.addedExtraInfo == false) {
                    return res.status(httpStatusCodes.FORBIDDEN)
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

    //remove property...
    removeProp: async (req, res, next) => {
        const {propId} = req.query;
        const {userId} = req.body;

        console.log('removeProp : '+propId);

        // Deleting property from database...
        await User.findById(userId)
            .then(foundUser => {
                if(!foundUser)
                {
                    return res.status(httpStatusCodes.FORBIDDEN)
                        .send(errorMessages.userNotExist);
                } else {
                    var index = foundUser.properties.indexOf(propId);
                    if (index > -1) {
                        foundUser.properties.splice(index, 1);
                        User.findByIdAndUpdate(userId,foundUser,{new:true})
                            .then(updatedUser => {
                                Prop.findByIdAndRemove(propId,
                                        function(err, docs){
                                            if(err) {
                                                return res.status(httpStatusCodes.FORBIDDEN)
                                                    .send(err);
                                            } else {
                                                console.log('Property deleted succesfully...');
                                                return res.status(httpStatusCodes.OK)
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
                }
            })
            .catch(err => {
                console.log(err);
                res.status(httpStatusCodes.FORBIDDEN)
                    .send(err);
            });
    },

    //Update property...
    updateProp: async (req, res, next) => {
        var {propId, propertyName, propertyLocation, constructionStatus, property_type, property_amount, contract_type, floor, carpet_area, state, city, description, noOfRooms, furnishedType} = req.body;

        const foundProp = await Prop.findById(propId)
            .then()
            .catch(err => {
                res.status(httpStatusCodes.FORBIDDEN)
                    .send(errorMessages.propNotFound);
            });

        if(foundProp == undefined)
        {
            return res.status(httpStatusCodes.FORBIDDEN)
                .send(errorMessages.propNotFound);
        } else {
            if(propertyName)            foundProp.propertyName = propertyName;
            if(propertyLocation)        foundProp.propertyLocation = propertyLocation;
            if(constructionStatus)      foundProp.constructionStatus = constructionStatus;
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

    //search property...
    searchProp: async (req, res, next) => {
        var searchStr = String(req.body.searchStr);

        console.log('search');

        while(searchStr.indexOf("'")> -1)
        {
            searchStr = searchStr.replace("'","");
        }

        var wordsArray = searchStr.split(/\s+/);
        console.log(searchStr);

        await Prop.find()
            .then(props => {
                for(var i=0;i<props.length;i++)
                {
                    var string = ""+String(props[i].description)+"";
                    var sum = 0;
                    for(var j=0;j<wordsArray.length;j++)
                    {
                        console.log(wordsArray[j]);
                        var cnt = occurrences(string,wordsArray[j]);
                        sum += cnt;
                    }
                    props[i].searchScore = sum;
                }

                props.sort((a, b) => (a.searchScore > b.searchScore) ? -1 : 1);
        
                return res.status(httpStatusCodes.OK)
                    .json({searchResult: props});
            })
            .catch(err => {
                console.log(err);
                    res.status(httpStatusCodes.FORBIDDEN)
                        .send(errorMessages.errorUpdatingProp);
            });
    }
};