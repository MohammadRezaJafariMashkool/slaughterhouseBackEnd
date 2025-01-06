const Ad = require('../models/Ad');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');

// Create new Ad => /api/v1/admin/Ad/new
exports.newAd = catchAsyncErrors (async(req, res, next) => {     
    req.body.user = req.user.id;
    const ad = await Ad.create(req.body);       
    res.status(201).json({
            success: true,
            ad
        })
})

// Get ads => /api/v1/ads?keywords=apple
exports.getAds = catchAsyncErrors (async (req, res, next) =>{
    const resPerPage = 4;
    const adCount = await Ad.countDocuments();

    const apiFeatures = new APIFeatures(Ad.find(), req.query)
         .search()
         .filter()
         .pagination(resPerPage);

    const ads = await apiFeatures.query;
    res.status(200).json({
        success: true,
        count: ads.length,
        adCount,
        ads
    })
})

// Get 100 of All ads for admin => /api/v1/alladsad
exports.getAllAdsForAdmin = catchAsyncErrors(async (req, res, next) => {
    const resPerPage = 100;
    const adCount = await Ad.countDocuments();

    const apiFeatures = new APIFeatures(Ad.find(), req.query).pagination(resPerPage);

    // Execute the query and then sort the results
    const ads = await apiFeatures.query.sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: ads.length,
        adCount,
        ads,
    });
});


// Get a single ad by ID => /api/v1/ad/:adId
exports.getSingleAd = catchAsyncErrors (async (req, res, next) => {
        const ad = await Ad.findById(req.params.id);
        if (!ad) {
            return next(new ErrorHandler('Ad not found', 404));
        }        
        res.status(200).json({
            success: true,
            ad
        });
})

// Update Ad by ID => /api/v1/admin/ad/:id
exports.updateAd = catchAsyncErrors (async (req, res, next) => {
    try {

        const updatedAd = await Ad.findByIdAndUpdate(req.params.id, req.body, {
            new: true,  // Return the modified document rather than the original
            runValidators: true
        });

        if (!updatedAd) {
            return next(new ErrorHandler('Ad not found', 404));
        }

        res.status(200).json({
            success: true,
            ad: updatedAd
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

// Delete ad by ID => /api/v1/admin/ad/:id
exports.deleteAd = catchAsyncErrors (async (req, res, next) => {
    const ad = await Ad.findByIdAndDelete(req.params.id);
        if (!ad) {
            return next(new ErrorHandler('Ad not found', 404));
        }
        res.status(200).json({
            success: true,
            message: 'Ad deleted successfully'
        });
    
})


