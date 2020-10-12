const sgMail =require('@sendgrid/mail')
const sgMailAPIKey= process.env.sendGridAPIKey
sgMail.setApiKey(sgMailAPIKey)
//console.log(process.env.companyEmail)
const sendWelcomeEmail=(email,name)=>{
    sgMail.send({
        to: email,
        from:process.env.companyEmail,
        subject: 'Thanks for joining Task Manager',
        text: `Welcome to the Task Manager App ${name}. We hope you like it here.`

    })
}

const sendGoodbyeEmail=(email,name)=>{
    sgMail.send({
        to: email,
        from:process.env.companyEmail,
        subject: `We will miss you ${name.split(' ')[0]}`,
        text: `Hey ${name}, Please share your valuable feedback about our App. We'll try to make it better.`
    })
}

module.exports={
    sendWelcomeEmail,
    sendGoodbyeEmail
}

