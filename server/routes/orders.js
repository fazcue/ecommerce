const express = require('express')
const router = express.Router()

const isUser = require('../middlewares/isUser')

const ordersController = require('../controllers/ordersController')
// const ordersValidator = require('../middlewares/ordersValidator')

router.get('/', isUser, ordersController.getAll)
router.post('/', isUser, ordersController.new)
router.delete('/:id', isUser, ordersController.delete)

module.exports = router
