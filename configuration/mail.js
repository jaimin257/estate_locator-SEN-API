const nodemailer = require('nodemailer');
const { logger } = require('../configuration/logger');

const mailAccountEmailId = require('./keys').MAIL_USER;
const mailAccountPassword = require('./keys').MAIL_PASS;

/*
    SMTP server configuration
*/

// var smtpConfig = {
//     service: 'gmail',
//     host: 'smtp.gmail.com',
//     port: 465,
//     secure: true, // use SSL
//     auth: {
//         user: mailAccountEmailId,
//         pass: mailAccountPassword
//     }
// };


var smtpConfig = {
    host: 'webmail.daiict.ac.in',
    port: 465,
    secureConnection: true,
    auth: {
        user: mailAccountEmailId,
        pass: mailAccountPassword
    }
};

var smtpTransport = nodemailer.createTransport(smtpConfig);

/*------------------SMTP Over-----------------------------*/

smtpTransport.verify(function (error, success) {
    if (error) { 
        console.log(error);
        logger.error(error);
    } else {
        console.log('Mail server is ready to take our messages');
        logger.info('Mail server is ready to take our messages');
    }
});

const sendMail = async (toId, cc, bcc, subject, html, text) => {
    const info = await smtpTransport.sendMail({
        from: mailAccountEmailId,
        to: toId,
        cc,
        bcc,
        subject,
        text,
        html
    }, function (err, info) {
        if(err) {
            console.log(err);
        } else {
          console.log(info);
        }
     });

};

module.exports = {
    sendMail,
    smtpTransport
};