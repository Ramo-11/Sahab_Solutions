const { isEmail } = require('validator');
const nodemailer = require('nodemailer');
const { encode } = require('he');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

const subscribeToNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email || !isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.',
            });
        }

        // Call Beehiiv API
        const response = await fetch(
            `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}/subscriptions`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
                },
                body: JSON.stringify({
                    email: email,
                    reactivate_existing: false,
                    send_welcome_email: false, // Disabled - we're sending our own
                    utm_source: 'website',
                    utm_medium: req.body.source || 'unknown',
                }),
            }
        );

        const data = await response.json();

        if (response.ok) {
            // Send instant welcome email
            sendWelcomeEmail(email).catch((err) => {
                console.error('Failed to send welcome email:', err);
            });

            notifyAdminNewSubscription(email, req.body.source).catch((err) => {
                console.error('Failed to notify admin:', err);
            });

            return res.json({
                success: true,
                message: 'Successfully subscribed to our newsletter!',
            });
        } else {
            // Handle specific Beehiiv errors
            if (data.error && data.error.includes('already exists')) {
                return res.status(400).json({
                    success: false,
                    message: 'This email is already subscribed.',
                });
            }
            throw new Error('Subscription failed');
        }
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong. Please try again later.',
        });
    }
};

async function sendWelcomeEmail(email) {
    const mailOptions = {
        from: process.env.MAIL_USER,
        to: email,
        subject: 'Welcome to Sahab Solutions Newsletter',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
                <div style="background: linear-gradient(135deg, #7117f2 0%, #1e1f63 100%); padding: 30px; border-radius: 10px; color: white; margin-bottom: 20px;">
                    <h2 style="margin: 0;">Welcome to Sahab Solutions</h2>
                </div>
                <div style="background: white; padding: 30px; border-radius: 10px; border: 1px solid #e2e8f0;">
                    <p>Thank you for subscribing to our newsletter!</p>
                    <p>You'll now receive updates about:</p>
                    <ul style="line-height: 1.8; color: #64748b;">
                        <li>New product launches and features</li>
                        <li>Technology insights and best practices</li>
                        <li>Exclusive offers and early access</li>
                        <li>Case studies and success stories</li>
                    </ul>
                    <p>We're excited to have you as part of our community.</p>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #7117f2; margin: 25px 0;">
                        <p style="margin: 0; color: #1e1f63; font-weight: 600;">Stay tuned for our next update!</p>
                    </div>
                    <p>Best regards,<br><strong>Sahab Solutions Team</strong></p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
                    <p style="font-size: 0.85rem; color: #64748b;">
                        Questions? Reply to this email or contact us at <a href="mailto:sahab@sahab-solutions.com" style="color: #7117f2;">sahab@sahab-solutions.com</a>
                    </p>
                </div>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
}

async function notifyAdminNewSubscription(email, source) {
    const mailOptions = {
        from: process.env.MAIL_USER,
        to: 'sahab@sahab-solutions.com',
        subject: 'New Newsletter Subscription',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
                <div style="background: linear-gradient(135deg, #7117f2 0%, #1e1f63 100%); padding: 30px; border-radius: 10px; color: white; margin-bottom: 20px;">
                    <h2 style="margin: 0;">New Newsletter Subscriber</h2>
                </div>
                <div style="background: white; padding: 30px; border-radius: 10px; border: 1px solid #e2e8f0;">
                    <p><strong>Email:</strong> ${encode(email)}</p>
                    <p><strong>Source:</strong> ${encode(source || 'unknown')}</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                </div>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { subscribeToNewsletter };
