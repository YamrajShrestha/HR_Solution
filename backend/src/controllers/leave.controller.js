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

    // Recalculate days if dates changed
    if (req.body.startDate || req.body.endDate) {
      const startDate = new Date(req.body.startDate || leave.startDate);
      const endDate = new Date(req.body.endDate || leave.endDate);
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      leave.startDate = startDate;
      leave.endDate = endDate;
      leave.days = leave.isHalfDay ? 0.5 : diffDays;
    }

    // Update other fields
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
    res.status(500).json({ message: error.message });
  }
};

export const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    // Check if user is the owner of the leave
    if (leave.employee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if leave can be cancelled
    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel leave that is not pending' });
    }

    leave.status = 'cancelled';
    await leave.save();

    res.json({
      success: true,
      message: 'Leave cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeaveBalance = async (req, res) => {
  try {
    const employeeId = req.user.id;
    
    // Calculate leave balance for different leave types
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    const leaves = await Leave.find({
      employee: employeeId,
      startDate: { $gte: yearStart, $lte: yearEnd },
      status: 'approved'
    });

    // Define annual leave entitlement (this should be configurable per employee)
    const annualEntitlement = {
      annual: 20,
      sick: 10,
      personal: 5,
      maternity: 90,
      paternity: 15
    };

    const usedLeaves = {};
    Object.keys(annualEntitlement).forEach(type => {
      usedLeaves[type] = leaves
        .filter(leave => leave.leaveType === type)
        .reduce((sum, leave) => sum + leave.days, 0);
    });

    const balance = {};
    Object.keys(annualEntitlement).forEach(type => {
      balance[type] = {
        entitled: annualEntitlement[type],
        used: usedLeaves[type] || 0,
        remaining: annualEntitlement[type] - (usedLeaves[type] || 0)
      };
    });

    res.json({
      success: true,
      data: {
        year: currentYear,
        balance: balance
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeaveStats = async (req, res) => {
  try {
    const { department, startDate, endDate } = req.query;
    
    const matchStage = {};
    
    if (department) {
      // Get employees in the department
      const employees = await Employee.find({ 'employmentInfo.department': department });
      matchStage.employee = { $in: employees.map(e => e._id) };
    }
    
    if (startDate && endDate) {
      matchStage.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Leave.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $group: {
          _id: {
            department: '$employee.employmentInfo.department',
            leaveType: '$leaveType',
            status: '$status'
          },
          count: { $sum: 1 },
          totalDays: { $sum: '$days' }
        }
      },
      {
        $group: {
          _id: '$_id.department',
          leaveTypes: {
            $push: {
              leaveType: '$_id.leaveType',
              status: '$_id.status',
              count: '$count',
              totalDays: '$totalDays'
            }
          },
          totalCount: { $sum: '$count' },
          totalDays: { $sum: '$totalDays' }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUpcomingLeaves = async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const query = {
      startDate: { $gte: today, $lte: nextWeek },
      status: 'approved'
    };

    // If employee, only show their own leaves
    if (req.user.role === 'employee') {
      query.employee = req.user.id;
    }

    const leaves = await Leave.find(query)
      .populate('employee', 'personalInfo.firstName personalInfo.lastName employeeId')
      .sort({ startDate: 1 });

    res.json({
      success: true,
      data: leaves
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    // Check if user has permission to delete
    if (req.user.role !== 'admin' && leave.employee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if leave can be deleted
    if (leave.status !== 'pending' && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Cannot delete leave that is not pending' });
    }

    await Leave.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Leave deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportLeaves = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const leaves = await Leave.find(query)
      .populate('employee', 'personalInfo.firstName personalInfo.lastName employeeId employmentInfo.department')
      .populate('approver', 'personalInfo.firstName personalInfo.lastName employeeId')
      .sort({ startDate: -1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = 'Employee Name,Employee ID,Department,Leave Type,Start Date,End Date,Days,Status,Approved By,Reason\n';
      const csvData = leaves.map(leave => {
        const employeeName = `${leave.employee.personalInfo.firstName} ${leave.employee.personalInfo.lastName}`;
        const approverName = leave.approver ? 
          `${leave.approver.personalInfo.firstName} ${leave.approver.personalInfo.lastName}` : 'N/A';
        
        return `"${employeeName}","${leave.employee.employeeId}","${leave.employee.employmentInfo.department}","${leave.leaveType}","${leave.startDate.toDateString()}","${leave.endDate.toDateString()}","${leave.days}","${leave.status}","${approverName}","${leave.reason}"`;
      }).join('\n');

      const csv = csvHeaders + csvData;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="leaves-${Date.now()}.csv"`);
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: leaves
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};