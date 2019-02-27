const User = require('../models/user');
const randomstring = require('randomstring');
const mustache = require('mustache');
const bcrypt = require('bcryptjs');

// Mail setup
const { smtpTransport } = require('../configuration/mail'),
    mailTemplates = require('../configuration/mailTemplates.json'),
    mailAccountUserName = require('../configuration/keys').MAIL_USER,
    mailAccountPassword = require('../configuration/keys').MAIL_PASS;

const sendVerificationMail = async (email, link) => {
   
    // const link = httpProtocol + '://' + host + '/account/verify/' + email + '?id=' + randomHash;

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
        .catch(err => {
            console.log(err);
        });

    console.log('Verification Link sent');
};


module.exports = {
    register: async (req, res, next) => {
        const {email, password, password2} = req.body;
        let errors = [];
    
        //Check required fields
        if(!email || !password || !password2) {
            errors.push({ msg: 'Please fill in all fields' });
        } else {
            // Check if passwords match
            if(password !== password2) {
                errors.push({ msg: 'Passwords do not match' });
            }

            // Check pass length
            if(password.length < 6) {
                errors.push({ msg: 'Password should be at least 6 characters' });
            }

            // Verify contact no... is it number? is it valid number?
            
        }
    
        if(errors.length > 0) {
            res.send(errors);
        } else {
            console.log('validation passed');
            
            // validation passed
            const userFound = await User.findOne({ email: email });    

            if(userFound) {
                if(userFound.verified) {
                    errors.push({ msg: 'USer Already Exist' });
                } else {
                    errors.push({ msg: 'USer Already registered but not verified. Please verify your email.' });
                }

                res.send(errors);
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

                        // save user
                        sendVerificationMail(email,link)
                            .then(Response => {
                                newUser.save()
                                .then(user => {
                                    console.log('User Registered');
                                })
                                .catch(err => console.log(err));
                            })
                            .catch(err => console.log(err));
                }));
            }
        }
    },
    verify: async (req, res, next) => {
        const { email } = req.params;
        const user = await User.findOne({ email });

        if(!user) {
            console.log('hey hye'); 
            res.end('<h2>This link has been used already and is now invalid.</h2>');
        } 
        else if (req.query.id === user.randomHash) {
            console.log('user email address verified succefully');
            const newUser = await User.findOneAndUpdate({ email }, { verified: true }, { new: true });
            res.redirect('/register/step2');
        } else {
            console.log('Something went wrong');
        }
    }
};


