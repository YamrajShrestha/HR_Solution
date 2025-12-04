import express from 'express';
import {
  createLeave,
  getLeaves,
  getLeave,
  updateLeave,
  approveLeave
} from '../controllers/leave.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateLeave } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validateLeave, createLeave);
router.get('/', getLeaves);
router.get('/:id', getLeave);
router.put('/:id', updateLeave);
router.put('/:id/approve', authorize('admin', 'hr', 'manager'), approveLeave);

export default router;