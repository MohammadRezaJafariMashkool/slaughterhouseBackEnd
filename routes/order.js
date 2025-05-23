const express = require('express');
const router = express.Router();

const{
    newOrder,
    getSingleOrder,
    myOrders,
    allOrders,
    updateOrder,
    deleteOrder
} = require('../controllers/orderController');

const{
    authorizeRoles, 
    isAuthenticatedUser
} = require('../middlewares/auth');

router.route('/order/new').post(isAuthenticatedUser, newOrder);

router.route('/order/:id').get(isAuthenticatedUser, getSingleOrder);
router.route('/orders').get(isAuthenticatedUser, myOrders);

router.route('/admin/orders').post(isAuthenticatedUser, authorizeRoles('admin'), allOrders);
router.route('/admin/order/:id')
                                .put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder)
                                .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

module.exports = router;