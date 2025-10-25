const express = require('express');
const contactController = require('./controllers/contactController');
const newsletterController = require('./controllers/newsletterController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// *********** GET requests **********
router.get('/', (req, res) => {
    res.render('index', {
        title: 'Sahab Solutions - Home',
        page: 'home',
    });
});

router.get('/services', (req, res) => {
    res.render('services', {
        title: 'Sahab Solutions - Services',
        page: 'services',
    });
});

router.get('/about', (req, res) => {
    res.render('about', {
        title: 'Sahab Solutions - About Us',
        page: 'about',
    });
});

router.get('/work', (req, res) => {
    res.render('work', {
        title: 'Sahab Solutions - Our Work',
        page: 'work',
    });
});

router.get('/products', (req, res) => {
    res.render('products', {
        title: 'Sahab Solutions - Our Products',
        page: 'products',
    });
});

router.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Sahab Solutions - Contact Us',
        page: 'contact',
        success: req.query.success,
        error: req.query.error,
    });
});

router.get('/privacy', (req, res) => {
    res.render('privacy', {
        title: 'Sahab Solutions - Privacy Policy',
        page: 'privacy',
    });
});

router.get('/terms', (req, res) => {
    res.render('terms', {
        title: 'Sahab Solutions - Terms of Service',
        page: 'terms',
    });
});

// Individual project pages
router.get('/work/noosaengage', (req, res) => {
    res.render('projects/noosaengage', {
        title: 'Sahab Solutions - Noosa Engage',
        page: 'work',
    });
});

router.get('/work/alhuda_spark', (req, res) => {
    res.render('projects/alhuda_spark', {
        title: 'Sahab Solutions - Alhuda Spark Competition Platform',
        page: 'work',
    });
});

router.get('/work/masindy', (req, res) => {
    res.render('projects/masindy', {
        title: 'Sahab Solutions - MAS Website',
        page: 'work',
    });
});

router.get('/newsletter', (req, res) => {
    res.render('newsletter', {
        title: 'Sahab Solutions - Newsletter Subscription',
        page: 'newsletter',
    });
});

// Sitemap
router.get('/sitemap.xml', (req, res) => {
    const pages = ['/', '/about', '/contact', '/services', '/work', '/privacy', '/terms'];

    res.header('Content-Type', 'application/xml');
    const urls = pages.map((p) => `<url><loc>https://sahabsolutions.com${p}</loc></url>`).join('');

    res.send(`<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${urls}
    </urlset>`);
});

// *********** POST requests **********
router.post(
    '/contact',
    contactController.rateLimit,
    contactController.slowDown,
    contactController.submitContactForm
);

const newsletterRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // limit each IP to 2 requests per windowMs
    message: 'Too many subscription attempts, please try again later.',
});

router.post(
    '/api/newsletter/subscribe',
    newsletterRateLimit,
    newsletterController.subscribeToNewsletter
);

module.exports = router;
