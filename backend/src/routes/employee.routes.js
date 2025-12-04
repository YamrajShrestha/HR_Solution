import express from 'express';
import {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
  uploadDocument
} from '../controllers/employee.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateEmployee } from '../middleware/validation.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(authenticate);

router.post('/', authorize('admin', 'hr'), validateEmployee, createEmployee);
router.get('/', getEmployees);
router.get('/stats', authorize('admin', 'hr'), getEmployeeStats);
router.get('/:id', getEmployee);
router.put('/:id', authorize('admin', 'hr'), validateEmployee, updateEmployee);
router.delete('/:id', authorize('admin', 'hr'), deleteEmployee);
router.post('/:id/documents', authorize('admin', 'hr'), upload.single('document'), uploadDocument);

export default router;