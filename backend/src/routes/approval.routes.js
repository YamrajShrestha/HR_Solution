import express from 'express';
import {
  createApprovalFlow,
  getApprovalFlows,
  createApprovalRequest,
  getApprovalRequests,
  approveRequest,
  cancelRequest
} from '../controllers/approval.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Approval Flow Management (Admin/HR only)
router.post('/flows', authorize('admin', 'hr'), createApprovalFlow);
router.get('/flows', authorize('admin', 'hr'), getApprovalFlows);

// Approval Requests
router.post('/requests', createApprovalRequest);
router.get('/requests', getApprovalRequests);
router.put('/requests/:id/approve', approveRequest);
router.put('/requests/:id/cancel', cancelRequest);

export default router;