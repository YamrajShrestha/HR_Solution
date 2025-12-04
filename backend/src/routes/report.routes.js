import express from 'express';
import {
  getEmployeeReport,
  getLeaveReport,
  getAttendanceReport,
  getTravelReport,
  getDashboardStats
} from '../controllers/report.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/employee', authorize('admin', 'hr', 'manager'), getEmployeeReport);
router.get('/leave', authorize('admin', 'hr', 'manager'), getLeaveReport);
router.get('/attendance', authorize('admin', 'hr', 'manager'), getAttendanceReport);
router.get('/travel', authorize('admin', 'hr', 'manager'), getTravelReport);
router.get('/dashboard', getDashboardStats);

export default router;