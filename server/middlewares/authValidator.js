const { body } = require('express-validator')
// const db = require('../models')

// const { Users } = db

const authValidator = {
    register: [
        body('firstName').isString().isLength({ min: 2, max: 16 }).withMessage('Nombre debe tener entre 2 y 16 caracteres'),
        body('lastName').isString().isLength({ min: 2, max: 16 }).withMessage('Apellido debe tener entre 2 y 16 caracteres'),
        body('email').isEmail().withMessage('Email inválido'),
        body('password').isLength({ min: 8 }).withMessage('Contraseña debe tener al menos 8 caracteres')
    ],
    login: [
        body('email').isEmail().withMessage('Email inválido'),
        body('password').isLength({ min: 8 }).withMessage('Contraseña debe tener al menos 8 caracteres')
    ],
    recover: [
        body('email').isEmail().withMessage('Email inválido')
    ],
    recoverToken: [
        body('recoverToken').isString().withMessage('Token requerido')
    ],
    recoverPassword: [
        body('recoverToken').isString().withMessage('Token requerido'),
        body('newPassword').isLength({ min: 8 }).withMessage('Contraseña debe tener al menos 8 caracteres')
    ]
}

module.exports = authValidator
