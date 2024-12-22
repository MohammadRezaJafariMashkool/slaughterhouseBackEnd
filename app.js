const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middlewares/errors');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const PORT = process.env.PORT || 4000;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204,
}));

app.use(express.json());
app.use(cookieParser());

// Import all routes
const products = require('./routes/product');
const ads = require('./routes/ad');
const schedule = require('./routes/schedule');
const auth = require('./routes/auth');
const order = require('./routes/order');

app.use('/v1', products);
app.use('/v1', ads);
app.use('/v1', schedule);
app.use('/v1', auth);
app.use('/v1', order);

// Test route
app.get('/v1/test', (req, res) => {
    console.log('test');
    res.send('test');
});

// Middleware to handle errors
app.use(errorMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = req.body.type; // Access the type field from req.body
        if (type === 'product') {
            cb(null, './upload/images/products');
        } else if (type === 'ad') {
            cb(null, './upload/images/ads');
        } else {
            cb(new Error('Invalid type specified')); // Error if type is invalid
        }
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
});

// Route to handle uploads
app.post('/v1/upload', (req, res, next) => {
    // Use upload.fields() to handle files and non-file fields
    upload.fields([{ name: 'files', maxCount: 4 }])(req, res, function (err) {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({ success: 0, message: err.message });
        }

        const type = req.body.type;
        if (!req.files || !type) {
            return res.status(400).json({ success: 0, message: 'Missing files or type field' });
        }

        const imageUrls = req.files.files.map(file => {
            const typePath = type === 'product' ? 'products' : 'ads';
            return `upload/images/${typePath}/${file.filename}`;
        });

        return res.json({
            success: 1,
            image_urls: imageUrls,
        });
    });
});



module.exports = app;
