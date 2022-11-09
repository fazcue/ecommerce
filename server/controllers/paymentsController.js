const [ getTotalPrice ] = require('../utils/products')
const mercadopago = require('../services/mercadoPago')
const sendMail = require('../services/sendMail')

const db = require('../models')
const { Orders } = db

const BASE_URL = process.env.BASE_URL
const CLIENT_URL = process.env.CLIENT_URL

const paymentsController = {
    mercadopago: async (req, res) => {
        const { id, order, status } = req.body

        //MP ID
        let mp_id = null

        //get total
        const subTotal = await getTotalPrice(order.products)
        const shipping = order.shipping.price
        const total = subTotal + shipping

        if (subTotal > 0) {
            const preference = {
                items: [
                    {
                        title: order.type,
                        quantity: 1,
                        currency_id: 'ARS',
                        unit_price: total
                    }
                ],
                back_urls: {
                    success: `${BASE_URL}/payments/mercadopago/success/${id}`,
                    failure: `${BASE_URL}/payments/mercadopago/failure/${id}`,
                    pending: `${BASE_URL}/payments/mercadopago/pending/${id}`
                },
                // notification_url: `${BASE_URL}/payments/mercadopago/webhook`,
                payment_methods: {
                    excluded_payment_methods: [
                        {
                            id: "master"
                        }
                    ],
                    excluded_payment_types: [
                        {
                            id: "ticket"
                        }
                    ],
                },
                auto_return: "approved",
            }

            const response = await mercadopago.preferences.create(preference)
            mp_id = response.body.id
        }

        if (mp_id) {

            //Save preference_id
            const updated = await Orders.update({ payment: mp_id }, { where: { id } })

            if (updated) {
                console.log('UPDATEDDD')
            } else {
                console.log('NOT UPDATEDD')
            }

            return res.json({mp_id, total})
        }

        return res.status(503).json({error: 'Can`t get MP ID'})
    },
    mercadopagoSuccess: async (req, res) => {
        const { id } = req.params

        //Data received from MercadoPago after payment
        const {
            collection_id,
            collection_status,
            payment_id,
            status,
            external_reference,
            payment_type,
            merchant_order_id,
            preference_id,
            site_id,
            processing_mode,
            merchant_account_id
        } = req.query

        const paymentData = {
            collection_id,
            collection_status,
            payment_id,
            status,
            external_reference,
            payment_type,
            merchant_order_id,
            preference_id,
            site_id,
            processing_mode,
            merchant_account_id
        }

        //Update order
        if (status === 'approved') {
            //1st, get user email
            const order = await Orders.findOne({ where: { payment: preference_id }})

            //2nd, update
            const updated = await Orders.update({ status: status, payment: JSON.stringify(paymentData) }, { where: { payment: preference_id } })

            //3rd, send confirmation email
            if (updated && order) {
                //send payment success email
                await sendMail(order.email, `Order #${order.id} confirmed`, '', `<p>Order paid!</p>`)
            }

            return res.redirect(`${CLIENT_URL}/dashboard?id=${id}&status=${status}&collection_id=${collection_id}`)
        }

        return res.redirect(`${CLIENT_URL}/dashboard?id=${id}&status=failure&collection_id=${collection_id}`)
    },
    mercadopagoPending: async (req, res) => {
        const { id } = req.params

        //Data received from MercadoPago after payment
        const {
            collection_id,
            collection_status,
            payment_id,
            status,
            external_reference,
            payment_type,
            merchant_order_id,
            preference_id,
            site_id,
            processing_mode,
            merchant_account_id
        } = req.query

        const paymentData = {
            collection_id,
            collection_status,
            payment_id,
            status,
            external_reference,
            payment_type,
            merchant_order_id,
            preference_id,
            site_id,
            processing_mode,
            merchant_account_id
        }

        //Update order
        if (status === 'in_process') {
            //1st, get user email
            const order = await Orders.findOne({ where: { payment: preference_id }})

            //2nd, update
            const updated = await Orders.update({ status: status, payment: JSON.stringify(paymentData) }, { where: { payment: preference_id } })

            //3rd, send confirmation email
            if (updated && order) {
                //send payment success email
                await sendMail(order.email, `Order #${order.id} payment pending`, '', `<p>Order payment is pending. We will send you another email when payment is completed.</p>`)
            }

            return res.redirect(`${CLIENT_URL}/dashboard?id=${id}&status=${status}&collection_id=${collection_id}`)
        }

        return res.redirect(`${CLIENT_URL}/dashboard?id=${id}&status=failure&collection_id=${collection_id}`)
    },
    mercadopagoFailure: async (req, res) => {
        const { id } = req.params
        
        //Data received from MercadoPago after payment
        const {
            collection_id,
            collection_status,
            payment_id,
            status,
            external_reference,
            payment_type,
            merchant_order_id,
            preference_id,
            site_id,
            processing_mode,
            merchant_account_id
        } = req.query

        const paymentData = {
            collection_id,
            collection_status,
            payment_id,
            status,
            external_reference,
            payment_type,
            merchant_order_id,
            preference_id,
            site_id,
            processing_mode,
            merchant_account_id
        }

        //1st, get user email
        const order = await Orders.findOne({ where: { payment: preference_id }})

        //2nd, update
        const updated = await Orders.update({ status: status, payment: JSON.stringify(paymentData) }, { where: { payment: preference_id } })

        //3rd, send confirmation email
        if (updated && order) {
            //send payment success email
            await sendMail(order.email, `Order #${order.id} payment failure`, '', `<p>Order payment failed.</p>`)
        }

        res.redirect(`${CLIENT_URL}/dashboard?id=${id}&status=${status}&collection_id=${collection_id}`)
    },
    mercadopagoWebhook: async (req, res) => {
        if (req.method === "POST") {
            let body = ""
            req.on("data", chunk => {
                body += chunk.toString()
            })
            req.on("end", () => {  
                console.log(body, "webhook response")
                res.end("ok")
            })
        }
        return res.status(200)
    }
}

module.exports = paymentsController
