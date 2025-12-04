import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { 
  FileTextIcon, 
  DownloadIcon, 
  FilterIcon, 
  CalendarIcon,
  UsersIcon,
  TrendingUpIcon,
  BarChartIcon,
  PieChartIcon,
  TableIcon,
  EyeIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import DateRangePicker from '../../components/Common/DateRangePicker';
import DepartmentFilter from '../../components/Common/DepartmentFilter';
import EmployeeFilter from '../../components/Common/EmployeeFilter';
import ReportChart from './ReportChart';
import ReportTable from './ReportTable';
import ReportExport from './ReportExport';
import ReportPreview from './ReportPreview';

const Reports = () => {
  const { user } = useAuthStore();
  const [reportType, setReportType] = useState('employee-summary');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [department, setDepartment] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [viewMode, setViewMode] = useState('chart'); // 'chart', 'table', 'preview'
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const reportTypes = [
    { value: 'employee-summary', label: 'Employee Summary', icon: UsersIcon },
    { value: 'leave-analysis', label: 'Leave Analysis', icon: CalendarIcon },
    { value: 'attendance-report', label: 'Attendance Report', icon: TrendingUpIcon },
    { value: 'travel-summary', label: 'Travel Summary', icon: FileTextIcon },
    { value: 'department-analytics', label: 'Department Analytics', icon: BarChartIcon },
    { value: 'payroll-summary', label: 'Payroll Summary', icon: PieChartIcon }
  ];

  const generateReport = async () => {
    try {
      setLoading(true);
      
      const params = {
        reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        department,
        employeeId,
        format: 'json'
      };

      let endpoint = '/reports/dashboard';
      
      // Route to specific report endpoints
      switch (reportType) {
        case 'employee-summary':
          endpoint = '/reports/employee';
          break;
        case 'leave-analysis':
          endpoint = '/reports/leave';
          break;
        case 'attendance-report':
          endpoint = '/reports/attendance';
          break;
        case 'travel-summary':
          endpoint = '/reports/travel';
          break;
        case 'department-analytics':
          endpoint = '/reports/department';
          break;
        case 'payroll-summary':
          endpoint = '/reports/payroll';
          break;
      }

      const response = await api.get(endpoint, { params });
      setReportData(response.data.data);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Error generating report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const params = {
        reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        department,
        employeeId,
        format
      };

      const response = await api.get('/reports/export', { 
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportType}-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
      setIsExportModalOpen(false);
    } catch (error) {
      toast.error('Error exporting report');
    }
  };

  const getChartData = () => {
    if (!reportData) return [];

    switch (reportType) {
      case 'employee-summary':
        return reportData.departmentStats || [];
      case 'leave-analysis':
        return reportData.leaveTypes || [];
      case 'attendance-report':
        return reportData.attendance || [];
      case 'travel-summary':
        return reportData.statusStats || [];
      case 'department-analytics':
        return reportData.departments || [];
      case 'payroll-summary':
        return reportData.payroll || [];
      default:
        return [];
    }
  };

  const getTableColumns = () => {
    switch (reportType) {
      case 'employee-summary':
        return [
          { key: 'department', label: 'Department' },
          { key: 'totalEmployees', label: 'Total Employees' },
          { key: 'activeEmployees', label: 'Active Employees' },
          { key: 'avgSalary', label: 'Average Salary' }
        ];
      case 'leave-analysis':
        return [
          { key: 'leaveType', label: 'Leave Type' },
          { key: 'totalRequests', label: 'Total Requests' },
          { key: 'approved', label: 'Approved' },
          { key: 'pending', label: 'Pending' },
          { key: 'rejected', label: 'Rejected' }
        ];
      case 'attendance-report':
        return [
          { key: 'date', label: 'Date' },
          { key: 'present', label: 'Present' },
          { key: 'absent', label: 'Absent' },
          { key: 'late', label: 'Late' },
          { key: 'totalHours', label: 'Total Hours' }
        ];
      case 'travel-summary':
        return [
          { key: 'status', label: 'Status' },
          { key: 'count', label: 'Count' },
          { key: 'totalCost', label: 'Total Cost' },
          { key: 'avgCost', label: 'Average Cost' }
        ];
      default:
        return [];
    }
  };

  const getReportSummary = () => {
    if (!reportData) return null;

    switch (reportType) {
      case 'employee-summary':
        return {
          title: 'Employee Summary Report',
          totalRecords: reportData.totalEmployees || 0,
          activeEmployees: reportData.activeEmployees || 0,
          departments: reportData.departmentCount || 0,
          averageSalary: reportData.averageSalary || 0
        };
      case 'leave-analysis':
        return {
          title: 'Leave Analysis Report',
          totalRequests: reportData.totalRequests || 0,
          approvedRequests: reportData.approvedRequests || 0,
          pendingRequests: reportData.pendingRequests || 0,
          rejectedRequests: reportData.rejectedRequests || 0
        };
      case 'attendance-report':
        return {
          title: 'Attendance Report',
          totalDays: reportData.totalDays || 0,
          presentDays: reportData.presentDays || 0,
          absentDays: reportData.absentDays || 0,
          lateDays: reportData.lateDays || 0
        };
      case 'travel-summary':
        return {
          title: 'Travel Summary Report',
          totalRequests: reportData.totalRequests || 0,
          approvedRequests: reportData.approvedRequests || 0,
          totalCost: reportData.totalCost || 0,
          pendingRequests: reportData.pendingRequests || 0
        };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Generate comprehensive HR reports and analytics
          </p>
        </div>
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <DownloadIcon className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Report Configuration */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Report Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onStartDateChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
              onEndDateChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
            />
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <DepartmentFilter
              value={department}
              onChange={setDepartment}
              includeAll={true}
            />
          </div>

          {/* Employee Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee
            </label>
            <EmployeeFilter
              value={employeeId}
              onChange={setEmployeeId}
              department={department}
              includeAll={true}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={generateReport}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <BarChartIcon className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      {reportData && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {getReportSummary()?.title || 'Report'}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('chart')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  viewMode === 'chart' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <PieChartIcon className="h-4 w-4 inline mr-1" />
                Chart
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  viewMode === 'table' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <TableIcon className="h-4 w-4 inline mr-1" />
                Table
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  viewMode === 'preview' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <EyeIcon className="h-4 w-4 inline mr-1" />
                Preview
              </button>
            </div>
          </div>

          {/* Chart Type Selection for Chart View */}
          {viewMode === 'chart' && (
            <div className="mt-4 flex items-center space-x-4">
              <span className="text-sm text-gray-600">Chart Type:</span>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="area">Area Chart</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Report Content */}
      {reportData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          {getReportSummary() && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(getReportSummary()).slice(1).map(([key, value]) => (
                <div key={key} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {typeof value === 'number' && value > 1000 
                          ? `$${value.toLocaleString()}`
                          : value.toLocaleString()
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Report Visualization */}
          {viewMode === 'chart' && (
            <ReportChart
              data={getChartData()}
              chartType={chartType}
              reportType={reportType}
            />
          )}

          {viewMode === 'table' && (
            <ReportTable
              data={getChartData()}
              columns={getTableColumns()}
              reportType={reportType}
            />
          )}

          {viewMode === 'preview' && (
            <ReportPreview
              data={reportData}
              reportType={reportType}
              dateRange={dateRange}
              summary={getReportSummary()}
            />
          )}
        </div>
      )}

      {/* Export Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Report"
        size="medium"
      >
        <ReportExport
          onExport={handleExport}
          onCancel={() => setIsExportModalOpen(false)}
          reportType={reportType}
        />
      </Modal>
    </div>
  );
};

export default Reports;