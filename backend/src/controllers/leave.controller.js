import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import { v4 as uuidv4 } from 'uuid';
import { io } from '../server.js';

export const createLeave = async (req, res) => {
  try {
    const leaveData = {
      ...req.body,
      employee: req.user.id
    };

    // Calculate days between dates
    const startDate = new Date(leaveData.startDate);
    const endDate = new Date(leaveData.endDate);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    leaveData.days = leaveData.isHalfDay ? 0.5 : diffDays;

    const leave = await Leave.create(leaveData);

    // Populate employee data
    await leave.populate('employee', 'personalInfo.firstName personalInfo.lastName employeeId');

    // Send notification to manager/HR
    const employee = await Employee.findById(req.user.id).populate('manager');
    if (employee.manager) {
      io.to(employee.manager._id.toString()).emit('new-leave-request', {
        leaveId: leave._id,
        employeeName: `${leave.employee.personalInfo.firstName} ${leave.employee.personalInfo.lastName}`,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate
      });
    }

    res.status(201).json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeaves = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, leaveType, startDate, endDate } = req.query;
    
    const query = {};
    
    // If employee, only show their own leaves
    if (req.user.role === 'employee') {
      query.employee = req.user.id;
    }
    
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    }

    const leaves = await Leave.find(query)
      .populate('employee', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('approver', 'personalInfo.firstName personalInfo.lastName employeeId')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Leave.countDocuments(query);

    res.json({
      success: true,
      data: leaves,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'personalInfo.firstName personalInfo.lastName employeeId personalInfo.email')
      .populate('approver', 'personalInfo.firstName personalInfo.lastName employeeId');

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    // Check if user has permission to view this leave
    if (req.user.role === 'employee' && leave.employee._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    // Check if user is the owner of the leave
    if (leave.employee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if leave can be updated
    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot update leave that is not pending' });
    }

    Object.assign(leave, req.body);
    await leave.save();

    res.json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveLeave = async (req, res) => {
  try {
    const { status, approvalNote, rejectionReason } = req.body;
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    leave.status = status;
    leave.approver = req.user.id;
    
    if (status === 'approved') {
      leave.approvalNote = approvalNote;
      leave.approvedAt = new Date();
    } else {
      leave.rejectionReason = rejectionReason;
      leave.rejectedAt = new Date();
    }

    await leave.save();

    // Send notification to employee
    const populatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'personalInfo.firstName personalInfo.lastName')
      .populate('approver', 'personalInfo.firstName personalInfo.lastName');

    io.to(leave.employee.toString()).emit('leave-status-update', {
      leaveId: leave._id,
      status: leave.status,
      approverName: `${populatedLeave.approver.personalInfo.firstName} ${populatedLeave.approver.personalInfo.lastName}`,
      note: status === 'approved' ? approvalNote : rejectionReason
    });

    res.json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(500