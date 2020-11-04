import axios from 'axios';
import config from '../../config/config';

function configSMS(contactNumber, message) {
    return {
        outboundSMSMessageRequest: {
            address: [
                `tel:+${contactNumber}`
            ],
            senderAddress: 'SETE',
            outboundSMSTextMessage: {
                message
            },
            clientCorrelator: '123456',
            receiptRequest: {
                'notifyURL': 'http://128.199.174.220/ideamart/test/echo2.php',
                'callbackData': 'some-data-useful-to-the-requester'
            },
            senderName: 'SETE'
        }
    }
}

function configOTP(contactNumber) {
    return {
        method: 'ANC',
        msisdn: contactNumber
    }
}

function configOTPResponse(data) {
    return {
        pin: data.pin,
        serverRef: data.serverRef
    }
}

async function sendSMS(httpOptions, body) {
    const options = {
        url: httpOptions.url,
        method: httpOptions.method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.ideabizAuthToken}`
        }
    }

    try {
        return await axios.post(httpOptions.url, body, options);
    } catch (error) {
        return error;
    }

}

module.exports = { configSMS, configOTP, configOTPResponse, sendSMS };
