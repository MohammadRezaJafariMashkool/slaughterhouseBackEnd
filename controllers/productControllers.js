const Product = require('../models/product');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');

// Create new product => /api/v1/admin/product/new
exports.newProduct = catchAsyncErrors (async(req, res, next) => {     
    req.body.user = req.user.id;
    const product = await Product.create(req.body);       
    res.status(201).json({
            success: true,
            product
        })
})

// Get products => /api/v1/products?keywords=apple
exports.getProducts = catchAsyncErrors (async (req, res, next) =>{
    const resPerPage = 4;
    const productCount = await Product.countDocuments();

    const apiFeatures = new APIFeatures(Product.find(), req.query)
         .search()
         .filter()
         .pagination(resPerPage);

    const products = await apiFeatures.query;
    res.status(200).json({
        success: true,
        count: products.length,
        productCount,
        products
    })
})

// Get products => /api/v1/product/newcollection
exports.getNewCollection = catchAsyncErrors(async (req, res, next) => {
    const resPerPage = 8;

    const apiFeatures = new APIFeatures(Product.find().sort({ createdAt: -1 }).limit(resPerPage), req.query)
        .search()
        .filter();

    const products = await apiFeatures.query;

    res.status(200).json({
        success: true,
        count: products.length,
        products,
    });
});

// Get 100 of All products for admin => /api/v1/allproducts
exports.get100Products = catchAsyncErrors(async (req, res, next) => {
    const resPerPage = 100;
    const productCount = await Product.countDocuments();

    const apiFeatures = new APIFeatures(Product.find(), req.query).pagination(resPerPage);

    // Execute the query and then sort the results
    const products = await apiFeatures.query.sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: products.length,
        productCount,
        products,
    });
});

// Get 100 of All products for admin => /api/v1/allproductsad
exports.getAllProductsForAdmin = catchAsyncErrors(async (req, res, next) => {
    const resPerPage = 100;
    const productCount = await Product.countDocuments();

    const apiFeatures = new APIFeatures(Product.find(), req.query).pagination(resPerPage);

    // Execute the query and then sort the results
    const products = await apiFeatures.query.sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: products.length,
        productCount,
        products,
    });
});


// Get 4 most popular products for admin => /api/v1/popular
exports.get4MostPopularProducts = catchAsyncErrors(async (req, res, next) => {
    const resPerPage = 4;

    // Query to find the most popular products
    const products = await Product.find()
        .sort({ popularity: -1 }) // Sort by popularity in descending order
        .limit(resPerPage); // Limit the results to 4 products

    res.status(200).json({
        success: true,
        count: products.length,
        products,
    });
});


// Get a single product by ID => /api/v1/product/:productId
exports.getSingleProduct = catchAsyncErrors (async (req, res, next) => {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return next(new ErrorHandler('Product not found', 404));
        }        
        res.status(200).json({
            success: true,
            product
        });
})

// Update Product by ID => /api/v1/admin/product/:id
exports.updateProduct = catchAsyncErrors (async (req, res, next) => {
    try {

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,  // Return the modified document rather than the original
            runValidators: true
        });

        if (!updatedProduct) {
            return next(new ErrorHandler('Product not found', 404));
        }

        res.status(200).json({
            success: true,
            product: updatedProduct
        });
    } catch (err) {
        console.error(err);

        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: err.errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
})

// Delete product by ID => /api/v1/admin/product/:id
exports.deleteProduct = catchAsyncErrors (async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return next(new ErrorHandler('Product not found', 404));
        }
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    
})

// Create a new review endpoint: /api/v1/review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    // Extract necessary information from the request body
    const { rating, comment, productId } = req.body;
    // Create a new review object with user details and provided rating/comment
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    };
    
    // Find the product based on the provided productID
    const product = await Product.findById(productId);

    // Check if the user has already reviewed the product
    const isReviewed = product.reviews.find(
        r => r.user.toString() === req.user._id.toString()
    );

    // Update the review if the user has already reviewed the product
    if (isReviewed) {
        product.reviews.forEach(existingReview => {
            if (existingReview.user.toString() === req.user._id.toString()) {
                existingReview.comment = comment;
                existingReview.rating = rating;
            }
        });
    } else {
        // Add the new review to the product's reviews array
        product.reviews.push(review);

        // Update the total number of reviews for the product
        product.numOfReviews = product.reviews.length;
    }

    // Recalculate the rating for the product
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0)/ product.reviews.length;

    // Save the updated product with the new or modified review
    await product.save({validateBeforeSave : false});

    // Send a success response
    res.status(200).json({
        success: true
    });
});

// Get Product Reviews  => /api/v1/reviews
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

// Delete Product Review  => /api/v1/reviews
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString())

    const numOfReviews = reviews.length;

    // Recalculate the rating for the product
    const ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews,
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    });
})
