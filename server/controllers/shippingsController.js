const db = require('../models')

const { Shippings } = db

const shippingsController = {
    get: async (req, res) => {
        const shippings = await Shippings.findAll({
            attributes: ["id", "name", "prices", "zones"]
        })
        return res.json(shippings)
    }
}

module.exports = shippingsController
