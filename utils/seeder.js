const Product = require('../models/product');
const dotenv = require('dotenv');
const connectDatabase = require('../config/database2');

const products = require('../data/ads');

// Setting dotenv file
dotenv.config({path: 'config/config.env'});

// Connect to MongoDB using Mongoose
connectDatabase();

const seedProducts = async() =>{
    try{
        
        await Product.deleteMany();
        console.log('Products deleted');

        await Product.insertMany(products);
        console.log('All Products Added');

        process.exit();

    } catch(error){
        console.log(error.message);
        process.exit();
    }
}

seedProducts();