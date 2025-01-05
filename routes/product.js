const express= require('express')
const router = express.Router();

const {
    getProducts, 
    get100Products,
    getAllProductsForAdmin,
    getNewCollection,
    get4MostPopularProducts,
    newProduct, 
    getSingleProduct, 
    updateProduct, 
    deleteProduct,
    createProductReview,
    getProductReviews,
    deleteReview
} = require('../controllers/productControllers')

const {isAuthenticatedUser, authorizeRoles} = require('../middlewares/auth');

router.route('/products').get(getProducts);
//router.route('/product/:id').get(getSingleProduct);
//router.route('/newcollectionproducts').get(getNewCollection);
router.route('/popular').get(get4MostPopularProducts);

router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);
router.route('/admin/allproducts').post(isAuthenticatedUser, authorizeRoles('admin'), getAllProductsForAdmin);
router.route('/admin/product/:id')
                                .put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct);


// router.route('/review').put(isAuthenticatedUser, createProductReview);
// router.route('/reviews').get(isAuthenticatedUser, getProductReviews);
// router.route('/reviews').delete(isAuthenticatedUser, deleteReview);


module.exports = router;