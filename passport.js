const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { JWT_SECRET, validityErrors} = require('./configuration');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const httpStatusCodes = require('http-status-codes');
const JWT = require(`jsonwebtoken`);


module.exports = {
// JWT strategy...
    checkToken : async (req, res, next) => {
        const header = req.headers['authorization'];

        if(typeof header !== 'undefined') {
            const bearer = header.split(' ');
            const token = bearer[1];

            req.token = token;
            next();
        } else {
            //If header is undefined return Forbidden (403)
            res.sendStatus(httpStatusCodes.FORBIDDEN)
        }
    },

    jwtVerifier: async (req,res,next) => {
        JWT.verify(req.token, JWT_SECRET, (err, authorizedData) => {
            if(err){
                //If error send Forbidden (403)
                console.log('ERROR: Could not connect to the protected route');
                res.sendStatus(httpStatusCodes.FORBIDDEN);
            } else {
                //If token is successfully verified, we can send the autorized data 
                res.clearCookie('jwt');
                res.status(httpStatusCodes.OK)
                    .json({});
                console.log('SUCCESS: Connected to protected route');
            }
        })
    },
};


//LOCAL STRATEGY
passport.use(new LocalStrategy({
    usernameField: 'email',
}, async (email, password, done) => {

    try {
        //find the user with given email
        const user = await User.findOne({ email });

        console.log('hey hey');
        //if not handle it
        if (!user) {
            return done(null, false);
        }

        //check if the password is correct
        const isMatch = await user.isValid(password);

        //if not handle it
        if (!isMatch) {
            return done(null, false);
        }

        //otherwise return user
        done(null, user);
    } catch (error) {
        done(error, false);
    }
}));