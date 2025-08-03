const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const sendContactEmails = async (contactData) => {
    const { name, email, service, message } = contactData;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    // Email to yourself
    const adminMailOptions = {
        from: process.env.MAIL_USER,
        to: 'sahab@sahab-solutions.com',
        subject: `New Contact Form: ${service}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
                <div style="background: linear-gradient(135deg, #7117f2 0%, #1e1f63 100%); padding: 30px; border-radius: 10px; color: white; margin-bottom: 20px;">
                    <h2 style="margin: 0;">New Contact Form Submission</h2>
                </div>
                <div style="background: white; padding: 30px; border-radius: 10px; border: 1px solid #e2e8f0;">
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Service:</strong> ${service}</p>
                    <p><strong>Message:</strong></p>
                    <div style="background: #f8fafc; padding: 15px; border-radius: 5px; border-left: 4px solid #7117f2;">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                </div>
            </div>
        `
    };

    // Thank you email to user
    const userMailOptions = {
        from: process.env.MAIL_USER,
        to: email,
        subject: 'Thank you for contacting Sahab Solutions',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
                <div style="background: linear-gradient(135deg, #7117f2 0%, #1e1f63 100%); padding: 30px; border-radius: 10px; color: white; margin-bottom: 20px;">
                    <h2 style="margin: 0;">Thank You for Reaching Out!</h2>
                </div>
                <div style="background: white; padding: 30px; border-radius: 10px; border: 1px solid #e2e8f0;">
                    <p>Hi ${name},</p>
                    <p>Thank you for your interest in our <strong>${service}</strong> services. We've received your message and will get back to you within 24 hours.</p>
                    <p>Here's what you submitted:</p>
                    <div style="background: #f8fafc; padding: 15px; border-radius: 5px; border-left: 4px solid #7117f2;">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                    <p>Best regards,<br>Sahab Solutions Team</p>
                </div>
            </div>
        `
    };

    await Promise.all([
        transporter.sendMail(adminMailOptions),
        transporter.sendMail(userMailOptions)
    ]);
};

module.exports = {
    sendContactEmails
};