const db = require('../models')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const signToken = require('../services/signToken')
const sendMail = require('../services/sendMail')

const { Users } = db

const JWT_SECRET = process.env.JWT_SECRET

const authController = {
    register: async (req, res) => {
        //Check for errors
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        const { firstName, lastName, email, password } = req.body

        console.log('Registering...', firstName, lastName, email);

        const salt = bcrypt.genSaltSync(11)

        //Create user
        try {
            const [user, created] = await Users.findOrCreate({
                where: { email: email },
                defaults: {
                  firstName: firstName,
                  lastName: lastName,
                  email: email,
                  address: {},
                  password: bcrypt.hashSync(password, salt)
                }
            })

            console.log('user', user, created);

            //return token if created
            if (created) {
                const token = signToken(user)
                return res.status(200).json({token})
            } else {
                return res.status(200).send('Usuario ya registrado')
            }
        } catch (error) {
            console.log('Problem register', error);
            return res.status(400).json(error)
        }
    },
    login: async (req, res) => {
        //Check for errors
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        //Return token
        try {
            const user = await Users.findOne({ where: { email: req.body.email }})

            if (bcrypt.compareSync(req.body.password, user.password)) {
                const userData = {...user.dataValues}
                delete userData.password
                const token = signToken(userData)
                return res.status(200).json({token})
            } else {
                return res.status(400).send('Datos inválidos')
            }
        } catch (error) {
            return res.status(400).send('Usuario inexistente')
        }
    },
    recover: async (req, res) => {
        //Check for errors
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        //Return recover token
        try {
            const { email } = req.body
            const user = await Users.findOne({ where: { email }})

            if (user) {
                const salt = bcrypt.genSaltSync(11)
                const recoverToken = bcrypt.hashSync(email, salt)
                const recoverExpires = Date.now() + 3600000 //expires in an hour

                const updated = await Users.update({ recoverToken: recoverToken, recoverExpires: recoverExpires }, { where: { email } })

                if (updated) {
                    try {
                        const result = await sendMail(email, 'prueba nodemailer', 'este mensaje es de prueba', `<p>enlace: ${recoverToken}</p>`)
                        return res.status(200).send(result)
                    } catch (error) {
                        return res.status(401).send(error)
                    }
                } else {
                    return res.status(401).send({error: 'Recover email not sent.'})
                }
            }
        } catch (error) {
            return res.status(400).send('Usuario inexistente')
        }
    },
    recoverToken: async (req, res) => {
        try {
            const { recoverToken } = req.body

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
        try {
            const { recoverToken, newPassword } = req.body
            const salt = bcrypt.genSaltSync(11)

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
                    const result = await sendMail(user.email, 'Contraseña actualizada', 'contraseña actualizada', `<p>Ya puedes utilizar tu nueva contraseña :)</p>`)
                    return res.status(200).send(result)
                } catch (error) {
                    return res.status(401).send(error)
                }
            } else {
                return res.status(401).send({error: 'Password not reset'})
            }
        } catch (error) {
            console.log('error', error);
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
