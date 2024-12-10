const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middlewares/errors');
const path = require('path');
const cors = require('cors');

const PORT = process.env.PORT || 4000;
//const PORT = process.env.PORT;

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
const auth = require('./routes/auth');
const order = require('./routes/order');
const multer = require('multer');

app.use('/back11/api/v1', products);
app.use('/back11/api/v1', auth);
app.use('/back11/api/v1', order);
// Test route
app.get('/back11/api/v1/test', (req, res) => {
  console.log('test');
  res.send('test');
});
// Middleware to handle errors
app.use(errorMiddleware);

const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.use('/back11/api/v1/images', express.static('upload/images'));

app.post("/back11/api/v1/upload", upload.array('products', 4), (req, res) => {
  const imageUrls = req.files.map(file => {
    return 'http://localhost:' + PORT + '/images/' + file.filename;
  });

  res.json({
    success: 1,
    image_urls: imageUrls
  });
});

module.exports = app;
