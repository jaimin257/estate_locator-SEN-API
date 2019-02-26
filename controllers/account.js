const User = require('../models/user');
const bcrypt = require('bcryptjs');

module.exports = {
    register: async (req, res, next) => {
        const {firstName, lastName, primaryEmail, password, password2, contactNo, gender} = req.body;
        let errors = [];
    
        //Check required fields
        if(!firstName || !lastName || !primaryEmail || !password || !password2 || !contactNo || !gender) {
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
            const userFound = await User.findOne({ primaryEmail: primaryEmail });    

            if(userFound) {
                errors.push({ msg: 'USer Already Exist' });
                res.send(errors);
            } else {
                res.send('Welcome to estate locator');
                
                const createdOn = new Date();
                const newUser = new User({
                    firstName,
                    lastName,
                    primaryEmail,
                    password,
                    contactNo,
                    gender,
                    createdOn,
                });

                // Hash password
                bcrypt.genSalt(10, (err, salt) => 
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;

                        // Set password to hashed value
                        newUser.password = hash;
                        // save user
                        newUser.save()
                            .then(user => {
                                console.log('User Registered');
                                //    res.redirect('/account/logIn');
                            })
                            .catch(err => console.log(err));
                }));
            }
        }
    }
};


