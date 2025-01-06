const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter user name'],
        maxLength: [30, 'Your name can be more than 30 characters!']       
    },
    email: {
        type: String,
        required: [true, 'لطفا ایمیل خود را وارد نمایید'],
        unique: [true, 'با این ایمیل قبلا در سایت ثبتنام کرده اید درصورت فراموشی رمز عبور از قسمت پایین، گزینه فراموشی را انتخاب کنید'],
        validate: [validator.isEmail, 'Please enter a valid email address'],
    },
    tel: {
        type: String,
        validate: [{
            validator: function(value) {
                // Check if the tel field is required for addition (isNew is true)
                if (this.isNew) {
                    return value && value.length > 0;
                }
                // For updates, tel field is not required
                return true;
            },
            message: 'لطفا شماره تلفن خود را وارد نمایید'
        }],
        unique: [true, 'با این شماره تلفن قبلا در سایت ثبتنام کرده اید درصورت فراموشی رمز عبور از قسمت پایین، گزینه فراموشی را انتخاب کنید'],
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    postalCode: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'Please enter password'],
        minlength: [6, 'Your password must be more than 6 characters!'],
        select: false
    },
    image: {
            type: String,
            default: 'upload/images/users/userAvatarPlaceHolder.png'
    },
    role: {
        type: String,
        default: 'user'
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire : Date
})

// Encrypting Password before saving
userSchema.pre('save', async function (next) {
    if(!this.isModified('password')){next();}
    this.password = await bcrypt.hash(this.password, 10);
})

// Compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// Return JWT token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
}

// Generate password reset token
userSchema.methods.getResetPasswordToken = function(){
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash and set to resetPasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token expire time
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000

    return resetToken;
}

module.exports = mongoose.model('User', userSchema);