const errorMessages = require('../configuration/error');
const User = require('../models/user');
const Prop = require('../models/property');

const randomstring = require('randomstring');
const mustache = require('mustache');
const bcrypt = require('bcryptjs');
const httpStatusCodes = require('http-status-codes');
const JWT = require(`jsonwebtoken`);


const {
    JWT_SECRET,
    JWT_EXPIRY_TIME,
    JWT_ISSUER,
    cookiesName,
} = require('../configuration');


// Mail setup
const { smtpTransport } = require('../configuration/mail'),
    mailTemplates = require('../configuration/mailTemplates.json'),
    mailAccountUserName = require('../configuration/keys').MAIL_USER,
    mailAccountPassword = require('../configuration/keys').MAIL_PASS;

const sendVerificationMail = async (email, link) => {
    const options = {
        link: link
    };
    
    let mailBody = mustache.render(mailTemplates.signUp.body, options);
    const mailOptions = {
        from: mailAccountUserName,
        to: email,
        cc: mailTemplates.signUp.cc,
        bcc: mailTemplates.signUp.bcc,
        subject: mailTemplates.signUp.subject,
        html: mailBody
    };

    const info = await smtpTransport.sendMail(mailOptions)
        .then(mailSent => {
            console.log('Verification Link sent');
        })
        .catch(err => {
            console.log(err);
        });
};

//sign a new token
const signToken = emailId => {
    return JWT.sign({
        iss: JWT_ISSUER,
        sub: emailId,
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDate() + JWT_EXPIRY_TIME),
    }, JWT_SECRET);
};

module.exports = {
    register: async (req, res, next) => {
        console.log("register function");
        const {email, password, password2} = req.body;
    
        console.log(email + ' ' + password);

        //Check required fields
        if(!email || !password || !password2) {
            res.status(httpStatusCodes.PRECONDITION_FAILED)
                .send(errorMessages.requiredFieldsEmpty);
        } else {
            // Check if passwords match
            if(password !== password2) {
                res.status(httpStatusCodes.PRECONDITION_FAILED)
                    .send(errorMessages.passwordNotMatching);
            }

            // Check pass length
            if(password.length < 6) {
                res.status(httpStatusCodes.PRECONDITION_FAILED)
                    .send(errorMessages.passwordLengthNotEnough);
            }

            // Verify contact no... is it number? is it valid number?
            
        }
    
        console.log('validation passed');
        
        // validation passed
        const userFound = await User.findOne({ email: email });    

        if(userFound) {
            if(userFound.verified) {
                if(userFound.addedExtraInfo) {
                    res.status(httpStatusCodes.FORBIDDEN)
                        .send(errorMessages.userAlreadyExist);
                } else {
                    //res.redirect('/register/step2');
                    /******** Redirect to   '/register/step2'  *********  */
                }
            } else {
                res.status(httpStatusCodes.FORBIDDEN)
                        .send(errorMessages.userNotVerified);
            }
        } else {
        //    res.send('Welcome to estate locator');

            const randomHash = randomstring.generate();
            const link = 'http://localhost:1433' + '/account/verify/' + email + '?id=' + randomHash;
            const createdOn = new Date();

            const firstName = 'None';
            const lastName = 'None';
            const sex = 'None';
            const mobileno = 'None'; 
            const address = 'None';
            const country = 'None';
            const state = 'None';
            const district = 'None';
            const city = 'None';
            const pincode = 'None';

            const newUser = new User({
                email,
                password,
                createdOn,
                randomHash,
                firstName, 
                lastName, 
                sex, 
                mobileno, 
                address, 
                country, 
                state, 
                district, 
                city, 
                pincode
            });

            // Hash password
            bcrypt.genSalt(10, (err, salt) => 
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) throw err;

                    // Set password to hashed value
                    newUser.password = hash;
            }));

            var strtmp = email;
            var str = strtmp.substring(1,strtmp.length-1);
            str = '"<' + str + '>"';
            const editedEmail = JSON.parse(str);
            console.log(editedEmail);

            // save user
            await sendVerificationMail(editedEmail,link)
            .then(Response => {
                    const savedUser = newUser.save()
                    .then(user => {
                        console.log('User Registered');
                        res.status(httpStatusCodes.OK)
                            .json({ user: user});
                })
                .catch(err => {
                    console.log(err);
                    res.status(httpStatusCodes.FORBIDDEN)
                        .send(errorMessages.errorSavingUser);
                });
            })
            .catch(err => {
                console.log('err*********************');
                res.status(httpStatusCodes.FORBIDDEN)
                    .send(errorMessages.emailNotSent);
            });
        }
    },

    verify: async (req, res, next) => {
        const { email } = req.params;
        const user = await User.findOne({ email });

        if(!user) {
            res.send('<h2>This link has been used already and is now invalid.</h2>');
        } 
        else if(user.verified == true) {
            console.log('already verified...');
            res.status(httpStatusCodes.FORBIDDEN)
                .send('<h2>You are already verified...! Maybe love is fake!!!</h2>');
        }
        else if (req.query.id === user.randomHash) {
            console.log('use r email address verified succefully');
            const newUser = await User.findOneAndUpdate({ email }, { verified: true }, { new: true });
            res.status(httpStatusCodes.OK)
                .send('<h2>You are succefully verified. Now go and signIn by clicking given link. </h2> <a href = "localhost:3000/login">SignIn</a>');
        } else {
            console.log('Something went wrong');
            res.status(httpStatusCodes.FORBIDDEN)
                .send('<h2>Something went wrong! Maybe love is fake!!!</h2>');
        }
    },

    logIn: async (req, res, next) => {
        const { email,password } = req.body;
        const token = signToken(email);

        console.log('LogIn...');
        console.log('email : ' + email);

        const userFound = await User.findOne({ email });

        console.log(email+' '+password);

        if(!userFound) {
            res.status(httpStatusCodes.FORBIDDEN)
                .send(errorMessages.userNotRegistered);
        } else {
            /*  if(!userFound.verified) {
                errors.push({ msg: 'Email not verified yet' });
            } else if(!userFound.addedExtraInfo) {
                res.redirect('/register/step2');
            }
            else {
            */
            
            res.status(httpStatusCodes.OK)
            .json({
                cname1: 'cookiesNamekwt',
                cvalue1: token,
                cexpire: Date(Date.now() + JWT_EXPIRY_TIME * 24 * 60 * 60 * 1000),
                login : userFound
            });
        }
    },

    logOut: async (req, res, next) => {
        console.log('clearing cookies...');
        res.clearCookie('jwt');
        res.status(httpStatusCodes.OK)
            .json({});
    },

    getUser: async (req, res, next) => {
        const {userId} = req.body;
        console.log('getUser : ' +userId);

        await User.findById(userId)
            .then(foundUser => {
                if(!foundUser)
                {
                    res.status(httpStatusCodes.FORBIDDEN)
                        .send(errorMessages.userNotExist);
                } else {
                    res.status(httpStatusCodes.OK)
                        .json({user : foundUser});
                }
            })
            .catch(err => {
                res.status(httpStatusCodes.FORBIDDEN)
                        .send(errorMessages.userNotExist);
            });
    },

    getAllProps: async (req, res, next) => {
        const {userId} = req.body;
        console.log('getAllProps : '+userId);

        await Prop.find({seller: userId})
            .then(foundProps => {
                if(!foundProps)
                {
                    res.status(httpStatusCodes.FORBIDDEN)
                        .send(errorMessages.propNotFound);
                } else {
                    console.log("props found");
                    res.status(httpStatusCodes.OK)
                        .json({props : foundProps});
                }

            })
            .catch(err => {
                console.log(err);
                res.status(httpStatusCodes.FORBIDDEN)
                    .send(errorMessages.propNotFound);
            });
    },
    updateUser: async (req, res, next) => {
        const {userId, firstName, lastName, sex, mobileno, address, country, state, district, city, pincode} = req.body;
        console.log("updateUser : " + userId);

        const foundUser = await User.findById(userId)
            .then()
            .catch(err => {
                console.log(err);
                res.status(httpStatusCodes.FORBIDDEN)
                    .send(errorMessages.userNotExist);
            });

        if(!foundUser)
        {
            res.status(httpStatusCodes.FORBIDDEN)
                .send(errorMessages.userNotExist);
        } else {
            if(firstName)           foundUser.firstName = firstName;
            if(lastName)            foundUser.lastName = lastName;
            if(sex)                 foundUser.sex = sex;
            if(mobileno)            foundUser.mobileno = mobileno;
            if(address)             foundUser.address = address;
            if(country)             foundUser.country = country;
            if(state)               foundUser.state = state;
            if(district)            foundUser.district = district;
            if(city)                foundUser.city = city;
            if(pincode)             foundUser.pincode =pincode;

            await User.findByIdAndUpdate(userId,foundUser)
                .then(updatedUser => {
                    res.status(httpStatusCodes.OK)
                        .json({user: foundUser});
                })
                .catch(err => {
                    res.status(httpStatusCodes.FORBIDDEN)
                        .send(errorMessages.errorUpdatingUser);
                });
        }
    },
    addPropToWishlist: async (req,res, next) => {
        const {userId,propId} = req.body;
        console.log('Add this property to ' + userId + 'account');
        if(!userId || !propId ) {
            res.status(httpStatusCodes.PRECONDITION_FAILED)
                .send(errorMessages.requiredFieldsEmpty);            
        } else {
            // Extra verifications...
        }
        console.log('All details for add to wishlist is ok.');

        await User.findById(userId)
            .then(foundUser => {
                if(!foundUser){
                    res.status(httpStatusCodes.FORBIDDEN)
                        .send(errorMessages.userNotExist);
                }
                else{
                    console.log(foundUser);
                    // Check property is already in the list.
                    var foundProp = foundUser.wishList.find(function(element) {
                        return element === propId;
                      });
                    if(foundProp){
                        res.status(httpStatusCodes.FORBIDDEN)
                                .send(errorMessages.propAlreadyExist); 
                    }
                    else{
                        console.log('Add property to wishlist');
                        foundUser.wishList.push(propId);
                        User.findByIdAndUpdate(userId,foundUser,{ new: true})
                            .then(updateUser => {
                                res.status(httpStatusCodes.OK)
                                    .json({user: userFound});
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(httpStatusCodes.FORBIDDEN)
                                    .send(errorMessages.someThingWentWrong);
                            })
                    }
                }
            })
            .catch(err => {
                console.log(err);
                res.status(httpStatusCodes.FORBIDDEN)
                    .send(errorMessages.someThingWentWrong);
            });
    }
};


