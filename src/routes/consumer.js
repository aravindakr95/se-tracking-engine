import express from 'express';

import consumerController from '../consumer/consumer-controller';
import { fieldStateChecker, validate } from '../middlewares/field-validator';

import authenticateJWT from '../middlewares/auth';

let consumerRouter = express.Router();

/* GET all consumers or specific consumer */
consumerRouter.get('/',
    authenticateJWT,
    (req, res) => {
        consumerController(req, res);
    });

/* UPDATE consumer */
consumerRouter.put('/',
    authenticateJWT,
    validate('consumers', '/', 'PUT'),
    fieldStateChecker,
    (req, res) => {
        consumerController(req, res);
    });

/* DELETE consumer */
consumerRouter.delete('/',
    authenticateJWT,
    (req, res) => {
        consumerController(req, res);
    });

module.exports = consumerRouter;
