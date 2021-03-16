import { body, param, validationResult } from 'express-validator';

import HttpResponseType from '../enums/http/http-response-type';
import HttpMethod from '../enums/http/http-method';

import { errorResponse } from '../helpers/response/response-dispatcher';

function fieldStateChecker(req, res, next) {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return next();
    }

    const extractedErrors = [];
    errors.array().map(error => extractedErrors.push(error.msg));

    return errorResponse(res, {
        code: HttpResponseType.UNPROCESSABLE_ENTITY,
        message: extractedErrors.join(', ')
    });
}

const validate = (main, route, method) => {
    switch (main) {
    case 'auth':
        return authValidator(route);
    case 'pgsb':
        return pgsbValidator(route);
    case 'pvsb':
        return pvsbValidator(route);
    case 'consumers':
        return consumersValidator(method);
    case 'summary':
        return summaryValidator(method);
    case 'analysis':
        return reportsValidator(route);
    case 'forecast':
        return forecastValidator(route);
    default:
        return [];
    }
};

function authValidator(route) {
    switch (route) {
    case '/login':
        return [
            body('email')
                .exists().withMessage('Email is required')
                .isEmail().withMessage('Email is in invalid format'),
            body('password')
                .exists().withMessage('Password is required')
                .isLength({ min: 8 }).withMessage('Password should be 8 characters long')
                .matches(/\d/).withMessage('Password must contain a number')
        ];
    case '/register':
        return [
            body('email')
                .exists().withMessage('Email is required')
                .isEmail().withMessage('Email is not in valid format'),
            body('subscribers', 'Subscribers is required').exists()
                .isArray().withMessage('Subscribers should be Array'),
            body('subscribers.*.holder')
                .exists().withMessage('Subscribers.Holder is required')
                .isString().withMessage('Subscribers.Holder should be String'),
            body('subscribers.*.email')
                .exists().withMessage('Subscribers.Email is required')
                .isString().withMessage('Subscribers.Email should be String'),
            body('password')
                .exists().withMessage('Password is required')
                .isLength({ min: 8 }).withMessage('Password should be 8 characters long')
                .matches(/\d/).withMessage('Password must contain a number'),
            body('nic')
                .exists().withMessage('NIC is required')
                .isString().withMessage('NIC should be String')
                .isLength({ min: 10, max: 12 }).withMessage('NIC should be between 10 to 12 characters long'),
            body('contactNumber')
                .exists().withMessage('Contact number is required')
                .isString().withMessage('Contact number should be String'),
            body('supplier').exists().withMessage('Supplier is required')
                .isString().withMessage('Supplier should be String'),
            body('tariff').exists().withMessage('Tariff is required')
                .isString().withMessage('Tariff should be String'),
            body('accountNumber').exists().withMessage('Account number is required')
                .isNumeric().withMessage('Account number should be Number')
                .isLength({ min: 10, max: 10 }).withMessage('Account number should be 10 characters long'),
            body('devices', 'Devices is required').exists()
                .isArray().withMessage('Devices should be Array'),
            body('devices.*.floor')
                .exists().withMessage('Devices.Floor is required')
                .isString().withMessage('Devices.Floor should be String'),
            body('devices.*.description')
                .exists().withMessage('Devices.Description is required')
                .isString().withMessage('Devices.Description should be String'),
            body('devices.*.deviceId')
                .exists().withMessage('Devices.DeviceId is required')
                .isMACAddress().withMessage('Devices.DeviceId should be MAC address'),
            body('devices.*.slaveId')
                .exists().withMessage('Devices.SlaveId is required')
                .isNumeric().withMessage('Devices.SlaveId should be Number')
        ];
    default:
        return [];
    }
}

function pgsbValidator(route) {
    switch (route) {
    //todo: add query parameter validators
    case '/payloads':
        return [
            body('currentRound')
                .exists().withMessage('Current round is required')
                .isNumeric().withMessage('Current round should be Number'),
            body('current')
                .exists().withMessage('Current is required')
                .isNumeric().withMessage('Current should be Number'),
            body('voltage')
                .exists().withMessage('Voltage is required')
                .isNumeric().withMessage('Voltage should be Number'),
            body('power')
                .exists().withMessage('Power is required')
                .isNumeric().withMessage('Power should be Number'),
            body('frequency')
                .exists().withMessage('Frequency is required')
                .isNumeric().withMessage('Frequency should be Number'),
            body('totalPower')
                .exists().withMessage('Total power is required')
                .isNumeric().withMessage('Total power should be Number'),
            body('importPower')
                .exists().withMessage('Import power is required')
                .isNumeric().withMessage('Import power should be Number'),
            body('exportPower')
                .exists().withMessage('Export power is required')
                .isNumeric().withMessage('Export power should be Number'),
            body('powerFactor')
                .exists().withMessage('Power factor is required')
                .isNumeric().withMessage('Power factor should be Number'),
            body('rssi')
                .exists().withMessage('RSSI is required')
                .isNumeric().withMessage('RSSI should be Number')
        ];
    case '/errors':
        return [
            body('error')
                .exists().withMessage('Error is required')
                .isString().withMessage('Error should be String'),
            body('rssi')
                .exists().withMessage('RSSI is required')
                .isNumeric().withMessage('RSSI should be Number'),
            body('wifiFailCount')
                .exists().withMessage('Wifi fail count is required')
                .isNumeric().withMessage('Wifi fail count should be Number'),
            body('httpFailCount')
                .exists().withMessage('Http fail count is required')
                .isNumeric().withMessage('Http fail count should be Number')
        ];
    default:
        return [];
    }
}

function pvsbValidator(route) {
    switch (route) {
    case '/payloads':
        return [];
    default:
        return [];
    }
}

function consumersValidator(method) {
    switch (method) {
    case 'PUT':
        return [
            body('email')
                .exists().withMessage('Email is required')
                .isEmail().withMessage('Email is not in valid format'),
            body('subscribers', 'Subscribers is required').exists()
                .isArray().withMessage('Subscribers should be Array'),
            body('subscribers.*.holder')
                .exists().withMessage('Subscribers.Holder is required')
                .isString().withMessage('Subscribers.Holder should be String'),
            body('subscribers.*.email')
                .exists().withMessage('Subscribers.Email is required')
                .isString().withMessage('Subscribers.Email should be String'),
            body('password')
                .exists().withMessage('Password is required')
                .isLength({ min: 8 }).withMessage('Password should be 8 characters long')
                .matches(/\d/).withMessage('Password must contain a number'),
            body('nic')
                .exists().withMessage('NIC is required')
                .isString().withMessage('NIC should be String')
                .isLength({ min: 10, max: 12 }).withMessage('NIC should be between 10 to 12 characters long'),
            body('contactNumber')
                .exists().withMessage('Contact number is required')
                .isString().withMessage('Contact number should be String'),
            body('supplier').exists().withMessage('Supplier is required')
                .isString().withMessage('Supplier should be String'),
            body('tariff').exists().withMessage('Tariff is required')
                .isString().withMessage('Tariff should be String'),
            body('accountNumber').exists().withMessage('Account number is required')
                .isNumeric().withMessage('Account number should be Number')
                .isLength({ min: 10, max: 10 }).withMessage('Account number should be 10 characters long'),
            body('devices', 'Devices is required').exists()
                .isArray().withMessage('Devices should be Array'),
            body('devices.*.floor')
                .exists().withMessage('Devices.Floor is required')
                .isString().withMessage('Devices.Floor should be String'),
            body('devices.*.description')
                .exists().withMessage('Devices.Description is required')
                .isString().withMessage('Devices.Description should be String'),
            body('devices.*.deviceId')
                .exists().withMessage('Devices.DeviceId is required')
                .isMACAddress().withMessage('Devices.DeviceId should be MAC address'),
            body('devices.*.slaveId')
                .exists().withMessage('Devices.SlaveId is required')
                .isNumeric().withMessage('Devices.SlaveId should be Number')
        ];
    default:
        return [];
    }
}

function summaryValidator(method) {
    switch (method) {
    case HttpMethod.POST:
        return [];
    default:
        return [];
    }
}

function reportsValidator(route) {
    switch (route) {
    case '/reports/generate':
        return [];
    case '/reports/dispatch':
        return [];
    case '/reports/:_id':
        return [
            param('_id')
                .exists().withMessage('Invoice ID is required')
                .isMongoId().withMessage('Invoice ID should be Mongo ID')
        ];
    default:
        return [];
    }
}

function forecastValidator(route) {
    switch (route) {
    case '/reports/generate':
        return [];
    default:
        return [];
    }
}

module.exports = { validate, fieldStateChecker };
