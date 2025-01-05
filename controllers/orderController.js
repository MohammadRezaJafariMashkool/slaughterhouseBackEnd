const Order = require('../models/order');
const Product = require('../models/product');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// Create new order => /api/c1/order/new
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        orderStatus,
    } = req.body;

    try {
        // Check availability of products
        for (const item of orderItems) {
            const product = await Product.findById(item.product);

            if (!product) {
                //console.error(`Product with ID ${item.product} not found`);
                return res.status(404).json({
                    success: false,
                    message: `محصول پیدا نشد`,
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `موجودی کالای ${product.name} کمتر از مقدار انتخابی شماست`,
                });
            }
        }

        // Create new order
        const order = await Order.create({
            orderItems,
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo,
            orderStatus: "Pending",
            paidAt: Date.now(),
            user: req.user._id,
        });

        // Reduce stock for each product
        for (const item of orderItems) {
            const product = await Product.findById(item.product);

            if (product) {
                product.stock -= item.quantity;
                await product.save({ validateBeforeSave: false });
            }
        }

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        //console.error("Error occurred while creating order:", error); // Log error details
        res.status(500).json({
            success: false,
            message: "Failed to create order",
            error: error.message, // Include error message for better debugging
        });
    }
});


// Get single order => /api/v1/order/:id
exports.getSingleOrder = catchAsyncErrors(async(req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if(!order){
        return next(new ErrorHandler('No Order found with this ID', 404))
    }

    res.status(200).json({
        success: true,
        order
    })
})

// Get logged in user orders => /api/v1/orders/me/:id
exports.myOrders = catchAsyncErrors(async(req, res, next) => {

    const orders = await Order.find({user: req.user.id});
    res.status(200).json({
        success: true,
        orders
    })
})


// Get all orders => /api/v1/admin/orders
exports.allOrders = catchAsyncErrors(async(req, res, next) => {
    //Original code
    /* const orders = await Order.find();

    let totalAmount = 0;
    orders.forEach(order => {
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    }) */

    //new code
    const orders = await Order.find().populate('user', 'name email tel address'); // Add the fields you want to retrieve for the user

    let totalAmount = 0;
    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    });
})

 // Update / Process order - ADMIN => /api/v1/admin/order:id
/*  exports.updateOrder = catchAsyncErrors(async(req, res, next) => {

    const order = await Order.findById(req.params.id);

    if(order.orderStatus === 'Delivered'){
        return next(new ErrorHandler('You have already delivered this order!', 400));
    }

    order.orderItems.forEach(async item =>{
        await updateStock(item.product, item.quantity)
    })

    order.orderStatus = req.body.status,
    order.deliveredAt = Date.now();

    await order.save();

    res.status(200).json({
        success: true,
    })
})
async function updateStock(id, quantity) {
    const product = await Product.findById(id);

    product.stock = product.stock - quantity;
    await product.save({validateBeforeSave: false});
} */
exports.updateOrder = catchAsyncErrors(async(req, res, next) => {

    const order = await Order.findById(req.params.id);

    order.orderStatus = req.body.orderStatus,
    order.orderNotes = req.body.orderNotes,
    order.deliveredAt = Date.now();

    await order.save();

    res.status(200).json({
        success: true,
    })
})

// Delete order => /api/v1/admin/order/:id
exports.deleteOrder = catchAsyncErrors(async(req, res, next) => {
    const order = await Order.findByIdAndDelete(req.params.id);

    if(!order){
        return next(new ErrorHandler('No Order found with this ID', 404))
    }

    res.status(200).json({
        success: true
    })
})

