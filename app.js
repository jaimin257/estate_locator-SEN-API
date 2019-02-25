const express = require('express');
const db = require('mongoose');
const bodyParser = require('body-parser');
const HttpStatus = require('http-status-codes');
const path = require('path');
const internetAvailable = require('internet-available');
const http = require('http');
const https = require('https');



const app = express();

/* Connecting to database */

const dbURI = process.env.DB_URI;

db.connect(dbURI, { useNewUrlParser: true })
    .then(
        () => {
            console.log('MongoDB connection established');
        },
        (err) => {
            console.log(`Cannot connect to mongoDB\n${err}`);
        }
    );


// Routes
const account = require('./routes/account');