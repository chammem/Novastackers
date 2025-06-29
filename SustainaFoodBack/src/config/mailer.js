const nodemailer= require('nodemailer');


const transporter = nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.EMAIL_PASS

            }
            })

async function sendMail(to, subject, text) {
            const mailOptions = {
                 from: process.env.EMAIL_USER,
                to,
                subject,
                text
            };
            
            return await transporter.sendMail(mailOptions);
            }
module.exports = sendMail;