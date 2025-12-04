import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#6b7280', '#f59e0b', '#84cc16'];

const ReportChart = ({ data, chartType, reportType }) => {
  const renderChart = () => {
    const commonProps = {
      width: '100%',
      height: 400,
      data: data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={getDataKey()} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" />
              <Bar dataKey="total" fill="#10b981" />
              <Bar dataKey="value" fill="#f59e0b" />
              {reportType === 'leave-analysis' && (
                <>
                  <Bar dataKey="approved" fill="#10b981" />
                  <Bar dataKey="pending" fill="#f59e0b" />
                  <Bar dataKey="rejected" fill="#ef4444" />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={getLineDataKey()} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} />
              {reportType === 'attendance-report' && (
                <>
                  <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={getLineDataKey()} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="total" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  // Helper function to determine the appropriate data key for XAxis
  const getDataKey = () => {
    if (data && data.length > 0) {
      const firstItem = data[0];
      if (firstItem.name) return "name";
      if (firstItem.department) return "department";
      if (firstItem.status) return "status";
      if (firstItem.leaveType) return "leaveType";
      if (firstItem._id) return "_id";
    }
    return "name"; // default fallback
  };

  // Helper function to determine the appropriate data key for LineChart XAxis
  const getLineDataKey = () => {
    if (data && data.length > 0) {
      const firstItem = data[0];
      if (firstItem.name) return "name";
      if (firstItem.date) return "date";
      if (firstItem.month) return "month";
      if (firstItem._id) return "_id";
    }
    return "name"; // default fallback
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="h-96">
        {data && data.length > 0 ? renderChart() : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No data available for visualization
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportChart;