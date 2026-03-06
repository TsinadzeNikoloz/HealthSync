import express from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.use(authController.jwtProtect);

router.get('/', notificationController.getMyNotifications);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);

export default router;
