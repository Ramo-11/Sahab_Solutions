const { isEmail } = require('validator');

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
                    send_welcome_email: true,
                    utm_source: 'website',
                    utm_medium: req.body.source || 'unknown',
                }),
            }
        );

        const data = await response.json();

        if (response.ok) {
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
            console.log(`Error: ${JSON.stringify(data)}`);
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

module.exports = { subscribeToNewsletter };
