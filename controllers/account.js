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
        const {email, password, password2, firstName, lastName, sex, mobileno, address, country, state, district, city, pincode} = req.body;
    
        console.log(email + ' ' + password);

        //Check required fields
        if(!email || !password || !password2 || !firstName || !lastName || !sex || !mobileno || !address || !country || !state || !district || !city || !pincode) {
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

            // res.cookie(cookiesName.jwt, token, {
            //         httpOnly: false,
            //         expires: new Date(Date.now() + JWT_EXPIRY_TIME * 24 * 60 * 60 * 1000),
            //     })
            //         .status(httpStatusCodes.OK)
            // .json({ user: userFound });

        //    }
        }
    },

    logOut: async (req, res, next) => {
        console.log('clearing cookies...');
        res.clearCookie('jwt');
        res.status(httpStatusCodes.OK)
            .json({});
    },

    getUser: async (req, res, next) => {
        const {userId} = req.query;
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
        const {userId} = req.query;
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

    // registerStep2: async (req, res, next) => {
    //     const {email, password, name, sex, mobileno, address, country, state, district, city, pincode} = req.body;
    //     const userFound = await User.findOne({ email });

    //     if(!userFound) {
    //         res.status(httpStatusCodes.FORBIDDEN)
    //             .send(errorMessages.userNotRegistered);
    //     } else {
    //         if(!userFound.verified) {
    //             res.status(httpStatusCodes.FORBIDDEN)
    //                 .send(errorMessages.userNotVerified);
    //         } else if(userFound.addedExtraInfo) {
    //             res.status(httpStatusCodes.FORBIDDEN)
    //                 .send(errorMessages.extraInfoAlreadyGiven);
    //         } else {
    //             const newUserInfo = new UserInfo({
    //                 name, 
    //                 sex, 
    //                 mobileno, 
    //                 address, 
    //                 country, 
    //                 state, 
    //                 district, 
    //                 city, 
    //                 pincode,
    //             });
    //             const savedUserInfo = await newUserInfo.save()
    //                 .then(user => {
    //                     const newUser = User.findOneAndUpdate({ email }, { addedExtraInfo: true }, { new: true });
    //                     console.log('UserInfo recorded succefully');
    //                     res.status(httpStatusCodes.OK);
    //                 })
    //                 .catch(err => {
    //                     console.log(err);
    //                     res.status(httpStatusCodes.FORBIDDEN)
    //                         .send(errorMessages.errorSavingUserInfo);
    //                 });
    //         }
    //     } 
    // }
};


