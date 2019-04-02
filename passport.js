const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');

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