import express from 'express';
import consumerController from '../consumer/consumer-controller';
import { fieldStateChecker, validate } from '../middlewares/field-validator';

let consumerRouter = express.Router();

/* GET all consumers or specific consumer */
consumerRouter.get('/',
    (req, res) => {
        consumerController(req, res);
    });

/* UPDATE consumer */
consumerRouter.put('/',
    validate('consumers', '/', 'PUT'),
    fieldStateChecker,
    (req, res) => {
        consumerController(req, res);
    });

/* DELETE consumer */
consumerRouter.delete('/',
    (req, res) => {
        consumerController(req, res);
    });

module.exports = consumerRouter;
