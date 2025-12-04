import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { 
  PlaneIcon, 
  MapPinIcon, 
  CalendarIcon, 
  DollarSignIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  EyeIcon,
  DownloadIcon,
  FilterIcon,
  UserIcon,
  FileTextIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import TravelRequestForm from './TravelRequestForm';
import TravelStats from './TravelStats';
import DataTable from '../../components/Common/DataTable';
import Modal from '../../components/Common/Modal';
import DateRangePicker from '../../components/Common/DateRangePicker';
import TravelDetailView from './TravelDetailView';
import StatusBadge from '../../components/Common/StatusBadge';

const TravelManagement = () => {
  const { user } = useAuthStore();
  const [travelRequests, setTravelRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTravel, setSelectedTravel] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    employeeId: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [employees, setEmployees] = useState([]);

  const travelStatuses = ['draft', 'pending', 'approved', 'rejected', 'completed', 'cancelled'];

  useEffect(() => {
    fetchTravelRequests();
    fetchTravelStats();
    fetchEmployees();
  }, [currentPage, filters]);

  const fetchTravelRequests = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...filters
      });

      const response = await api.get(`/travels?${queryParams}`);
      setTravelRequests(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      toast.error('Error fetching travel requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTravelStats = async () => {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await api.get(`/travels/stats?${queryParams}`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching travel stats:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees?limit=100');
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleCreateTravel = () => {
    setSelectedTravel(null);
    setIsModalOpen(true);
  };

  const handleViewTravel = (travel) => {
    setSelectedTravel(travel);
    setIsDetailModalOpen(true);
  };

  const handleSaveTravel = async (travelData) => {
    try {
      if (selectedTravel) {
        await api.put(`/travels/${selectedTravel._id}`, travelData);
        toast.success('Travel request updated successfully');
      } else {
        await api.post('/travels', travelData);
        toast.success('Travel request created successfully');
      }
      setIsModalOpen(false);
      fetchTravelRequests();
      fetchTravelStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving travel request');
    }
  };

  const handleApproveTravel = async (travelId, status) => {
    try {
      await api.put(`/travels/${travelId}/approve`, { status });
      toast.success(`Travel request ${status} successfully`);
      fetchTravelRequests();
      fetchTravelStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating travel status');
    }
  };

  const handleSubmitExpenses = async (travelId, expenses) => {
    try {
      await api.put(`/travels/${travelId}/expenses`, { actualExpenses: expenses });
      toast.success('Expense report submitted successfully');
      fetchTravelRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting expenses');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        format: 'csv'
      });
      
      const response = await api.get(`/reports/travel?${queryParams}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `travel-requests-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Error exporting travel data');
    }
  };

  const canApprove = (travel) => {
    return travel.status === 'pending' && ['manager', 'hr', 'admin'].includes(user.role);
  };

  const canEdit = (travel) => {
    return travel.status === 'draft' && travel.employee._id === user.id;
  };

  const canSubmitExpenses = (travel) => {
    return travel.status === 'completed' && travel.employee._id === user.id && !travel.actualExpenses?.length;
  };

  const columns = [
    { key: 'travelId', label: 'Travel ID' },
    { key: 'employee', label: 'Employee' },
    { key: 'purpose', label: 'Purpose' },
    { key: 'destination', label: 'Destination' },
    { key: 'dates', label: 'Travel Dates' },
    { key: 'totalCost', label: 'Total Cost' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ];

  const formatTravelData = (travel) => ({
    ...travel,
    travelId: `TRV${travel._id.slice(-6).toUpperCase()}`,
    employee: `${travel.employee.personalInfo.firstName} ${travel.employee.personalInfo.lastName}`,
    destination: `${travel.destination.city}, ${travel.destination.country}`,
    dates: `${new Date(travel.startDate).toLocaleDateString()} - ${new Date(travel.endDate).toLocaleDateString()}`,
    totalCost: `$${travel.totalEstimatedCost?.toLocaleString() || '0'}`,
    canApprove: canApprove(travel),
    canEdit: canEdit(travel),
    canSubmitExpenses: canSubmitExpenses(travel)
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Travel Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage business travel requests and approvals
          </p>
        </div>
        <button
          onClick={handleCreateTravel}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Request Travel
        </button>
      </div>

      {/* Travel Stats */}
      {stats && (
        <TravelStats stats={stats} />
      )}

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <PlaneIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{travelRequests.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {travelRequests.filter(t => t.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {travelRequests.filter(t => t.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSignIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">
                ${travelRequests.reduce((sum, t) => sum + (t.totalEstimatedCost || 0), 0).toLocaleString()}
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
            
            {['hr', 'admin', 'manager'].includes(user.role) && (
              <select
                value={filters.employeeId}
                onChange={(e) => handleFilterChange('employeeId', e.target.value)}
                className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Employees</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.personalInfo.firstName} {emp.personalInfo.lastName}
                  </option>
                ))}
              </select>
            )}

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              {travelStatuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
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
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Travel Requests Table */}
      <DataTable
        columns={columns}
        data={travelRequests.map(formatTravelData)}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        actions={(travel) => (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleViewTravel(travel)}
              className="text-blue-600 hover:text-blue-900 p-1"
              title="View Details"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
            
            {travel.canEdit && (
              <button
                onClick={() => {
                  setSelectedTravel(travel);
                  setIsModalOpen(true);
                }}
                className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
              >
                Edit
              </button>
            )}
            
            {travel.canApprove && (
              <>
                <button
                  onClick={() => handleApproveTravel(travel._id, 'approved')}
                  className="text-green-600 hover:text-green-900 text-sm font-medium"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApproveTravel(travel._id, 'rejected')}
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Reject
                </button>
              </>
            )}
            
            {travel.canSubmitExpenses && (
              <button
                onClick={() => {
                  setSelectedTravel(travel);
                  // Open expense submission modal
                }}
                className="text-purple-600 hover:text-purple-900 text-sm font-medium"
              >
                Submit Expenses
              </button>
            )}
          </div>
        )}
      />

      {/* Travel Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTravel ? 'Edit Travel Request' : 'Request Travel'}
        size="large"
      >
        <TravelRequestForm
          travel={selectedTravel}
          onSave={handleSaveTravel}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Travel Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Travel Details"
        size="large"
      >
        <TravelDetailView
          travel={selectedTravel}
          onClose={() => setIsDetailModalOpen(false)}
          onApprove={handleApproveTravel}
          onSubmitExpenses={handleSubmitExpenses}
        />
      </Modal>
    </div>
  );
};

export default TravelManagement;