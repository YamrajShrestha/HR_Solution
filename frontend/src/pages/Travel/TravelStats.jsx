// frontend/src/pages/Travel/TravelStats.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const TravelStats = ({ stats }) => {
  const statusData = stats.statusStats || [];
  const monthlyData = stats.monthlyStats || [];

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#6b7280'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status Distribution */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Travel Requests by Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Travel Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="_id" 
              tickFormatter={(value) => {
                const [year, month] = value ? value.split('-') : ['', ''];
                return `${month}/${year}`;
              }}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => {
                const [year, month] = value ? value.split('-') : ['', ''];
                return `${month}/${year}`;
              }}
            />
            <Bar dataKey="count" fill="#3b82f6" name="Requests" />
            <Bar dataKey="totalCost" fill="#10b981" name="Total Cost" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TravelStats;