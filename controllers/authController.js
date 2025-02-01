const User = require('../models/user');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// Register a new user => /register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {

    const {name, email, password, tel, address, postalCode, city} = req.body;
    const user = await User.create({
        name,
        email,
        password,
        tel,
        address,
        postalCode,
        city,
        role:"user"
    });

    sendToken(user, 200, res)
})

// Login User => /login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const {email, password} = req.body;

    // Checks if email and password is entered by user
    if(!email ||!password) {
        return next(new ErrorHandler('Please enter email and password!', 400));
    }

    // Finding User in Database
    const user = await User.findOne({email}).select('+password');


    if(!user){
        return next(new ErrorHandler('Invalid email or password!', 401));
    }

    // checks if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched) {
        return next(new ErrorHandler('Invalid email or password!', 401));
    }

    sendToken(user, 200, res)
})

// Forgot Password => /api/v/password/forgot
exports.forgotPassword = catchAsyncErrors(async(req, res, next)=>{
    const user = await User.findOne({email: req.body.email});

    if(!user){
        return next(new ErrorHandler('User not found with this email! ', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave: false});

    // Create reset password url
    //const resetUrl = req.protocol + '://' +req.get('host')+'/password/reset/' + resetToken;
    const resetUrl = process.env.BACKEND_URL+"reset/" + resetToken;

    const message = 'Your password reset token is as follow:\n\n' + resetUrl + '\n' +'If you have not requested this email, then ignore it.'

    try {

        await sendEmail({
            email: user.email, 
            subject: 'torshizimeat Password Recovery',
            message
        })
        
        res.status(200).json({
            success: true,
            message: 'لینک تغییر کلمه عبور به این ایمیل ارسال شد: '+ user.email
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        
        await user.save({validateBeforeSave: false});

        return next(new ErrorHandler(error.message, 500));
    }
})

// Reset password => /password/reset/:token
exports.resetPassword = catchAsyncErrors(async(req, res, next)=>{
    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    })

    if(!user) {
        return next(new ErrorHandler('Password reset token is Invalid or has been expired! ', 400))
    }

    if(req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match! ', 400))
    }

    // Setup new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res)
})

// Get currently logged in user details => /me
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })
})

// Update / Change password => /password/update
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    //Check precious user password
    const isMatched = await user.comparePassword(req.body.oldPassword);
    if(!isMatched) {
        return next(new ErrorHandler('Old password is incorrect', 400));
    }

    user.password = req.body.password;
    await user.save();

    sendToken(user, 200, res);
})

// Update user profile => /me/update
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        city: req.body.city,
        postalCode: req.body.postalCode,
        email: req.body.email   
    }

    //Update avatar: TODO

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        user:{
            name: user.name,
            email: user.email,
            tel: user.tel,
            address: user.address,
            avatar: user.avatar,
          },
    })
})

// Logout user  = > /logout
exports.logout = async (req, res, next) => {
    try {
        res.cookie('token', null, {
            expires: new Date(Date.now()),
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            message: 'Logged Out'
        });
    } catch (error) {
        console.error("Logout Error:", error); // Log the error for debugging
        res.status(500).json({
            success: false,
            message: 'Failed to log out. Please try again.',
            error: error.message
        });
    }
};




// Admin Routes ------------------------------------------------------------------------------------------------------------------

// Get all users => /admin/users
exports.allUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        sucess: true,
        users
    })
})

// Get user details => /admin/user/:id
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user){
        next(new ErrorHandler('User does not found with id: '+ req.params.id));
    }

    res.status(200).json({
        sucess: true,
        user
    })
})

// Update user profile => /admin/user/:id
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role:  req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
})

// Delete user => /admin/user/:id
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user){
        next(new ErrorHandler('User does not found with id: '+ req.params.id));
    }

    // Remove avatar - TODO

    await user.deleteOne();

    res.status(200).json({
        sucess: true,
        user
    })
})