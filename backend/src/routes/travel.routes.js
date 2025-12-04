import express from 'express';
import {
  createTravelRequest,
  getTravelRequests,
  getTravelRequest,
  updateTravelRequest,
  approveTravelRequest,
  submitExpenseReport,
  getTravelStats
} from '../controllers/travel.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateTravel } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validateTravel, createTravelRequest);
router.get('/', getTravelRequests);
router.get('/stats', authorize('admin', 'hr'), getTravelStats);
router.get('/:id', getTravelRequest);
router.put('/:id', updateTravelRequest);
router.put('/:id/approve', authorize('admin', 'hr', 'manager'), approveTravelRequest);
router.put('/:id/expenses', submitExpenseReport);

export default router;