import Employee from '../models/Employee.js';
import { v4 as uuidv4 } from 'uuid';

export const createEmployee = async (req, res) => {
  try {
    const employeeData = req.body;
    
    // Generate employee ID if not provided
    if (!employeeData.employeeId) {
      employeeData.employeeId = `EMP${Date.now()}`;
    }

    const employee = await Employee.create(employeeData);
    
    res.status(201).json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, status, search } = req.query;
    
    const query = {};
    
    if (department) query['employmentInfo.department'] = department;
    if (status) query['employmentInfo.status'] = status;
    if (search) {
      query.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(query)
      .populate('manager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Employee.countDocuments(query);

    res.json({
      success: true,
      data: employees,
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

export const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('manager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('subordinates', 'personalInfo.firstName personalInfo.lastName employeeId');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployeeStats = async (req, res) => {
  try {
    const stats = await Employee.aggregate([
      {
        $group: {
          _id: '$employmentInfo.department',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = await Employee.aggregate([
      {
        $group: {
          _id: '$employmentInfo.status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        departmentStats: stats,
        statusStats: statusStats
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    const { name, type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const document = {
      name,
      type,
      url: file.path,
      uploadedAt: new Date()
    };

    employee.documents.push(document);
    await employee.save();

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};