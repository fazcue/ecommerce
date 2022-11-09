const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET

const signToken = (payload) => {
    const token = jwt.sign({ payload }, JWT_SECRET, {
		algorithm: "HS256",
		expiresIn: '6h',
	})

    return token
}

module.exports = signToken
