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
router.route('/product/:id').get(getSingleProduct);
router.route('/newcollectionproducts').get(getNewCollection);
router.route('/popular').get(get4MostPopularProducts);

router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);
router.route('/allproducts').get(/* isAuthenticatedUser, authorizeRoles('admin'), */get100Products);
router.route('/allproductsad').get( isAuthenticatedUser, authorizeRoles('admin'), getAllProductsForAdmin);
router.route('/admin/product/:id')
                                .put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct)
                                .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);


router.route('/review').put(isAuthenticatedUser, createProductReview);
router.route('/reviews').get(isAuthenticatedUser, getProductReviews);
router.route('/reviews').delete(isAuthenticatedUser, deleteReview);


module.exports = router;