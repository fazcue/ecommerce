const db = require('../models')

const { Products } = db

const productsController = {
    getAll: async (req, res) => {
        const products = await Products.findAll({
            attributes: ["id", "name", "description", "price", "weight", "type"]
        })
        return res.json(products)
    }
}

module.exports = productsController
