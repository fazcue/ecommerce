const express = require('express')
const router = express.Router()

const ordersController = require('../controllers/ordersController')

const isUser = require('../middlewares/isUser')

router.get('/', isUser, ordersController.get)
router.post('/', isUser, ordersController.create)
router.delete('/:id', isUser, ordersController.delete)

module.exports = router
