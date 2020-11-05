import express from 'express';
import consumerController from '../consumer/consumer-controller';
import filterRoute from '../middlewares/route-filter';
import { fieldStateChecker, validate } from '../middlewares/field-validator';

let consumerRouter = express.Router();

/* GET all consumers or specific consumer */
consumerRouter.get('/',
    filterRoute,
    (req, res) => {
        consumerController(req, res);
    });

/* UPDATE consumer */
consumerRouter.put('/',
    filterRoute,
    validate('consumers', '/', 'PUT'),
    fieldStateChecker,
    (req, res) => {
        consumerController(req, res);
    });

/* DELETE consumer */
consumerRouter.delete('/',
    filterRoute,
    (req, res) => {
        consumerController(req, res);
    });

module.exports = consumerRouter;
