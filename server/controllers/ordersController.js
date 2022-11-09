const db = require('../models')
const jwt = require('jsonwebtoken')

const { Orders } = db

const JWT_SECRET = process.env.JWT_SECRET

const ordersController = {
    getAll: async (req, res) => {
        //get token from header
        const authHeader = req.headers['authorization']
        const token = authHeader?.split(' ')[1]

        const decoded = jwt.verify(token, JWT_SECRET)
        const email = decoded.payload.email

        const userOrders = await Orders.findAll({
            where: {email},
            attributes: ["id", "order", "status"]
        })
        return res.json(userOrders)
    },
    new: async (req, res) => {
        //get token from header
        const authHeader = req.headers['authorization']
        const token = authHeader?.split(' ')[1]

        const decoded = jwt.verify(token, JWT_SECRET)
        const email = decoded.payload.email

        //Order
        const { order } = req.body

        console.log('New ORDER', order, email)

        const newOrder = await Orders.create({ email: email, order: order, createdAt: new Date(), updatedAt: new Date(), status: 'unpaid', payment: null })

        return res.json(newOrder)
    },
    delete: async (req, res) => {
        const { id } = req.params
        try {
            const deleted = await Orders.destroy({ where: { id } })

            if (deleted) {
                res.status(200).json(true)
            } else {
                res.status(404).json({ error: 'Order not found' })
            }
        } catch (error) {
            res.status(503).json(error)
        }
    }
}

module.exports = ordersController
