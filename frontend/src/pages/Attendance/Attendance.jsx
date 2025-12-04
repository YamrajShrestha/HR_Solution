import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { 
  ClockIcon, 
  MapPinIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CalendarIcon,
  UserIcon,
  DownloadIcon,
  FilterIcon,
  EyeIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import AttendanceCalendar from './AttendanceCalendar';
import AttendanceStats from './AttendanceStats';
import CheckInOut from './CheckInOut';
import DataTable from '../../components/Common/DataTable';
import Modal from '../../components/Common/Modal';
import AttendanceDetailView from './AttendanceDetailView';
import DateRangePicker from '../../components/common/DateRangePicker';

const Attendance = () => {
  const { user } = useAuthStore();
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayStatus, setTodayStatus] = useState(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filters, setFilters] = {
    status: '',
    startDate: '',
    endDate: '',
    employeeId: ''
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'
  const [employees, setEmployees] = useState([]);

  const attendanceStatuses = ['present', 'absent', 'late', 'half-day', 'on-leave'];

  useEffect(() => {
    fetchAttendance();
    fetchAttendanceStats();
    fetchTodayStatus();
    fetchEmployees();
  }, [currentPage, filters]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...filters
      });

      const response = await api.get(`/attendance?${queryParams}`);
      setAttendance(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      toast.error('Error fetching attendance records');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await api.get(`/attendance/stats?${queryParams}`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    }
  };

  const fetchTodayStatus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get(`/attendance?startDate=${today}&endDate=${today}`);
      setTodayStatus(response.data.data[0] || null);
    } catch (error) {
      console.error('Error fetching today status:', error);
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

  const handleCheckInOut = () => {
    setIsCheckInModalOpen(true);
  };

  const handleCheckInOutSuccess = () => {
    setIsCheckInModalOpen(false);
    fetchTodayStatus();
    fetchAttendance();
    fetchAttendanceStats();
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
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
      
      const response = await api.get(`/reports/attendance?${queryParams}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Error exporting attendance data');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      present: 'green',
      absent: 'red',
      late: 'yellow',
      'half-day': 'orange',
      'on-leave': 'purple'
    };
    return colors[status] || 'gray';
  };

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'employee', label: 'Employee' },
    { key: 'checkIn', label: 'Check In' },
    { key: 'checkOut', label: 'Check Out' },
    { key: 'workHours', label: 'Work Hours' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ];

  const formatAttendanceData = (record) => ({
    ...record,
    date: new Date(record.date).toLocaleDateString(),
    employee: `${record.employee.personalInfo.firstName} ${record.employee.personalInfo.lastName}`,
    checkIn: record.checkIn?.time ? new Date(record.checkIn.time).toLocaleTimeString() : '-',
    checkOut: record.checkOut?.time ? new Date(record.checkOut.time).toLocaleTimeString() : '-',
    workHours: record.workHours ? `${record.workHours}h` : '-',
    overtimeHours: record.overtimeHours ? `${record.overtimeHours}h` : '-',
    statusColor: getStatusColor(record.status)
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track employee attendance and working hours
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'calendar' : 'table')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {viewMode === 'table' ? 'Calendar View' : 'Table View'}
          </button>
          <button
            onClick={handleCheckInOut}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <ClockIcon className="h-4 w-4 mr-2" />
            Check In/Out
          </button>
        </div>
      </div>

      {/* Today's Status Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Today's Status</h3>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <div className="text-right">
            {todayStatus ? (
              <div>
                <p className={`text-sm font-medium ${todayStatus.status === 'present' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {todayStatus.status === 'present' ? 'Checked In' : 'Checked In (Late)'}
                </p>
                <p className="text-xs text-gray-500">
                  {todayStatus.checkIn.time ? new Date(todayStatus.checkIn.time).toLocaleTimeString() : '-'}
                </p>
                {todayStatus.checkOut.time && (
                  <p className="text-xs text-green-600">Checked Out</p>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500">Not checked in yet</p>
                <button
                  onClick={handleCheckInOut}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Check In Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <AttendanceStats stats={stats} />
      )}

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
              {attendanceStatuses.map(status => (
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

      {/* View Mode Toggle */}
      {viewMode === 'calendar' ? (
        <AttendanceCalendar 
          attendance={attendance}
          onDateClick={handleViewDetails}
        />
      ) : (
        <>
          {/* Attendance Table */}
          <DataTable
            columns={columns}
            data={attendance.map(formatAttendanceData)}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            actions={(record) => (
              <button
                onClick={() => handleViewDetails(record)}
                className="text-blue-600 hover:text-blue-900 p-1"
                title="View Details"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
            )}
          />
        </>
      )}

      {/* Check In/Out Modal */}
      <Modal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        title="Check In/Out"
        size="large"
      >
        <CheckInOut
          todayStatus={todayStatus}
          onSuccess={handleCheckInOutSuccess}
          onCancel={() => setIsCheckInModalOpen(false)}
        />
      </Modal>

      {/* Attendance Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Attendance Details"
        size="large"
      >
        <AttendanceDetailView
          record={selectedRecord}
          onClose={() => setIsDetailModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

// Supporting Components
const AttendanceStats = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <ClockIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">Total Days</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalDays}</p>
        </div>
      </div>
    </div>
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircleIcon className="h-6 w-6 text-green-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">Present</p>
          <p className="text-2xl font-bold text-gray-900">{stats.presentDays}</p>
        </div>
      </div>
    </div>
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <XCircleIcon className="h-6 w-6 text-red-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">Absent</p>
          <p className="text-2xl font-bold text-gray-900">{stats.absentDays}</p>
        </div>
      </div>
    </div>
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
          <ClockIcon className="h-6 w-6 text-yellow-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">Late Days</p>
          <p className="text-2xl font-bold text-gray-900">{stats.lateDays}</p>
        </div>
      </div>
    </div>
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
          <ClockIcon className="h-6 w-6 text-purple-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">Work Hours</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalWorkHours}h</p>
        </div>
      </div>
    </div>
  </div>
);

const CheckInOut = ({ todayStatus, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const getCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          setIsLocating(false);
        },
        (error) => {
          toast.error('Unable to get location');
          setIsLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
      setIsLocating(false);
    }
  };

  const handleCheckIn = async () => {
    setIsLoading(true);
    try {
      await api.post('/attendance/checkin', {
        latitude: location?.latitude,
        longitude: location?.longitude,
        address: location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 'Unknown',
        type: 'web',
        note: 'Checked in via web app'
      });
      toast.success('Check-in successful!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    try {
      await api.post('/attendance/checkout', {
        latitude: location?.latitude,
        longitude: location?.longitude,
        address: location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 'Unknown',
        type: 'web',
        note: 'Checked out via web app'
      });
      toast.success('Check-out successful!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Location Status */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPinIcon className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Location</p>
              <p className="text-xs text-gray-500">
                {location ? `Accuracy: ±${location.accuracy}m` : 'Location not captured'}
              </p>
            </div>
          </div>
          <button
            onClick={getCurrentLocation}
            disabled={isLocating}
            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50"
          >
            {isLocating ? 'Getting location...' : 'Get Location'}
          </button>
        </div>
        {location && (
          <p className="text-xs text-gray-600 mt-2">
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {!todayStatus?.checkIn.time ? (
          <button
            onClick={handleCheckIn}
            disabled={isLoading || isLocating}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Checking In...' : 'Check In'}
          </button>
        ) : !todayStatus?.checkOut.time ? (
          <button
            onClick={handleCheckOut}
            disabled={isLoading}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Checking Out...' : 'Check Out'}
          </button>
        ) : (
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-800 font-medium">Day Complete!</p>
            <p className="text-sm text-green-600">You've already checked out for today</p>
          </div>
        )}
      </div>

      {/* Geo-fencing Info */}
      <div className="p-3 bg-yellow-50 rounded-lg">
        <p className="text-xs text-yellow-800">
          <strong>Note:</strong> Location tracking helps verify your attendance. 
          Please ensure you're within the designated office area when checking in/out.
        </p>
      </div>
    </div>
  );
};

const AttendanceDetailView = ({ record, onClose }) => {
  if (!record) return null;

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Employee</p>
            <p className="text-sm text-gray-900">{record.employee}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Date</p>
            <p className="text-sm text-gray-900">{record.date}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Check In</p>
            <p className="text-sm text-gray-900">{record.checkIn}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Check Out</p>
            <p className="text-sm text-gray-900">{record.checkOut}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Work Hours</p>
            <p className="text-sm text-gray-900">{record.workHours}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Overtime</p>
            <p className="text-sm text-gray-900">{record.overtimeHours || '0h'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Status</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${record.statusColor}-100 text-${record.statusColor}-800 capitalize`}>
              {record.status.replace('-', ' ')}
            </span>
          </div>
        </div>

        {record.checkIn?.note && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">Check-in Note</p>
            <p className="text-sm text-gray-900">{record.checkIn.note}</p>
          </div>
        )}

        {record.checkOut?.note && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">Check-out Note</p>
            <p className="text-sm text-gray-900">{record.checkOut.note}</p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
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

export default Attendance;