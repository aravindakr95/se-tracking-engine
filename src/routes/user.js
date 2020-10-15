import express from 'express';
import userController from '../users/user-controller';
import filterRoute from '../middlewares/route-filter';
import { fieldStateChecker, validate } from '../middlewares/field-validator';

let userRouter = express.Router();

/* GET user by id */
userRouter.get('/:id', filterRoute, (req, res) => {
    userController(req, res);
});

/* GET all users */
userRouter.get('/', filterRoute, (req, res) => {
    userController(req, res);
});

/* UPDATE user */
userRouter.put('/',
    filterRoute,
    validate('users', '/', 'PUT'),
    fieldStateChecker,
    (req, res) => {
        userController(req, res);
    });

/* DELETE user */
userRouter.delete('/',
    filterRoute,
    validate('users', '/', 'DELETE'),
    fieldStateChecker,
    (req, res) => {
        userController(req, res);
    });

module.exports = userRouter;
