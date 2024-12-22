const express= require('express')
const router = express.Router();

const {
    getSchedules, 
    get100Schedules,
    getAllSchedulesForAdmin,
    getNewCollection,
    get4MostPopularSchedules,
    newSchedule, 
    getSingleSchedule, 
    updateSchedule, 
    deleteSchedule,
} = require('../controllers/scheduleController')

const {isAuthenticatedUser, authorizeRoles} = require('../middlewares/auth');

router.route('/schedules').get(getSchedules);
router.route('/schedule/:id').get(getSingleSchedule);
router.route('/newcollectionschedules').get(getNewCollection);
router.route('/popular').get(get4MostPopularSchedules);

router.route('/schedule/new').post(isAuthenticatedUser, newSchedule);
router.route('/allschedules').get(/* isAuthenticatedUser, authorizeRoles('admin'), */get100Schedules);
router.route('/allschedulesad').get( isAuthenticatedUser, authorizeRoles('admin'), getAllSchedulesForAdmin);
router.route('/admin/schedule/:id')
                                .put(isAuthenticatedUser, authorizeRoles('admin'), updateSchedule)
                                .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteSchedule);



module.exports = router;