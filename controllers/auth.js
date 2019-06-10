// 401 not authenticated
const { validationResult } = require('express-validator/check')

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user')

exports.register = (req, res, next) => {
	console.log('registering user')
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data=errors.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bcrypt.hash(password, 12)
    .then(hashedPw=>{
        const user = new User({
           email:email,
           password: hashedPw,
           name:name, 
        })
        return user.save()
    })
    .then(result=>{
        const token = jwt.sign({
            email: result.email,
            userId: result._id.toString()
        }, 'AsEcRetStrINgToImproveSecurITYtheLonGerTHEbettER', {
				expiresIn: "10h"
            });
        res.status(201).json({
            message: 'User created!!!', 
            token:token,
            userId:result._id,
        })
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
}

exports.login = (req, res, next) => {
    console.log('here')
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({email:email})
        .then(user=>{
            if (!user){
                const error = new Error('User not found!!!');
                error.statusCode = 401;
                throw error;
            }
            loadedUser=user;
            return bcrypt.compare(password, user.password)
        })
        .then(isEqual=>{
            if(!isEqual){
                const error = new Error('Wrong password!!!');
                error.statusCode = 401;
                throw error; 
            }
            const token = jwt.sign({
                email:loadedUser.email,
                userId:loadedUser._id.toString()
            },'AsEcRetStrINgToImproveSecurITYtheLonGerTHEbettER',{
                expiresIn: "10h"
            });
            console.log(email, ' signed in')
            res.status(201).json({
                message: 'User signed in!!!', 
                token: token,
                userId: loadedUser._id.toString(),
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.updateUserStatus = (req, res, next) => {
    newStatus = req.body.status;
    User.findById(req.userId)
    .then(user=>{
        if(!user){
            const error = new Error('No user found!!!');
            error.statusCode = 404;
            throw error; 
        }
        user.status = newStatus;
        return user.save()
    })
    .then(result=>{
        res.status(200).json({
            message: 'user updated',
        })
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
}

exports.getUserStatus = (req, res, next) => {
    User.findById(req.userId)
        .then(user => {
            if (!user) {
                const error = new Error('No user found!!!');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({
                status: user.status,
            })

        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.resetPassword = (req, res, next) => {
    res.status(200).json({
        message: 'Feature not yet available!!!',
    })
}


