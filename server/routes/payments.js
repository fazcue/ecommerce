const express = require('express')
const router = express.Router()

const paymentsController = require('../controllers/paymentsController')

const isUser = require('../middlewares/isUser')

router.post('/mercadopago', isUser, paymentsController.mercadopago)
router.get('/mercadopago/success/:id', paymentsController.mercadopagoSuccess)
router.get('/mercadopago/pending/:id', paymentsController.mercadopagoPending)
router.get('/mercadopago/failure/:id', paymentsController.mercadopagoFailure)
router.post("/mercadopago/webhook", paymentsController.mercadopagoWebhook)

module.exports = router
