// src/components/Common/DepartmentFilter.jsx
import React, { useState, useEffect } from 'react';
import { BuildingIcon } from 'lucide-react';
import api from '../../services/api';

const DepartmentFilter = ({ value, onChange, includeAll = false }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/employees/departments');
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
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
        <BuildingIcon className="h-4 w-4 text-gray-400" />
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-3 py-2 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
      >
        {includeAll && <option value="">All Departments</option>}
        {departments.map((dept) => (
          <option key={dept} value={dept}>
            {dept}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DepartmentFilter;