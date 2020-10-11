import sgMail from '@sendgrid/mail';
import config from '../../config/config';

async function sendEmail(data) {
    sgMail.setApiKey(config.sendGridApiKey);
    const msg = {
        to: data.to,
        from: data.from,
        subject: data.subject,
        text: data.text,
        html: data.text
    };
    try {
        return await sgMail.send(msg);
    } catch (error) {
        return error;
    }
}

module.exports = sendEmail;
