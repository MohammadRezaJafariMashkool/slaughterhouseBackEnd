const User = require('../models/user');
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");


// Checks if user is authenticated or not
/* exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {

    const { token } = req.cookies

    if (!token) {
        return next(new ErrorHandler('Login first to access this resource.', 401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id);

    next()
}) */
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        return next(new ErrorHandler('Login first to access this resource.', 401));
    }
    const token = authorizationHeader.split(' ')[1];

    if (!token) {
        return next(new ErrorHandler('Login first to access this resource.', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        return next(new ErrorHandler('Login first to access this resource.', 401));
    }
});


// Handling users roles
exports.authorizeRoles = (...roles) => {

    //Uses token sent in the Cookie
    /* return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(
            new ErrorHandler('Role ('+req.user.role+') is not allowed to access this',
            403))
        }
        next()
    } */

    //Uses token sent in the header
    return (req, res, next) => {
        // Extract the token from the request header
        const authorizationHeader = req.headers.authorization;

        // Check if the token is present
        if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
            return next(new ErrorHandler('Unauthorized: No token provided', 401));
        }
        const token = authorizationHeader.split(' ')[1];

        (async () => {
            try {
                // Decode the token to get user information
                const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your actual secret key
                req.user = await User.findById(decoded.id);

                // Check if the user's role is allowed
                if (!roles.includes(req.user.role)) {
                    return next(
                        new ErrorHandler(`Role (${decoded.role}) is not allowed to access this`, 403)
                    );
                }

                // Attach the user information to the request object for further use
                req.user = decoded;

                // Move to the next middleware
                next();
            } catch (error) {
                // Token is not valid
                return next(
                    new ErrorHandler('Unauthorized: Invalid token', 401)
                );
            }
        })();
    };
}