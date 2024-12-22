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
    // description: {
    //     type: String,
    //     required:[true, 'Please enter product description'],
    // },
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
            'Cow',
            'Sheep',
            'Chicken',
            'Fish',
            'Camel',
            'Kabab'
        ],
       message: 'Please select correct category'
    },
    //seller:{type: String, default: "def"},
    stock:{
        type: Number,
        required:[true, 'Please enter product stock'],
        maxLength: [5, 'Product stock can not be more than 5 characters'],
        default: 0
    },
    user:{type: mongoose.Schema.ObjectId, ref: 'user', required: true,}, 
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