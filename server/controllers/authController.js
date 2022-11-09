const db = require('../models')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const signToken = require('../services/signToken')
const sendMail = require('../services/sendMail')

const { Users } = db

const JWT_SECRET = process.env.JWT_SECRET
const CLIENT_URL = process.env.CLIENT_URL

const authController = {
    register: async (req, res) => {
        //Check for errors
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        const { firstName, lastName, email, password } = req.body
        const salt = bcrypt.genSaltSync(11)

        //Create user
        try {
            const [user, created] = await Users.findOrCreate({
                where: { email },
                defaults: {
                  firstName: firstName,
                  lastName: lastName,
                  email: email,
                  address: {},
                  password: bcrypt.hashSync(password, salt)
                }
            })

            //return token if created
            if (created) {
                const token = signToken(user)

                //send welcome message
                await sendMail(user.email, 'Welcome!', '', `<p>This is a welcome email message.</p>`)

                return res.status(200).json({token})
            } else {
                return res.status(200).send('User already registered')
            }
        } catch (error) {
            return res.status(400).json(error)
        }
    },
    login: async (req, res) => {
        //Check for errors
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        const { email, password } = req.body

        //Return token
        try {
            const user = await Users.findOne({ where: { email }})

            if (bcrypt.compareSync(password, user.password)) {
                const userData = {...user.dataValues}
                delete userData.password
                const token = signToken(userData)
                return res.status(200).json({token})
            } else {
                return res.status(400).send('Invalid data')
            }
        } catch (error) {
            return res.status(400).send('User does not exist')
        }
    },
    recover: async (req, res) => {
        //Check for errors
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        const { email } = req.body

        //Return recover token
        try {
            const user = await Users.findOne({ where: { email }})

            if (user) {
                const salt = bcrypt.genSaltSync(11)
                const recoverToken = bcrypt.hashSync(email, salt)
                const recoverExpires = Date.now() + 3600000 //expires in an hour

                const updated = await Users.update({ recoverToken: recoverToken, recoverExpires: recoverExpires }, { where: { email } })

                if (updated) {
                    try {
                        const result = await sendMail(email, 'Reset your password', '', `<p>If you want to reset your password, please follow this link: ${CLIENT_URL}/recover?token=${recoverToken}</p>`)
                        return res.status(200).send(result)
                    } catch (error) {
                        return res.status(401).send(error)
                    }
                } else {
                    return res.status(401).send({error: 'Recover email not sent.'})
                }
            }
        } catch (error) {
            return res.status(400).send('User does not exist')
        }
    },
    recoverToken: async (req, res) => {
        const { recoverToken } = req.body

        try {
            const user = await Users.findOne({ where: { recoverToken }})

            //compare dates
            const now = new Date()
            const expires = new Date(user.recoverExpires)

            if (expires > now) {
                return res.status(200).send(true)
            }
            
            return res.status(200).send(false)
        } catch (error) {
            return res.status(401).send({error: {
                message: 'Invalid token'
            }})
        }
    },
    recoverPassword: async (req, res) => {
        const { recoverToken, newPassword } = req.body
        const salt = bcrypt.genSaltSync(11)

        try {
            //1st: get user
            const user = await Users.findOne({ where: { recoverToken }})

            //2nd: update user
            const updated = await Users.update({
                recoverToken: null,
                recoverExpires: null,
                password: bcrypt.hashSync(newPassword, salt)
            },{
                where: { recoverToken }
            })

            if (updated) {
                try {
                    const result = await sendMail(user.email, 'Password updated', '', `<p>You can now login with your new password.</p>`)
                    return res.status(200).send(result)
                } catch (error) {
                    return res.status(401).send(error)
                }
            } else {
                return res.status(401).send({error: 'Password not reset'})
            }
        } catch (error) {
            return res.status(401).send(error)
        }
    },
    currentUser: (req, res) => {
        //get token from header
        const authHeader = req.headers['authorization']
        const token = authHeader?.split(' ')[1]
    
        const decoded = jwt.verify(token, JWT_SECRET)
        return res.send(decoded)
    }
}

module.exports = authController
