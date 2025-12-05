import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { 
  PlusIcon, 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  FilterIcon,
  DownloadIcon,
  EyeIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import LeaveRequestForm from './LeaveRequestForm';
// import LeaveBalanceCard from './LeaveBalanceCard';
// import LeaveStatusBadge from './LeaveStatusBadge';
import Modal from '../../components/Common/Modal';
import DataTable from '../../components/Common/DataTable';
import DateRangePicker from '../../components/common/DateRangePicker';

const LeaveManagement = () => {
  const { user } = useAuthStore();
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    leaveType: '',
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [upcomingLeaves, setUpcomingLeaves] = useState([]);

  const leaveTypes = ['annual', 'sick', 'personal', 'maternity', 'paternity', 'bereavement'];
  const statuses = ['pending', 'approved', 'rejected', 'cancelled'];

  useEffect(() => {
    fetchLeaves();
    fetchLeaveBalance();
    fetchUpcomingLeaves();
  }, [currentPage, filters]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...filters
      });

      const response = await api.get(`/leaves?${queryParams}`);
      setLeaves(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      toast.error('Error fetching leaves');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const response = await api.get('/leaves/my-balance');
      setLeaveBalance(response.data.data);
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    }
  };

  const fetchUpcomingLeaves = async () => {
    try {
      const response = await api.get('/leaves/upcoming');
      setUpcomingLeaves(response.data.data);
    } catch (error) {
      console.error('Error fetching upcoming leaves:', error);
    }
  };

  const handleCreateLeave = () => {
    setSelectedLeave(null);
    setIsModalOpen(true);
  };

  const handleViewLeave = (leave) => {
    setSelectedLeave(leave);
    setIsDetailModalOpen(true);
  };

  const handleSaveLeave = async (leaveData) => {
    try {
      if (selectedLeave) {
        await api.put(`/leaves/${selectedLeave._id}`, leaveData);
        toast.success('Leave updated successfully');
      } else {
        await api.post('/leaves', leaveData);
        toast.success('Leave request created successfully');
      }
      setIsModalOpen(false);
      fetchLeaves();
      fetchLeaveBalance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving leave');
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (window.confirm('Are you sure you want to cancel this leave request?')) {
      try {
        await api.put(`/leaves/${leaveId}/cancel`, { 
          reason: 'Cancelled by employee' 
        });
        toast.success('Leave cancelled successfully');
        fetchLeaves();
        fetchLeaveBalance();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error cancelling leave');
      }
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await api.get(`/leaves/export?${queryParams}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leaves-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Error exporting leaves');
    }
  };

  const columns = [
    { key: 'leaveId', label: 'Leave ID' },
    { key: 'leaveType', label: 'Type' },
    { key: 'dates', label: 'Dates' },
    { key: 'days', label: 'Days' },
    { key: 'status', label: 'Status' },
    { key: 'reason', label: 'Reason' },
    { key: 'actions', label: 'Actions' }
  ];

  const formatLeaveData = (leave) => ({
    ...leave,
    leaveId: `LV${leave._id.slice(-6).toUpperCase()}`,
    dates: `${new Date(leave.startDate).toLocaleDateString()} - ${new Date(leave.endDate).toLocaleDateString()}`,
    canCancel: leave.status === 'pending' && leave.employee._id === user.id,
    canView: true
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your leave requests and track approval status
          </p>
        </div>
        <button
          onClick={handleCreateLeave}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Request Leave
        </button>
      </div>

      {/* Leave Balance Cards */}
      {leaveBalance && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(leaveBalance.balance).map(([type, balance]) => (
            <LeaveBalanceCard
              key={type}
              leaveType={type}
              balance={balance}
            />
          ))}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{leaves.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaves.filter(l => l.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaves.filter(l => l.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <XCircleIcon className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaves.filter(l => l.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-wrap items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FilterIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={filters.leaveType}
              onChange={(e) => handleFilterChange('leaveType', e.target.value)}
              className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {leaveTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            <DateRangePicker
              startDate={filters.startDate}
              endDate={filters.endDate}
              onStartDateChange={(date) => handleFilterChange('startDate', date)}
              onEndDateChange={(date) => handleFilterChange('endDate', date)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Leaves */}
      {upcomingLeaves.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Leaves</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {upcomingLeaves.slice(0, 5).map((leave) => (
                <div key={leave._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {leave.employee.personalInfo.firstName.charAt(0)}
                        {leave.employee.personalInfo.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {leave.employee.personalInfo.firstName} {leave.employee.personalInfo.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {leave.leaveType} • {leave.days} days
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      {new Date(leave.startDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.ceil((new Date(leave.startDate) - new Date()) / (1000 * 60 * 60 * 24))} days away
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Leaves Table */}
      <DataTable
        columns={columns}
        data={leaves.map(formatLeaveData)}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        actions={(leave) => (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleViewLeave(leave)}
              className="text-blue-600 hover:text-blue-900 p-1"
              title="View Details"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
            {leave.canCancel && (
              <button
                onClick={() => handleCancelLeave(leave._id)}
                className="text-red-600 hover:text-red-900 text-sm font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      />

      {/* Leave Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Request Leave"
        size="large"
      >
        <LeaveRequestForm
          onSave={handleSaveLeave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Leave Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Leave Details"
        size="large"
      >
        <LeaveDetailView
          leave={selectedLeave}
          onClose={() => setIsDetailModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

// Supporting Components
const LeaveBalanceCard = ({ leaveType, balance }) => (
  <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 capitalize">
          {leaveType.replace('_', ' ')}
        </p>
        <p className="text-2xl font-bold text-gray-900">
          {balance.remaining}
        </p>
        <p className="text-xs text-gray-500">
          of {balance.entitled} available
        </p>
      </div>
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
        <CalendarIcon className="h-6 w-6 text-blue-600" />
      </div>
    </div>
    <div className="mt-3">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full" 
          style={{ width: `${balance.percentage}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {balance.used} used • {balance.percentage}%
      </p>
    </div>
  </div>
);

const LeaveStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'yellow', icon: ClockIcon },
    approved: { color: 'green', icon: CheckCircleIcon },
    rejected: { color: 'red', icon: XCircleIcon },
    cancelled: { color: 'gray', icon: XCircleIcon }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const LeaveDetailView = ({ leave, onClose }) => {
  if (!leave) return null;

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Leave Type</p>
            <p className="text-sm text-gray-900 capitalize">{leave.leaveType}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Status</p>
            <LeaveStatusBadge status={leave.status} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Start Date</p>
            <p className="text-sm text-gray-900">{new Date(leave.startDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">End Date</p>
            <p className="text-sm text-gray-900">{new Date(leave.endDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Days</p>
            <p className="text-sm text-gray-900">{leave.days} {leave.isHalfDay && '(Half Day)'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Applied On</p>
            <p className="text-sm text-gray-900">{new Date(leave.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-600">Reason</p>
          <p className="text-sm text-gray-900">{leave.reason}</p>
        </div>

        {leave.approvalNote && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">Approval Note</p>
            <p className="text-sm text-gray-900">{leave.approvalNote}</p>
          </div>
        )}

        {leave.rejectionReason && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">Rejection Reason</p>
            <p className="text-sm text-gray-900">{leave.rejectionReason}</p>
          </div>
        )}

        {leave.cancellationReason && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">Cancellation Reason</p>
            <p className="text-sm text-gray-900">{leave.cancellationReason}</p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LeaveManagement;