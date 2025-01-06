// Create and send token and save in the cookie.
const sendToken = (user, statusCode, res) => {
    // Create Jwt token
    const token = user.getJwtToken();

    // Options for cookie
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000 // Corrected time format (milliseconds)
        ),
        httpOnly: true,
    };

    // Set the cookie and send the response
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        user: {
            _id: user._id,
            name: user.name,
            role: user.role,
            email: user.email,
            tel: user.tel,
            address: user.address,
            postalCode: user.postalCode,
            city: user.city,
            image: user.image,
        },
    });
};

module.exports = sendToken;
