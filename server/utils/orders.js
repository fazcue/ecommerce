const db = require('../models')
const { Orders } = db

const updateOrderStatus = async (preference_id, status) => {
    return await Orders.update({ status }, { where: {
        payment: { preference_id: preference_id }
    } })
}

const updateOrderPayment = async (id, mp_id) => {
    return await Orders.update({ status: 'tessst'}, { where: {
        id
    } })
}

module.exports = [
    updateOrderStatus,
    updateOrderPayment
]
