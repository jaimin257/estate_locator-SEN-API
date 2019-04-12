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

// Mail for forget password...
const sendForgetPasswordMail = async (email,link) => {
    const options = {   //**************  */
        link: link
    };

    const tags = {
        email: email,
        link: link
    };

    let mailBody = mustache.render(mailTemplates.signUp.body, tags);
    const mailOptions = {
        from: mailAccountUserName,
        to: email,
        cc: mailTemplates.forgetPassword.cc,
        bcc: mailTemplates.forgetPassword.bcc,
        subject: mailTemplates.forgetPassword.subject,
        html: mailBody
    };

    const info = await smtpTransport.sendMail(mailOptions)
        .then(mailSent => {
            console.log('forget password Link sent');
        })
        .catch(err => {
            console.log(err);
        });
};

//password changed mail
const sendPasswordChangedMail = async (email) => {
    const options = {
        email: email,
    };

    let mailBody = mustache.render(mailTemplates.signUp.body, options);
    const mailOptions = {
        from: mailAccountUserName,
        to: email,
        cc: mailTemplates.passwordChanged.cc,
        bcc: mailTemplates.passwordChanged.bcc,
        subject: mailTemplates.passwordChanged.subject,
        html: mailBody
    };

    const info = await smtpTransport.sendMail(mailOptions)
        .then(mailSent => {
            console.log('password changed succesfully...');
        })
        .catch(err => {
            console.log(err);
        });
};

// verification mail on registration...
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
    //Register user
    register: async (req, res, next) => {
        const {email, password, password2} = req.body;
        console.log("register function : " + email);

        //Check required fields
        if(!email || !password || !password2) {
            res.status(httpStatusCodes.PRECONDITION_FAILED)
                .send(errorMessages.requiredFieldsEmpty);
        } else {
            console.log('validation passed');
            
            // validation passed
            const userFound = await User.findOne({ email: email });    

            if(userFound) {
                res.status(httpStatusCodes.FORBIDDEN)
                        .send(errorMessages.userAlreadyExist);
            } else {
                // Verification link generator
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
                    console.log(err);
                    res.status(httpStatusCodes.FORBIDDEN)
                        .send(errorMessages.emailNotSent);
                });
            }
        }
    },

    //verify User...
    verify: async (req, res, next) => {
        const { email } = req.params;

        console.log('verify : ' + email);

        await User.findOne({ email })
            .then(user => {
                if(!user) {
                    return res.send('<h2>This link has been used already and is now invalid.</h2>');
                } 
                else if(user.verified == true) {
                    console.log('already verified...');
                    return res.status(httpStatusCodes.FORBIDDEN)
                        .end('<h2>You are already verified...! Maybe love is fake!!!</h2>');
                }
                else if (req.query.id === user.randomHash) {
                    console.log('user email address verified succefully');
                    const newUser = User.findOneAndUpdate({ email }, { verified: true }, { new: true });
                    return res.status(httpStatusCodes.OK)
                        .end('<h2>You are succefully verified. Now go and signIn by clicking given link. </h2> <a href = "localhost:3000/login">SignIn</a>');
                } else {
                    console.log('Something went wrong');
                    return res.status(httpStatusCodes.FORBIDDEN)
                        .end('<h2>Something went wrong! Maybe love is fake!!!</h2>');
                }
            })
            .catch(err => {
                res.status(httpStatusCodes.FORBIDDEN)
                    .send(err);
            });
    },

    resendVerificationLink: async (req, res, next) => {
        const {userId} = req.query;

        const user = await User.findById(userId);

        var strtmp = user.email;
        var str = strtmp.substring(1,strtmp.length-1);
        str = '"<' + str + '>"';
        const editedEmail = JSON.parse(str);
        console.log(editedEmail);

        // Verification link generator
        const link = 'locolhost://1443' + '/account/verify/' + user.email + '?id=' + user.randomHash;
        const resendVerificationLink =  'locolhost://1443' + '/account/resendVerificationLink/' + user.email;

        // save user
        await sendVerificationMail(editedEmail,link)
            .then(Response => {
                res.status(HttpStatus.CREATED)
                    .end('<h1>Verification link sent to email ' + email + ' please verify your account</h1><br><a href=' + resendVerificationLink + '>Click here to resend verification link</a>');
            })
            .catch(err => {
                console.log('err*********************');
                res.status(httpStatusCodes.FORBIDDEN)
                    .send(errorMessages.emailNotSent);
            });
    },

    // Forget password
    forgetPassword: async (req, res, next) => {
        const {email} = req.params;

        const foundUser = User.findOne({ email });

        if (!foundUser) {
            return res.sendStatus(HttpStatus.FORBIDDEN);
        } else {
            let randomHash;
            const linkExpiryTime = new Date();
            linkExpiryTime.setHours(linkExpiryTime.getHours() + RESET_PASSWORD_EXPIRY_TIME);

            if (foundUser.resetPasswordRequestTime) {
                const timeNotAllowed = new Date();
                timeNotAllowed.setHours(timeNotAllowed.getHours() - userBlockageTimeForTooManySignUpRequests);

                if (foundUser.resetPasswordRequestTime <= timeNotAllowed) {
                    foundUser.resetPasswordRequestTime = new Date();
                    randomHash = randomstring.generate();
                    foundUser.resetPasswordRequest = 1;
                } else if (foundUser.resetPasswordRequest >= maximumSignUpRequestBeforeBlocking) {
                    return res.status(HttpStatus.FORBIDDEN)
                        .send(errorMessages.blockUser);
                } else {
                    randomHash = foundUser.resetPasswordToken;
                    foundUser.resetPasswordRequest++;
                }
            } else {
                randomHash = randomstring.generate();
                foundUser.resetPasswordRequestTime = new Date();
                foundUser.resetPasswordRequest = 1;
            }

            var strtmp = user.email;
            var str = strtmp.substring(1,strtmp.length-1);
            str = '"<' + str + '>"';
            const editedEmail = JSON.parse(str);
            console.log(editedEmail);

            //forget password link generator
            const link = 'locolhost://1443' + '/account/resetPassword/' + user.email + '?id=' + user.randomHash;

            foundUser.resetPasswordToken = randomHash;
            foundUser.resetPasswordExpires = linkExpiryTime;
            const updatedUser = await foundUser.save();

            await sendForgetPasswordMail(editedEmail,link)
                .then(Response => {
                    res.status(HttpStatus.OK)
                        .end('Response: Password reset link sent');
                })
                .catch(err => {
                    console.log('err*********************');
                    res.status(httpStatusCodes.FORBIDDEN)
                        .send(errorMessages.emailNotSent);
                });
        }
    },

    verifyResetPasswordLink: async (req, res, next) => {
        const { email } = req.params;
        const user = await User.findOne({ email });

        if (!user || user.resetPasswordToken !== req.query.id || user.resetPasswordExpires < new Date()) {
            return res.status(httpStatusCodes.FORBIDDEN)
                .end('<h2>Password reset token is invalid or has expired.</h2>');
        } else {
            return res.status(httpStatusCodes.OK)
                .end('<h2>You are succefully verified. Now go and signIn by clicking given link. </h2> <a href = "localhost:3000/login">SignIn</a>');
        }
    },

    resetPassword: async (req, res, next) => {
        const { email } = req.params;
        const { password } = req.body.password;
        const user = await User.findOne({ email });

        if (!user || user.resetPasswordToken !== req.query.id || user.resetPasswordExpires < new Date()) {
            return res.status(httpStatusCodes.FORBIDDEN)
                .send(errorMessages.passwordResetTokenInvalid);
        }


        bcrypt.genSalt(10, (err, salt) => 
            bcrypt.hash(password, salt, (err, hash) => {
                if(err) throw err;

                // Set password to hashed value
                user.password = hash;
            }));

       // user.password = await hashPassword(req.body.password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.resetPasswordRequest = undefined;
        user.resetPasswordRequestTime = undefined;    

        await user.save();

        var strtmp = user.email;
        var str = strtmp.substring(1,strtmp.length-1);
        str = '"<' + str + '>"';
        const editedEmail = JSON.parse(str);
        console.log(editedEmail);

        await sendPasswordChangedMail(editedEmail)
        .then(Response => {
            res.status(HttpStatus.OK)
                .end('Response: Password changed');
        })
        .catch(err => {
            console.log(err);
            res.status(httpStatusCodes.FORBIDDEN)
                .send(errorMessages.emailNotSent);
        });
    },  

    logIn: async (req, res, next) => {
        const { email,password } = req.body;
        const token = signToken(email);

        console.log('LogIn...');
        console.log('email : ' + email);

        const userFound = await User.findOne({ email });

        if(!userFound) {
            return res.status(httpStatusCodes.FORBIDDEN)
                .send(errorMessages.userNotRegistered);
        } else {
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
            return res.status(httpStatusCodes.FORBIDDEN)
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


            if(firstName == 'None' || lastName == 'None' || sex == 'None' || mobileno == 'None' || address == 'None' || country == 'None' || state == 'None' || district == 'None' || city == 'None' || pincode == 'None')
            {
                res.status(httpStatusCodes.PRECONDITION_FAILED)
                    .send(errorMessages.requiredFieldsEmpty);
            }

            foundUser.addedExtraInfo = true;

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
            return res.status(httpStatusCodes.PRECONDITION_FAILED)
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
                        User.findByIdAndUpdate(userId,foundUser,{ new: true })
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
    },
    delPropFromWishlist: async(req, res, next) => {
        const {userId, propId} = req.body;

        console.log('Delete' + propId + 'from wish list of '+ userId);
        
        if(!userId || !propId ) {
            return res.status(httpStatusCodes.PRECONDITION_FAILED)
                .send(errorMessages.requiredFieldsEmpty);            
        } else {
            // Extra verifications...
        }
        console.log('All details for delete from wishlist is ok.');

        await User.findById(userId)
            .then(foundUser => {
                if(!foundUser){
                    return res.status(httpStatusCodes.FORBIDDEN)
                        .send(errorMessages.userNotExist);
                }
                else{
                    console.log(foundUser);
                    var index = foundUser.wishList.indexOf(propId);
                    if(index > -1){
                        foundUser.wishList.splice(index, 1);
                        User.findByIdAndUpdate(userId, foundUser, {new : true})
                            .then(updatedUser => {
                                res.status(httpStatusCodes.OK)
                                    .json({user : foundUser});
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(httpStatusCodes.FORBIDDEN)
                                    .send(err);
                            })
                    }
                    else{
                        // failure message
                    }
                }
            })
            .catch(err => {
                console.log(err);
                res.status(httpStatusCodes.FORBIDDEN)
                    .send(err);
            })
    }
};