import Employee from '../models/Employee.js';
import Leave from '../models/Leave.js';
import Attendance from '../models/Attendance.js';
import Travel from '../models/Travel.js';
import moment from 'moment';

export const getEmployeeReport = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.$gte = new Date(startDate);
      dateFilter.$lte = new Date(endDate);
    }

    // Get leave data
    const leaves = await Leave.find({
      employee: employeeId,
      startDate: dateFilter
    });

    // Get attendance data
    const attendance = await Attendance.find({
      employee: employeeId,
      date: dateFilter
    });

    // Get travel data
    const travels = await Travel.find({
      employee: employeeId,
      startDate: dateFilter
    });

    // Calculate statistics
    const leaveStats = {
      total: leaves.length,
      approved: leaves.filter(l => l.status === 'approved').length,
      pending: leaves.filter(l => l.status === 'pending').length,
      rejected: leaves.filter(l => l.status === 'rejected').length,
      totalDays: leaves.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.days, 0)
    };

    const attendanceStats = {
      totalDays: attendance.length,
      presentDays: attendance.filter(a => a.status === 'present').length,
      absentDays: attendance.filter(a => a.status === 'absent').length,
      lateDays: attendance.filter(a => a.status === 'late').length,
      totalWorkHours: attendance.reduce((sum, a) => sum + (a.workHours || 0), 0),
      totalOvertimeHours: attendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0)
    };

    res.json({
      success: true,
      data: {
        employee,
        leaves,
        attendance,
        travels,
        statistics: {
          leave: leaveStats,
          attendance: attendanceStats
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeaveReport = async (req, res) => {
  try {
    const { department, startDate, endDate, leaveType, status } = req.query;
    
    const matchStage = {};
    
    if (department) {
      matchStage['employee.employmentInfo.department'] = department;
    }
    if (leaveType) {
      matchStage.leaveType = leaveType;
    }
    if (status) {
      matchStage.status = status;
    }
    if (startDate && endDate) {
      matchStage.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const leaveData = await Leave.aggregate([
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      { $match: matchStage },
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
      data: leaveData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAttendanceReport = async (req, res) => {
  try {
    const { department, startDate, endDate } = req.query;
    
    const matchStage = {};
    
    if (department) {
      matchStage['employee.employmentInfo.department'] = department;
    }
    if (startDate && endDate) {
      matchStage.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendanceData = await Attendance.aggregate([
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      { $match: matchStage },
      {
        $group: {
          _id: {
            department: '$employee.employmentInfo.department',
            status: '$status'
          },
          count: { $sum: 1 },
          totalWorkHours: { $sum: '$workHours' },
          totalOvertimeHours: { $sum: '$overtimeHours' }
        }
      },
      {
        $group: {
          _id: '$_id.department',
          attendance: {
            $push: {
              status: '$_id.status',
              count: '$count',
              totalWorkHours: '$totalWorkHours',
              totalOvertimeHours: '$totalOvertimeHours'
            }
          },
          totalCount: { $sum: '$count' },
          totalWorkHours: { $sum: '$totalWorkHours' },
          totalOvertimeHours: { $sum: '$totalOvertimeHours' }
        }
      }
    ]);

    res.json({
      success: true,
      data: attendanceData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTravelReport = async (req, res) => {
  try {
    const { department, startDate, endDate, status } = req.query;
    
    const matchStage = {};
    
    if (department) {
      matchStage['employee.employmentInfo.department'] = department;
    }
    if (status) {
      matchStage.status = status;
    }
    if (startDate && endDate) {
      matchStage.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const travelData = await Travel.aggregate([
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      { $match: matchStage },
      {
        $group: {
          _id: {
            department: '$employee.employmentInfo.department',
            status: '$status'
          },
          count: { $sum: 1 },
          totalCost: { $sum: '$totalEstimatedCost' },
          advanceAmount: { $sum: '$advanceAmount' }
        }
      },
      {
        $group: {
          _id: '$_id.department',
          travelStats: {
            $push: {
              status: '$_id.status',
              count: '$count',
              totalCost: '$totalCost',
              advanceAmount: '$advanceAmount'
            }
          },
          totalCount: { $sum: '$count' },
          totalCost: { $sum: '$totalCost' },
          totalAdvance: { $sum: '$advanceAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: travelData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const today = moment().startOf('day').toDate();
    const thisMonthStart = moment().startOf('month').toDate();
    const thisMonthEnd = moment().endOf('month').toDate();

    // Employee stats
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({
      'employmentInfo.status': 'active'
    });

    // Leave stats for this month
    const monthlyLeaves = await Leave.aggregate([
      {
        $match: {
          startDate: { $gte: thisMonthStart, $lte: thisMonthEnd }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDays: { $sum: '$days' }
        }
      }
    ]);

    // Attendance stats for today
    const todayAttendance = await Attendance.aggregate([
      {
        $match: { date: today }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Pending approvals
    const pendingApprovals = await ApprovalRequest.countDocuments({
      status: 'pending'
    });

    // Recent activities (last 7 days)
    const last7Days = moment().subtract(7, 'days').toDate();
    
    const recentLeaves = await Leave.find({
      createdAt: { $gte: last7Days }
    }).countDocuments();

    const recentTravels = await Travel.find({
      createdAt: { $gte: last7Days }
    }).countDocuments();

    res.json({
      success: true,
      data: {
        employees: {
          total: totalEmployees,
          active: activeEmployees
        },
        leaves: {
          monthly: monthlyLeaves,
          recent: recentLeaves
        },
        attendance: {
          today: todayAttendance
        },
        approvals: {
          pending: pendingApprovals
        },
        travels: {
          recent: recentTravels
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};