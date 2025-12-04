import express from 'express';
import {
  checkIn,
  checkOut,
  getAttendance,
  getAttendanceStats,
  updateAttendance
} from '../controllers/attendance.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/checkin', checkIn);
router.post('/checkout', checkOut);
router.get('/', getAttendance);
router.get('/stats', getAttendanceStats);
router.put('/:id', authorize('admin', 'hr'), updateAttendance);

export default router;