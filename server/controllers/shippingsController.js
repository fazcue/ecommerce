const db = require('../models')

const { Shippings } = db

const shippingsController = {
    getAll: async (req, res) => {
        const shippings = await Shippings.findAll({
            attributes: ["id", "name", "prices", "zones"]
        })
        return res.json(shippings)
    }
}

module.exports = shippingsController
