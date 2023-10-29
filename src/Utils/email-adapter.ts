import nodemailer from "nodemailer";

export const emailAdapter = {
    async sendEmail (email: string, subject: string, message: string){
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 't85819000@gmail.com',
                pass: 'iieasludfwvnlcfv'
            },
        })

        await transporter.sendMail({
            from: 't85819000@gmail.com',
            to: email,
            subject,
            html: message
        })
    },
}