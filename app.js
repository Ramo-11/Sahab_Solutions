const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');

const router = require('./server/router');

dotenv.config();

const app = express();
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Security middleware
app.use(helmet());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', router);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
