const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const { sendContactEmails } = require('./server/mailController');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing JSON and URL-encoded data
app.use(express.urlencoded({ extended: false }));

app.use(helmet());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Sahab Solutions - Home',
        page: 'home'
    });
});

app.get('/services', (req, res) => {
    res.render('services', { 
        title: 'Sahab Solutions - Services',
        page: 'services'
    });
});

app.get('/about', (req, res) => {
    res.render('about', { 
        title: 'Sahab Solutions - About Us',
        page: 'about'
    });
});

app.get('/work', (req, res) => {
    res.render('work', { 
        title: 'Sahab Solutions - Our Work',
        page: 'work'
    });
});

// Individual project pages
app.get('/work/noosaengage', (req, res) => {
    res.render('projects/noosaengage', { 
        title: 'Sahab Solutions - Noosa Engage',
        page: 'work'
    });
});

app.get('/work/alhuda_spark', (req, res) => {
    res.render('projects/alhuda_spark', { 
        title: 'Sahab Solutions - Alhuda Spark Competition Platform',
        page: 'work'
    });
});

app.get('/work/masindy', (req, res) => {
    res.render('projects/masindy', { 
        title: 'Sahab Solutions - MAS Website',
        page: 'work'
    });
});

app.get('/contact', (req, res) => {
    res.render('contact', { 
        title: 'Sahab Solutions - Contact Us',
        page: 'contact',
        success: req.query.success
    });
});

const pages = ['/', '/about', '/contact', '/services', '/work', '/privacy', '/terms'];

app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  const urls = pages.map(p => `<url><loc>https://sahabsolutions.com${p}</loc></url>`).join('');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>`);
});

app.post('/contact', async (req, res) => {
    try {
        await sendContactEmails(req.body);
        res.redirect('/contact?success=true');
    } catch (error) {
        console.error('Error sending email:', error);
        res.redirect('/contact?success=false');
    }
});

app.get('/privacy', (req, res) => {
    res.render('privacy', { 
        title: 'Sahab Solutions - Privacy Policy',
        page: 'privacy'
    });
});

app.get('/terms', (req, res) => {
    res.render('terms', { 
        title: 'Sahab Solutions - Terms of Service',
        page: 'terms'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});