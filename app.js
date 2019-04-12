const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const app = express();

// DB Config
const db = require('./configuration/keys').DB_URI;

//connect to Mongo
mongoose.connect(db, { useNewUrlParser: true })
    .then(() => console.log('MongoDB connection establlished'))
    .catch(err => console.log(err));



// BodyParser
app.use(express.urlencoded({ extended: false }));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

const PORT = process.nextTick.PORT || 1433;

app.listen(PORT, console.log(`Server started on port ${PORT}`));


//Routes
app.use('/', require('./routes/index'));
app.use('/account', require('./routes/account')); 
app.use('/property', require('./routes/property')); 