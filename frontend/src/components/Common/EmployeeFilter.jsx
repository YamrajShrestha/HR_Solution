// src/components/Common/EmployeeFilter.jsx
import React, { useState, useEffect } from 'react';
import { UserIcon } from 'lucide-react';
import api from '../../services/api';

const EmployeeFilter = ({ value, onChange, department = '', includeAll = false }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, [department]);

  const fetchEmployees = async () => {
    try {
      const params = new URLSearchParams();
      if (department) params.append('department', department);
      params.append('limit', '200');

      const response = await api.get(`/employees?${params}`);
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <select className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
        <option>Loading...</option>
      </select>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <UserIcon className="h-4 w-4 text-gray-400" />
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-3 py-2 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
      >
        {includeAll && <option value="">All Employees</option>}
        {employees.map((emp) => (
          <option key={emp._id} value={emp._id}>
            {emp.personalInfo.firstName} {emp.personalInfo.lastName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default EmployeeFilter;