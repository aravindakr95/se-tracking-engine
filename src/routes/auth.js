import express from 'express';

import authenticateToGenerate from '../middlewares/auth-admin';

import authController from '../auth/auth-controller';
import { validate, fieldStateChecker } from '../middlewares/field-validator';

let authRouter = express.Router();

authRouter.post('/login',
    validate('auth', '/login', 'POST'),
    fieldStateChecker,
    (req, res) => {
        authController(req, res);
    });

authRouter.post('/register',
    authenticateToGenerate,
    validate('auth', '/register', 'POST'),
    fieldStateChecker,
    (req, res) => {
        authController(req, res);
    });

module.exports = authRouter;
