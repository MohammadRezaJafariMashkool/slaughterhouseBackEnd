const Schedule = require('../models/Schedule');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');

// Create new Schedule => /api/v1/admin/Schedule/new
exports.newSchedule = catchAsyncErrors (async(req, res, next) => {
    req.body.user = req.user.id;
    const schedule = await Schedule.create(req.body); 
    res.status(201).json({
            success: true,
            schedule
        })
})

// Get Schedules => /api/v1/Schedules?keywords=apple
exports.getSchedules = catchAsyncErrors (async (req, res, next) =>{
    const resPerPage = 4;
    const ScheduleCount = await Schedule.countDocuments();

    const apiFeatures = new APIFeatures(Schedule.find(), req.query)
         .search()
         .filter()
         .pagination(resPerPage);

    const Schedules = await apiFeatures.query;
    res.status(200).json({
        success: true,
        count: Schedules.length,
        ScheduleCount,
        Schedules
    })
})

// Get Schedules => /api/v1/Schedule/newcollection
exports.getNewCollection = catchAsyncErrors(async (req, res, next) => {
    const resPerPage = 8;

    const apiFeatures = new APIFeatures(Schedule.find().sort({ createdAt: -1 }).limit(resPerPage), req.query)
        .search()
        .filter();

    const Schedules = await apiFeatures.query;

    res.status(200).json({
        success: true,
        count: Schedules.length,
        Schedules,
    });
});

// Get 100 of All Schedules for admin => /api/v1/allSchedules
exports.get100Schedules = catchAsyncErrors(async (req, res, next) => {
    const resPerPage = 100;
    const ScheduleCount = await Schedule.countDocuments();

    const apiFeatures = new APIFeatures(Schedule.find(), req.query).pagination(resPerPage);

    // Execute the query and then sort the results
    const Schedules = await apiFeatures.query.sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: Schedules.length,
        ScheduleCount,
        Schedules,
    });
});

// Get 100 of All Schedules for admin => /api/v1/allSchedulesad
exports.getAllSchedulesForAdmin = catchAsyncErrors(async (req, res, next) => {
    const resPerPage = 100;
    const ScheduleCount = await Schedule.countDocuments();

    const apiFeatures = new APIFeatures(Schedule.find(), req.query).pagination(resPerPage);

    // Execute the query and then sort the results
    const Schedules = await apiFeatures.query.sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: Schedules.length,
        ScheduleCount,
        Schedules,
    });
});


// Get 4 most popular Schedules for admin => /api/v1/popular
exports.get4MostPopularSchedules = catchAsyncErrors(async (req, res, next) => {
    const resPerPage = 4;

    // Query to find the most popular Schedules
    const Schedules = await Schedule.find()
        .sort({ popularity: -1 }) // Sort by popularity in descending order
        .limit(resPerPage); // Limit the results to 4 Schedules

    res.status(200).json({
        success: true,
        count: Schedules.length,
        Schedules,
    });
});


// Get a single Schedule by ID => /api/v1/Schedule/:ScheduleId
exports.getSingleSchedule = catchAsyncErrors (async (req, res, next) => {
        const Schedule = await Schedule.findById(req.params.id);
        if (!Schedule) {
            return next(new ErrorHandler('Schedule not found', 404));
        }        
        res.status(200).json({
            success: true,
            Schedule
        });
})

// Update Schedule by ID => /api/v1/admin/Schedule/:id
exports.updateSchedule = catchAsyncErrors (async (req, res, next) => {
    try {

        const updatedSchedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
            new: true,  // Return the modified document rather than the original
            runValidators: true
        });

        if (!updatedSchedule) {
            return next(new ErrorHandler('Schedule not found', 404));
        }

        res.status(200).json({
            success: true,
            Schedule: updatedSchedule
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

// Delete Schedule by ID => /api/v1/admin/Schedule/:id
exports.deleteSchedule = catchAsyncErrors (async (req, res, next) => {
    const Schedule = await Schedule.findByIdAndDelete(req.params.id);
        if (!Schedule) {
            return next(new ErrorHandler('Schedule not found', 404));
        }
        res.status(200).json({
            success: true,
            message: 'Schedule deleted successfully'
        });
    
})

