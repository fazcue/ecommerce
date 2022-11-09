const express = require('express')
const router = express.Router()

const isUser = require('../middlewares/isUser')

const paymentsController = require('../controllers/paymentsController')

router.post('/mercadopago', isUser, paymentsController.mercadopago)
router.get('/mercadopago/success/:id', paymentsController.mercadopagosuccess)
router.get('/mercadopago/pending/:id', paymentsController.mercadopagopending)
router.get('/mercadopago/failure/:id', paymentsController.mercadopagofailure)
router.post("/mercadopago/webhook", paymentsController.mercadopagowebhook)


module.exports = router
