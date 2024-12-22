const express= require('express')
const router = express.Router();

const {
    getAds, 
    get100Ads,
    getAllAdsForAdmin,
    getNewCollection,
    get4MostPopularAds,
    newAd, 
    getSingleAd, 
    updateAd, 
    deleteAd,
} = require('../controllers/adController')

const {isAuthenticatedUser, authorizeRoles} = require('../middlewares/auth');

router.route('/ads').get(getAds);
router.route('/ad/:id').get(getSingleAd);
router.route('/newcollectionads').get(getNewCollection);
router.route('/popular').get(get4MostPopularAds);

router.route('/ad/new').post(isAuthenticatedUser, newAd);
router.route('/allads').get(/* isAuthenticatedUser, authorizeRoles('admin'), */get100Ads);
router.route('/alladsad').get( isAuthenticatedUser, authorizeRoles('admin'), getAllAdsForAdmin);
router.route('/admin/ad/:id')
                                .put(isAuthenticatedUser, authorizeRoles('admin'), updateAd)
                                .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteAd);




module.exports = router;