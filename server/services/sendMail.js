const nodemailer = require('nodemailer')

const sendMail = async (to, subject, text, html) => {
    const config = { 
        service: 'gmail',
        auth: {
            user: process.env.SENDMAIL_USER,
            pass: process.env.SENDMAIL_PASSWORD
        }
    }

    const transport = nodemailer.createTransport(config)

    const msg = {
        to,
        from: process.env.SENDMAIL_USER,
        subject,
        text,
        html,
    }

    try {
        const result = await transport.sendMail(msg)
        return result
    } catch (error) {
        console.log(error)
        return error
    }
}

module.exports = sendMail
