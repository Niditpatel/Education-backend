const nodemailer = require('nodemailer');


const transpoter = nodemailer.createTransport({
    host: process.env.SMTP_EMAIL_HOST,
    port: process.env.SEND_ALL_EMAILS_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_EMAIL_USERNAME,
        pass: process.env.SMTP_EMAIL_PASSWORD,
        type: process.env.SEND_ALL_EMAILS_AUTHENTICATION
    },
    tls: {
        rejectUnauthorized: false
    }
});

const mailService = (subject, url, mailText, userEmail) => {
    try {
        const mailOptions = {
            from: process.env.SEND_ALL_EMAILS_FROM,
            to: userEmail,
            subject: subject,
            html: `<html><body>
            <h3>This mail is from oneEducation.</h3></br></br>
            <p> Please click ${url} to ${mailText}</p>
            </body></html>`
        }
        console.log(url);
        transpoter.sendMail(mailOptions, function (err, info) {
            if (err) {
                return err;
            } else {
                return info.response;
            }
        });
    }
    catch (e) {
        return e;
    }
}


module.exports = { mailService }