import Travel from '../models/Travel.js';
import Employee from '../models/Employee.js';
import { v4 as uuidv4 } from 'uuid';
import { io } from '../server.js';

export const createTravelRequest = async (req, res) => {
  try {
    const travelData = {
      ...req.body,
      travelId: `TRV${Date.now()}`,
      employee: req.user.id
    };

    // Calculate total estimated cost
    let totalCost = 0;
    
    if (travelData.transportation?.cost) {
      totalCost += travelData.transportation.cost;
    }
    if (travelData.accommodation?.cost) {
      totalCost += travelData.accommodation.cost;
    }
    if (travelData.dailyAllowance?.amount && travelData.dailyAllowance?.days) {
      totalCost += travelData.dailyAllowance.amount * travelData.dailyAllowance.days;
    }
    if (travelData.itinerary?.length > 0) {
      totalCost += travelData.itinerary.reduce((sum, item) => sum + (item.cost || 0), 0);
    }

    travelData.totalEstimatedCost = totalCost;

    const travel = await Travel.create(travelData);

    // Populate for notification
    await travel.populate('employee', 'personalInfo.firstName personalInfo.lastName employeeId');

    // Send notification to manager
    const employee = await Employee.findById(req.user.id).populate('manager');
    if (employee.manager) {
      io.to(employee.manager._id.toString()).emit('new-travel-request', {
        travelId: travel.travelId,
        employeeName: `${travel.employee.personalInfo.firstName} ${travel.employee.personalInfo.lastName}`,
        destination: `${travel.destination.city}, ${travel.destination.country}`,
        startDate: travel.startDate,
        endDate: travel.endDate,
        totalCost: travel.totalEstimatedCost
      });
    }

    res.status(201).json({
      success: true,
      data: travel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTravelRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;
    
    const query = {};
    
    // Role-based filtering
    if (req.user.role === 'employee') {
      query.employee = req.user.id;
    }
    
    if (status) query.status = status;
    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const travels = await Travel.find(query)
      .populate('employee', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('approver', 'personalInfo.firstName personalInfo.lastName employeeId')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Travel.countDocuments(query);

    res.json({
      success: true,
      data: travels,
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

export const getTravelRequest = async (req, res) => {
  try {
    const travel = await Travel.findById(req.params.id)
      .populate('employee', 'personalInfo.firstName personalInfo.lastName employeeId personalInfo.email')
      .populate('approver', 'personalInfo.firstName personalInfo.lastName employeeId');

    if (!travel) {
      return res.status(404).json({ message: 'Travel request not found' });
    }

    // Check permission
    if (req.user.role === 'employee' && travel.employee._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      data: travel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTravelRequest = async (req, res) => {
  try {
    const travel = await Travel.findById(req.params.id);

    if (!travel) {
      return res.status(404).json({ message: 'Travel request not found' });
    }

    // Check permission
    if (travel.employee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if can be updated
    if (!['draft', 'rejected'].includes(travel.status)) {
      return res.status(400).json({ message: 'Cannot update travel request in current status' });
    }

    Object.assign(travel, req.body);
    
    // Recalculate total cost if data changed
    let totalCost = 0;
    if (travel.transportation?.cost) totalCost += travel.transportation.cost;
    if (travel.accommodation?.cost) totalCost += travel.accommodation.cost;
    if (travel.dailyAllowance?.amount && travel.dailyAllowance?.days) {
      totalCost += travel.dailyAllowance.amount * travel.dailyAllowance.days;
    }
    if (travel.itinerary?.length > 0) {
      totalCost += travel.itinerary.reduce((sum, item) => sum + (item.cost || 0), 0);
    }
    travel.totalEstimatedCost = totalCost;

    await travel.save();

    res.json({
      success: true,
      data: travel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveTravelRequest = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const travel = await Travel.findById(req.params.id)
      .populate('employee', 'personalInfo.firstName personalInfo.lastName employeeId');

    if (!travel) {
      return res.status(404).json({ message: 'Travel request not found' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    travel.status = status;
    travel.approver = req.user.id;
    travel.approvalDate = new Date();
    
    if (status === 'rejected') {
      travel.rejectionReason = rejectionReason;
    }

    await travel.save();

    // Notify employee
    io.to(travel.employee._id.toString()).emit('travel-status-update', {
      travelId: travel.travelId,
      status: travel.status,
      rejectionReason: travel.rejectionReason
    });

    res.json({
      success: true,
      data: travel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitExpenseReport = async (req, res) => {
  try {
    const { actualExpenses } = req.body;
    const travel = await Travel.findById(req.params.id);

    if (!travel) {
      return res.status(404).json({ message: 'Travel request not found' });
    }

    // Check permission
    if (travel.employee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (travel.status !== 'completed') {
      return res.status(400).json({ message: 'Can only submit expenses for completed travel' });
    }

    travel.actualExpenses = actualExpenses;
    travel.status = 'expense-submitted';

    await travel.save();

    res.json({
      success: true,
      data: travel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTravelStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate && endDate) {
      matchStage.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Travel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCost: { $sum: '$totalEstimatedCost' },
          totalAdvance: { $sum: '$advanceAmount' }
        }
      }
    ]);

    const monthlyStats = await Travel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$startDate' },
            month: { $month: '$startDate' }
          },
          count: { $sum: 1 },
          totalCost: { $sum: '$totalEstimatedCost' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        statusStats: stats,
        monthlyStats: monthlyStats
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};