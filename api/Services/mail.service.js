const nodemailer = require('nodemailer');


const transpoter = nodemailer.createTransport({
    host: process.env.SMTP_EMAIL_HOST,
    port: process.env.SEND_ALL_EMAILS_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_EMAIL_USERNAME,
        pass: process.env.SMTP_EMAIL_PASSWORD,
    }
});

const mailService = async (subject, url, mailText, userEmail) => {
    console.log(transpoter, "hello transpoter");
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
        console.log("mail optionas", mailOptions);
        const info = await transpoter.sendMail(mailOptions);
        console.log(info, "info");
        return info;
    }
    catch (e) {
        return e;
    }
}


module.exports = { mailService }