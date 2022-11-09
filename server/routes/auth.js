const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')
const authValidator = require('../middlewares/authValidator')

const isUser = require('../middlewares/isUser')

router.post('/login', authValidator.login, authController.login)
router.post('/register', authValidator.register, authController.register)
router.post('/recover', authValidator.recover, authController.recover)
router.post('/recover/token', authValidator.recoverToken, authController.recoverToken)
router.post('/recover/password', authValidator.recoverPassword, authController.recoverPassword)
router.get('/me', isUser, authController.currentUser)

module.exports = router
