const errorMessages = require('../configuration/error');
const User = require('../models/user');
const UserInfo = require('../models/userInfo');
const passport = require('../configuration/passport');

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
        .then()
        .catch(err => console.log(err));

    console.log('Verification Link sent');
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
        let errors = [];
    
        console.log(email + ' ' + password);

        //Check required fields
        if(!email || !password || !password2) {
//            errors.push({ msg: 'Please fill in all fields' });
            res.status(httpStatusCodes.PRECONDITION_FAILED)
                .send(errorMessages.requiredFieldsEmpty);
        } else {
            // Check if passwords match
            if(password !== password2) {
//                errors.push({ msg: 'Passwords do not match' });
                res.status(httpStatusCodes.PRECONDITION_FAILED)
                    .send(errorMessages.passwordNotMatching);
            }

            // Check pass length
            if(password.length < 6) {
//                errors.push({ msg: 'Password should be at least 6 characters' });
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
//                    errors.push({ msg: 'User Already Exist' });
                    res.status(httpStatusCodes.FORBIDDEN)
                        .send(errorMessages.userAlreadyExist);
                } else {
                    res.redirect('/register/step2');
                }
            } else {
//                errors.push({ msg: 'USer has not yet verified his/her email address. Please verify your email.' });
                res.status(httpStatusCodes.FORBIDDEN)
                        .send(errorMessages.userNotVerified);
            }

//            res.send(errors);
        } else {
            res.send('Welcome to estate locator');

            const randomHash = randomstring.generate();
            const link = 'http://localhost:1433' + '/account/verify/' + email + '?id=' + randomHash;
            const createdOn = new Date();
            const newUser = new User({
                email,
                password,
                createdOn,
                randomHash,
            });

            // Hash password
            bcrypt.genSalt(10, (err, salt) => 
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) throw err;

                    // Set password to hashed value
                    newUser.password = hash;
            }));

            // save user
            sendVerificationMail(email,link)
            .then(Response => {
                    const savedUser = newUser.save()
                    .then(user => {
                        console.log('User Registered');
                })
                .catch(err => {
                    console.log(err);
                    res.status(httpStatusCodes.FORBIDDEN)
                        .send(errorMessages.errorSavingUser);
                });

                res.status(httpStatusCodes.OK)
                        .json({ prop: savedUser});
            })
            .catch(err => {
                console.log(err);
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
            res.redirect('/logIn');
        } else {
            console.log('Something went wrong');
            res.status(httpStatusCodes.FORBIDDEN)
                .send('<h2>Something went wrong! Maybe love is fake!!!</h2>');
        }
    },

    logIn: async (req, res, next) => {

        console.log('Sign in going on.');

        const { email,password } = req.body;

        const token = signToken(email);


        console.log('email : ');
        console.log(email);

        const userFound = await User.findOne({ email });
//        let errors = [];

        console.log(email+' '+password);

        if(!userFound) {
//            errors.push({ msg: 'Email not registered.' });
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
            
        res.cookie(cookiesName.jwt, token, {
                httpOnly: false,
                expires: new Date(Date.now() + JWT_EXPIRY_TIME * 24 * 60 * 60 * 1000),
            })
                .status(httpStatusCodes.OK)
        .json({ user: userFound });

              //  console.log('Succesfully logged in');
               // res.redirect('/dashboard');
        //    }
        }
        
        // if(errors.length > 0) {
        //     res.send(errors);
        // }

    },

    logOut: async (req, res, next) => {
        res.clearCookie('jwt');
        res.status(httpStatusCodes.OK)
            .json({});
    },

    registerStep2: async (req, res, next) => {
        const {email, password, name, sex, mobileno, address, country, state, district, city, pincode} = req.body;
        const userFound = await User.findOne({ email });
//        let errors = [];

        if(!userFound) {
//            errors.push({ msg: 'Email not registered.' });
            res.status(httpStatusCodes.FORBIDDEN)
                .send(errorMessages.userNotRegistered);
        } else {
            if(!userFound.verified) {
//                errors.push({ msg: 'Email not verified yet' });
                res.status(httpStatusCodes.FORBIDDEN)
                    .send(errorMessages.userNotVerified);
            } else if(userFound.addedExtraInfo) {
//                errors.push({ msg: 'Details already given.'});
                res.status(httpStatusCodes.FORBIDDEN)
                    .send(errorMessages.extraInfoAlreadyGiven);
                //res.redirect('/account/signIn');
            } else {
                const newUserInfo = new UserInfo({
                    name, 
                    sex, 
                    mobileno, 
                    address, 
                    country, 
                    state, 
                    district, 
                    city, 
                    pincode,
                });
                const savedUserInfo = await newUserInfo.save()
                    .then(user => {
                        const newUser = User.findOneAndUpdate({ email }, { addedExtraInfo: true }, { new: true });
                        console.log('UserInfo recorded succefully');
                        res.redirect('/dashboard');
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(httpStatusCodes.FORBIDDEN)
                            .send(errorMessages.errorSavingUserInfo);
                    });
            }
        } 
        
        // if(errors.length > 0) {
        //     res.send(errors);
        // }
    }
};


