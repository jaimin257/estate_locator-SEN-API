const HttpStatus = require('http-status-codes');

const User = require('../models/user');
const UserInfo = require('../models/userInfo');



module.exports = {
    signUp: async (req, res, next) => {
        const { emailId, password } = req.value.body;
        const createdOn = new Date();

        //Check if user already exist
        const foundUSer = await User.findOne({ emailId });

        if(foundUSer) {
            return res.status(HttpStatus.FORBIDDEN)
                .send(errorMessages.userAlreadyExist);
        }

        const tempUserInDB = await tempUser.findOne({ emailId });

        if(!tempUserInDB) {
            const newUser = {
                emailId,
                password,
                createdOn
            };

            const savedUser = await tempUser.findOneAndUpdate({ emailId }, newUser, { upsert: true, new:true });
        } else {
            const newUser = {
                emailId,
                password
            };

            const savedUser = await tempUser.findOneAndUpdate({ emailId }, newUser, { upsert: true, new:true });
        }

        // functionality of sending varification link is pending
        res.status(HttpStatus.CREATED)
            .end('Response: Verification link sent');
    }
};