const express = require('express')
const router = express.Router()

const shippingsController = require('../controllers/shippingsController')

router.get('/', shippingsController.getAll)

module.exports = router
