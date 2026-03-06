import express from 'express';
import * as userController from '../controllers/user.controller.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/verifyOTP', authController.verifyOTP);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Public: browse doctors
router.get('/doctors', userController.getAllDoctors);

// Public: get available slots for a doctor on a given date
router.get('/availability/:doctorId', userController.getAvailableSlots);

// JWT protect all routes after this middleware
router.use(authController.jwtProtect);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/getMe', userController.getMe, userController.getUser);
router.patch(
	'/updateMe',
	userController.uploadUserPhoto,
	userController.resizeUserPhoto,
	userController.updateMe,
);
router.delete('/deleteMe', userController.deleteMe);

// Restrict CRUD operations to ADMIN
router.use(authController.restrictTo('ADMIN'));

router
	.route('/')
	.get(userController.getAllUsers)
	.post(userController.createUser);
router
	.route('/:id')
	.get(userController.getUser)
	.patch(userController.updateUser)
	.delete(userController.deleteUser);

export default router;
