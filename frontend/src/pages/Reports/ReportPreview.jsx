// frontend/src/pages/Reports/ReportPreview.jsx
import React from 'react';
import { format } from 'date-fns';

const ReportPreview = ({ data, reportType, dateRange, summary }) => {
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getPreviewContent = () => {
    switch (reportType) {
      case 'employee-summary':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-blue-900">Total Employees</h4>
                <p className="text-3xl font-bold text-blue-900">{summary?.totalRecords || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-green-900">Active Employees</h4>
                <p className="text-3xl font-bold text-green-900">{summary?.activeEmployees || 0}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-purple-900">Departments</h4>
                <p className="text-3xl font-bold text-purple-900">{summary?.departments || 0}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Department Breakdown</h4>
              <div className="space-y-3">
                {data.departmentStats?.map((dept, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{dept._id}</span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">{dept.count}</span>
                      <span className="text-sm text-gray-500 ml-2">employees</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'leave-analysis':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-blue-900">Total Requests</h4>
                <p className="text-3xl font-bold text-blue-900">{summary?.totalRequests || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-green-900">Approved</h4>
                <p className="text-3xl font-bold text-green-900">{summary?.approvedRequests || 0}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-yellow-900">Pending</h4>
                <p className="text-3xl font-bold text-yellow-900">{summary?.pendingRequests || 0}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-red-900">Rejected</h4>
                <p className="text-3xl font-bold text-red-900">{summary?.rejectedRequests || 0}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Leave Type Analysis</h4>
              <div className="space-y-3">
                {data.leaveTypes?.map((leaveType, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900 capitalize">{leaveType._id}</span>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-green-600">Approved: {leaveType.approved}</span>
                      <span className="text-yellow-600">Pending: {leaveType.pending}</span>
                      <span className="text-red-600">Rejected: {leaveType.rejected}</span>
                      <span className="font-bold text-gray-900">Total: {leaveType.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'attendance-report':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-green-900">Present Days</h4>
                <p className="text-3xl font-bold text-green-900">{summary?.presentDays || 0}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-red-900">Absent Days</h4>
                <p className="text-3xl font-bold text-red-900">{summary?.absentDays || 0}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-yellow-900">Late Days</h4>
                <p className="text-3xl font-bold text-yellow-900">{summary?.lateDays || 0}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-blue-900">Total Days</h4>
                <p className="text-3xl font-bold text-blue-900">{summary?.totalDays || 0}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Monthly Attendance Trend</h4>
              <div className="space-y-3">
                {data.monthlyAttendance?.slice(-6).map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">
                      {formatDate(`${month._id.year}-${month._id.month}-01`)}
                    </span>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-green-600">Present: {month.present}</span>
                      <span className="text-red-600">Absent: {month.absent}</span>
                      <span className="text-yellow-600">Late: {month.late}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            Preview not available for this report type
          </div>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          {summary?.title} Preview
        </h3>
        <div className="text-sm text-gray-500">
          {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
        </div>
      </div>

      {getPreviewContent()}
    </div>
  );
};

export default ReportPreview;