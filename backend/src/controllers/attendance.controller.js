import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import moment from 'moment';
import { io } from '../server.js';

export const checkIn = async (req, res) => {
  try {
    const { latitude, longitude, address, type, note, image } = req.body;
    
    // Check if already checked in today
    const today = moment().startOf('day').toDate();
    const existingAttendance = await Attendance.findOne({
      employee: req.user.id,
      date: today
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    // Validate geo-fencing (office location validation)
    const isValidLocation = await validateGeoFencing(latitude, longitude, req.user.id);
    
    const attendance = await Attendance.create({
      employee: req.user.id,
      date: today,
      checkIn: {
        time: new Date(),
        location: { latitude, longitude, address },
        type: type || 'office',
        note,
        image
      },
      geoFencing: {
        isValid: isValidLocation.isValid,
        violationReason: isValidLocation.violationReason
      }
    });

    // Populate employee data
    await attendance.populate('employee', 'personalInfo.firstName personalInfo.lastName employeeId');

    // Send notification to manager if late
    const currentTime = moment();
    const officeStartTime = moment().set({ hour: 9, minute: 0, second: 0 });
    
    if (currentTime.isAfter(officeStartTime)) {
      const employee = await Employee.findById(req.user.id).populate('manager');
      if (employee.manager) {
        io.to(employee.manager._id.toString()).emit('late-checkin', {
          employeeName: `${attendance.employee.personalInfo.firstName} ${attendance.employee.personalInfo.lastName}`,
          checkInTime: currentTime.format('HH:mm'),
          delay: currentTime.diff(officeStartTime, 'minutes')
        });
      }
    }

    res.status(201).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { latitude, longitude, address, type, note, image } = req.body;
    
    const today = moment().startOf('day').toDate();
    const attendance = await Attendance.findOne({
      employee: req.user.id,
      date: today
    });

    if (!attendance) {
      return res.status(400).json({ message: 'No check-in record found for today' });
    }

    if (attendance.checkOut.time) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    // Calculate work hours
    const checkInTime = moment(attendance.checkIn.time);
    const checkOutTime = moment();
    const workHours = checkOutTime.diff(checkInTime, 'hours', true);

    attendance.checkOut = {
      time: checkOutTime.toDate(),
      location: { latitude, longitude, address },
      type: type || 'office',
      note,
      image
    };
    attendance.workHours = Math.round(workHours * 100) / 100;

    // Calculate overtime (assuming 8 hours is standard)
    if (workHours > 8) {
      attendance.overtimeHours = Math.round((workHours - 8) * 100) / 100;
    }

    await attendance.save();

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, employeeId } = req.query;
    
    const query = {};
    
    // Role-based filtering
    if (req.user.role === 'employee') {
      query.employee = req.user.id;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('employee', 'personalInfo.firstName personalInfo.lastName employeeId')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ date: -1 });

    const total = await Attendance.countDocuments(query);

    res.json({
      success: true,
      data: attendance,
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

export const getAttendanceStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (req.user.role === 'employee') {
      matchStage.employee = mongoose.Types.ObjectId(req.user.id);
    }
    if (startDate && endDate) {
      matchStage.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Attendance.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          },
          absentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
          },
          lateDays: {
            $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
          },
          totalWorkHours: { $sum: '$workHours' },
          totalOvertimeHours: { $sum: '$overtimeHours' }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        totalWorkHours: 0,
        totalOvertimeHours: 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    Object.assign(attendance, req.body);
    await attendance.save();

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function for geo-fencing validation
const validateGeoFencing = async (latitude, longitude, employeeId) => {
  try {
    // Get employee's assigned office location (this should be configurable)
    const officeLocation = {
      latitude: 27.7172, // Example: Kathmandu
      longitude: 85.3240,
      radius: 500 // meters
    };

    // Calculate distance using Haversine formula
    const distance = calculateDistance(
      latitude,
      longitude,
      officeLocation.latitude,
      officeLocation.longitude
    );

    if (distance > officeLocation.radius) {
      return {
        isValid: false,
        violationReason: `Checked in from ${Math.round(distance)}m away from office (max allowed: ${officeLocation.radius}m)`
      };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: true }; // Allow check-in if geo-fencing fails
  }
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};