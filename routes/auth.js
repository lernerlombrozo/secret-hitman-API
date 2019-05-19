const express = require('express');
const { body } = require('express-validator/check');

const authController = require('../controllers/auth');

const User = require('../models/user');

const isAuth = require('../middleware/is-auth')

const router = express.Router();

router.put('/register', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email!!!')
        .custom((value, {req}) =>{
            return User.findOne({email:value}).then(userDoc=>{
                if (userDoc){
                    return Promise.reject('Email already in use!!!')
                }
            })
        })
        .normalizeEmail(),
    body('password')
        .trim()
        .isLength({
            min: 5
        }),
    body('name')
        .trim()
        .not().
        isEmpty()

],
 authController.register);

router.post('/login', authController.login);

router.get('/status', isAuth, authController.getUserStatus);

router.put('/status', [
    body('status')
        .trim()
        .not()
        .isEmpty()
],isAuth, authController.updateUserStatus);

router.post('/password', authController.resetPassword);

module.exports = router;