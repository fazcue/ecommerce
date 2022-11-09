const db = require('../models')
const { Products } = db

const findPrice = async (name) => {
    const product = await Products.findOne({ where: {
        name
    } })

    return product.price
}

const getTotalPrice = async (products) => {
    let total = 0

    //Get products price
    await Promise.all(
        products.map(async (product) => {
            const price = await findPrice(product.name)
            total += (price * product.quantity)
        })
    )

    return total
}

module.exports = [
    getTotalPrice
]
