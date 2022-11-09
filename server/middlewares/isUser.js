const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

const isUser = (req, res, next) => {
    //get token from header
    const authHeader = req.headers['authorization']
    const token = authHeader?.split(' ')[1]

    //If no token, send error 404 (No found)
    if (!token) {
        return res.status(404).send('No token found')
    }

    //verify token, if valid send user data from it
    try {
        jwt.verify(token, JWT_SECRET)
        next()
    } catch(err) {
        res.status(401).json('Invalid token')
    }
}

module.exports = isUser
