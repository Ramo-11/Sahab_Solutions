const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const helmet = require('helmet');

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

app.get('/contact', (req, res) => {
    res.render('contact', { 
        title: 'Sahab Solutions - Contact Us',
        page: 'contact',
        success: req.query.success
    });
});

const pages = ['/', '/about', '/contact', '/services'];

app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  const urls = pages.map(p => `<url><loc>https://sahabsolutions.com${p}</loc></url>`).join('');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>`);
});

app.post('/contact', (req, res) => {
    const { name, email, service, message } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    const mailOptions = {
        from: email,
        to: 'sahab.solutions25@gmail.com',
        subject: `New Contact Form: ${service}`,
        text: `Name: ${name}\nEmail: ${email}\nService: ${service}\nMessage:\n${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.redirect('/contact?success=false');
        }
        res.redirect('/contact?success=true');
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});