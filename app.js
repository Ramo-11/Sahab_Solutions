const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Sahab Solutions - Technology Solutions Provider',
        page: 'home'
    });
});

app.get('/services', (req, res) => {
    res.render('services', { 
        title: 'Our Services - Sahab Solutions',
        page: 'services'
    });
});

app.get('/about', (req, res) => {
    res.render('about', { 
        title: 'About Us - Sahab Solutions',
        page: 'about'
    });
});

app.get('/contact', (req, res) => {
    res.render('contact', { 
        title: 'Contact Us - Sahab Solutions',
        page: 'contact'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});