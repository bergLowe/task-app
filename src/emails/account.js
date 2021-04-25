const sgMail = require('@sendgrid/mail');
const { text } = require('express');
// const sendGridAPIKey = ;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'sumer2000pasin@gmail.com',
        subject: 'Task Manager: Thank for Joining!',
        text: `Welcome ${name}, thank you for joining us. Now get your reminder all at one place. :)`
    })
}

const sendDeleteMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'sumer2000pasin@gmail.com',
        subject: 'Task Manger: Sorry to let you go.',
        text: `We are sorry to let you go, ${name}. Please us feedback where we lost you! :(`
    })
}

module.exports = {
    sendWelcomeMail,
    sendDeleteMail
}