const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required:[true, 'Please enter product name'],
        trim: true,
        maxLength: [100, 'Product name can be more than 100 characters!']
    },
    price: {
        type: Number,
        required:[true, 'Please enter product price'],
        maxLength: [12, ''],
        default: 0.0
    },
    new_price: {
        type: Number,
        required:[true, 'Please enter product price'],
        maxLength: [12, ''],
        default: 0.0
    },
    description: {
        type: String,
        required:[true, 'Please enter product description'],
    },
    ratings: {
        type: Number,
        default: 0
    },
    images:[{
        public_id:{
            type: String
        },
        url: {
            type: String
        },        
    }],
    category: {
        type: String,
        required:[true, 'Please select product category'],
        enum:[            
            'cow',
            'sheep',
            'chicken',
            'fish',
            'camel',
            'kabab'
        ],
       message: 'Please select correct category'
    },
    seller:{
        type: String,
        default: "def"
    },
    stock:{
        type: Number,
        required:[true, 'Please enter product stock'],
        maxLength: [5, 'Product stock can not be more than 5 characters'],
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews:[{
        user:{
            type: mongoose.Schema.ObjectId,
            ref: 'user',
            required: true,
        },
        name: {
            type: String,
            required:[true, 'Please enter product review name'],
        },
        rating: {
            type: Number,
            required:[true, 'Please enter product review rating'],
        },
        comment: {
            type: String,
            required:[true, 'Please enter product review comment'],
        }
    }],
    /* user:{
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true,
    }, */
    createdAt: {
        type: Date,
        default: Date.now
    },
    enable: {
        type: String,
        default: "enabled"
    }
})

module.exports = mongoose.model('Product', productSchema);