const express= require('express')
const router = express.Router();

const {
    getAds, 
    get100Ads,
    getAllAdsForAdmin,
    newAd, 
    getSingleAd, 
    updateAd, 
    deleteAd,
} = require('../controllers/adController')

const {isAuthenticatedUser, authorizeRoles} = require('../middlewares/auth');

router.route('/ads').get(getAds);
router.route('/ad/:id').get(getSingleAd);

router.route('/ad/new').post(isAuthenticatedUser, newAd);
router.route('/admin/allads').get( isAuthenticatedUser, authorizeRoles('admin'), getAllAdsForAdmin);
router.route('/admin/ad/:id')
                                .put(isAuthenticatedUser, authorizeRoles('admin'), updateAd)
                                .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteAd);




module.exports = router;