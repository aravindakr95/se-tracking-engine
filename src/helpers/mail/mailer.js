import sgMail from '@sendgrid/mail';
import config from '../../config/config';

async function sendEmail(email) {
    const composeEmail = {
        to: email.to,
        from: email.from,
        subject: email.subject,
        ...(email.text && {text: email.text}),
        ...(email.html && {html: email.html})
    };

    sgMail.setApiKey(config.sendGridApiKey);

    try {
        return await sgMail.send(composeEmail);
    } catch (error) {
        return error;
    }
}

module.exports = sendEmail;
