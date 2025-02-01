// Importing required modules
const express = require('express'); // Express framework for building the server
const app = express(); // Creating an Express application
const cookieParser = require('cookie-parser'); // Middleware to parse cookies in incoming requests
const errorMiddleware = require('./middlewares/errors'); // Custom middleware to handle errors
const path = require('path'); // Module to work with file and directory paths
const cors = require('cors'); // Middleware for enabling Cross-Origin Resource Sharing (CORS)
const multer = require('multer'); // Middleware for handling file uploads

// Setting the port for the server to listen on
const PORT = process.env.PORT || 4000; // Default to 4000 if PORT is not set in environment variables
//const FrontendURL = 'http://localhost:3000'; // Frontend Url

// Configuring CORS middleware
app.use(cors({
    //origin: "*", // Allow requests from this origin
    //origin: process.env.FRONTEND_URL, // Allow requests from this origin
    origin: 'http://localhost:3000', // Frontend URL
    //origin: 'https://torshizimeat.ir', // Frontend URL
    credentials: true, // Allow cookies and credentials to be sent with requests
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // HTTP methods allowed
    optionsSuccessStatus: 204, // Response status for pre-flight requests
}));

// Middleware for parsing JSON and cookies
app.use(express.json()); // Parses incoming JSON requests and puts the data in req.body
app.use(cookieParser()); // Parses cookies in incoming requests

// Importing route files
const products = require('./routes/product'); // Routes related to product operations
const ads = require('./routes/ad'); // Routes for ad-related operations
const schedule = require('./routes/schedule'); // Routes for schedule-related operations
const auth = require('./routes/auth'); // Routes for authentication and user management
const order = require('./routes/order'); // Routes for order-related operations

// Serve static files from the 'upload/images' directory
app.use('/upload/images', express.static(path.join(__dirname, 'upload/images')));

// Using the imported routes
// Prefixing all routes with '/v1' to maintain API versioning
app.use('/v1', products);
app.use('/v1', ads);
app.use('/v1', schedule);
app.use('/v1', auth);
app.use('/v1', order);

// A simple test route to verify the server is running
app.get('/v1/test', (req, res) => {
    console.log('test'); // Logs 'test' to the console
    res.send('test'); // Responds with 'test' to the client
});

// Middleware to handle errors globally
app.use(errorMiddleware); // Custom error-handling middleware

// Additional middleware for parsing URL-encoded data
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data with extended syntax
app.use(express.json()); // Ensures JSON parsing middleware is applied (redundant but safe)

// Configuring Multer for file uploads
const storage = multer.diskStorage({
    // Setting the destination for uploaded files based on the type field in the request body
    destination: (req, file, cb) => {
        const type = req.body.type; // Extract the type field from the request body
        if (type === 'product') {
            cb(null, './upload/images/products'); // Save in the 'products' directory
        } else if (type === 'ad') {
            cb(null, './upload/images/ads'); // Save in the 'ads' directory
        } else {
            cb(new Error('Invalid type specified')); // Return an error if type is invalid
        }
    },
    // Setting the filename for uploaded files
    filename: (req, file, cb) => {
        // Name format: <fieldname>_<timestamp><original file extension>
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    },
});

// Initializing Multer with the specified storage configuration
const upload = multer({
    storage: storage,
});

// Route to handle file uploads
app.post('/v1/upload', (req, res, next) => {
    // Handling file and non-file fields using upload.fields()
    upload.fields([{ name: 'files', maxCount: 4 }])(req, res, function (err) {
        if (err) {
            console.error('Upload error:', err); // Log the error
            return res.status(400).json({ success: 0, message: err.message }); // Respond with an error message
        }

        const type = req.body.type; // Extract the type field from the request body
        if (!req.files || !type) {
            // If no files or type is provided, respond with an error
            return res.status(400).json({ success: 0, message: 'Missing files or type field' });
        }

        // Constructing URLs for uploaded images
        const imageUrls = req.files.files.map(file => {
            const typePath = type === 'product' ? 'products' : 'ads';
            return `upload/images/${typePath}/${file.filename}`; // Generate the file URL
        });

        // Responding with the uploaded file URLs
        return res.json({
            success: 1, // Indicates success
            image_urls: imageUrls, // Array of image URLs
        });
    });
});

// Exporting the app instance for use in the main server file
module.exports = app;
