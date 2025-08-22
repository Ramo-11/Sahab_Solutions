// mailController.js
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { encode } = require('he');
const { isEmail, isLength, trim } = require('validator');

// (5) Disposable email domain lists
const disposableDomains = require('disposable-email-domains');           // index.json (exact matches)
const disposableWildcard = require('disposable-email-domains/wildcard.json'); // wildcard patterns like *.33mail.com

dotenv.config();

/* ------------------ Transport ------------------ */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
});

/* ------------------ Helpers ------------------ */
function emailDomain(email) {
  return email.split('@').pop().toLowerCase();
}

function isDisposable(email) {
  const domain = emailDomain(email);

  // Exact match
  if (disposableDomains.includes(domain)) return true;

  // Wildcard match: pattern like "*.33mail.com" -> check suffix
  for (const pattern of disposableWildcard) {
    if (pattern.startsWith('*.')) {
      const suffix = pattern.slice(1).toLowerCase(); // ".33mail.com"
      if (domain.endsWith(suffix)) return true;
    }
  }
  return false;
}

/* -------- (1) Validate + sanitize input -------- */
function validateAndSanitize(body) {
  const cleaned = {
    name: trim((body.name || '').toString()),
    email: trim((body.email || '').toString()),
    service: trim((body.service || '').toString()),
    message: (body.message || '').toString()
  };

    if (!isLength(cleaned.name, { min: 2, max: 80 })) {
        throw new Error('Name must be between 2 and 80 characters.');
    }

    if (!isEmail(cleaned.email)) {
        throw new Error('Please provide a valid email address.');
    }

    if (!isLength(cleaned.service, { min: 2, max: 100 })) {
        throw new Error('Service must be between 2 and 100 characters.');
    }

    if (!isLength(cleaned.message, { min: 2, max: 5000 })) {
        throw new Error('Message must be between 2 and 5000 characters.');
    }

    if (isDisposable(cleaned.email)) {
        throw new Error('Disposable email not allowed');
    }

  // Escape for safe HTML embedding
  const safe = {
    safeName: encode(cleaned.name),
    safeService: encode(cleaned.service),
    safeMsgHtml: encode(cleaned.message).replace(/\n/g, '<br>')
  };

  return { ...cleaned, ...safe };
}

/* ------------- (3) Bot traps (server) ---------- */
function basicBotChecks(body) {
    // Honeypot (renamed to avoid Chrome autofill)
    const honeypot = (body.contact_extra || '').toString().trim();
    if (honeypot) throw new Error('Spam detected (honeypot)');

    // Min submit time
    const submittedAt = Number(body.ts);
    const now = Date.now();
    if (!submittedAt || Number.isNaN(submittedAt) || now - submittedAt < 3000) {
        throw new Error('Spam detected (too fast)');
    }
}

/* ------------------ Email sender ---------------- */
async function sendContactEmails(contactData) {
  const { safeName, email, safeService, safeMsgHtml } = contactData;

  const adminMailOptions = {
    from: process.env.MAIL_USER,
    to: 'sahab@sahab-solutions.com',
    subject: `New Contact Form: ${safeService}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7117f2 0%, #1e1f63 100%); padding: 30px; border-radius: 10px; color: white; margin-bottom: 20px;">
          <h2 style="margin: 0;">New Contact Form Submission</h2>
        </div>
        <div style="background: white; padding: 30px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${encode(email)}</p>
          <p><strong>Service:</strong> ${safeService}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 5px; border-left: 4px solid #7117f2;">
            ${safeMsgHtml}
          </div>
        </div>
      </div>
    `
  };

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
          <p>Hi ${safeName},</p>
          <p>Thank you for your interest in our <strong>${safeService}</strong> services. We've received your message and will get back to you within 24 hours.</p>
          <p>Here's what you submitted:</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 5px; border-left: 4px solid #7117f2;">
            ${safeMsgHtml}
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
}

/* ------------- (2) Rate limit + slow down -------- */
const rateLimitMiddleware = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});

const slowDownMiddleware = slowDown({
  windowMs: 10 * 60 * 1000,
  delayAfter: 5,
  // v3 new behavior: fixed delay per request over the limit
  delayMs: () => 500,
  // optional: silence the deprecation warning explicitly
  validate: { delayMs: false }
});

/* ------------------ Main handler ----------------- */
async function handleContact(req, res) {
  try {
    basicBotChecks(req.body);
    const cleaned = validateAndSanitize(req.body);
    await sendContactEmails(cleaned);
    return res.redirect('/contact?success=true');
  } catch (err) {
    console.error('Contact submit failed:', err.message);
    // Encode error so it's safe in the URL
    return res.redirect('/contact?success=false&error=' + encodeURIComponent(err.message));
  }
}

module.exports = {
  rateLimit: rateLimitMiddleware,
  slowDown: slowDownMiddleware,
  handleContact
};
