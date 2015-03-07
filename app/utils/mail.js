"use strict";

/**
 * Dependencies
 */
var nodemailer      = require('nodemailer'),
    smtpTransport   = require('nodemailer-smtp-transport');

module.exports = function() {

    var username = process.env.MAIL_USERNAME,
        from = process.env.MAIL_FROM,
        password = process.env.MAIL_PASSWORD,
        host = process.env.MAIL_HOST,
        options = {
            host : host,
            port : 465,
            secure: true,
            auth : {
                user : username,
                pass : password
            }
        },
        transporter;

    if (host && username && password) {
        transporter = nodemailer.createTransport(smtpTransport(options));
    }

    return {
        // only used when coming in via search, to help fix human errors
        send : function(to, subject, body) {
            var mailOptions = {
                from: from, // sender address
                to: to, // list of receivers
                subject: 'APPLICATION: ' + subject, // Subject line
                html: body // html body
            };
            if (transporter) {
                // asynchronously send the mail
                transporter.sendMail(mailOptions, function(error, info){
                    if (error){
                        console.log(error);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });
            } else {
                // local development, with no setup
                // log into console so the result can be seen
                console.log('Local mail:')
                console.log(mailOptions);
            }
        }


    };
};


