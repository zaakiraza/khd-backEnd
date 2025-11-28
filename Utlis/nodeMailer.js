import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendEmail = async (emailOptions) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    // Support both old format (to, subject, text) and new format (object)
    let mailOptions;
    
    if (typeof emailOptions === 'string') {
        // Old format: sendEmail(to, subject, text)
        mailOptions = {
            from: process.env.MAIL_USER,
            to: arguments[0],
            subject: arguments[1],
            text: arguments[2],
        };
    } else {
        // New format: sendEmail({ to, subject, text, html })
        mailOptions = {
            from: process.env.MAIL_USER,
            to: emailOptions.to,
            subject: emailOptions.subject,
            text: emailOptions.text || '',
            html: emailOptions.html || emailOptions.text || '',
        };
    }

    await transporter.sendMail(mailOptions);
};