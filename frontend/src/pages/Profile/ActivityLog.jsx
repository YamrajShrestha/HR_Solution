// frontend/src/pages/Profile/ActivityLog.jsx
import React, { useState, useEffect } from 'react';
import { ActivityIcon, ClockIcon, MapPinIcon, ShieldIcon, MailIcon, KeyIcon } from 'lucide-react';
import { format } from 'date-fns';

const ActivityLog = ({ activities, employeeId }) => {
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const activityTypes = [
    { value: 'all', label: 'All Activities', icon: ActivityIcon },
    { value: 'login', label: 'Login', icon: KeyIcon },
    { value: 'security', label: 'Security', icon: ShieldIcon },
    { value: 'profile', label: 'Profile Updates', icon: MailIcon }
  ];

  useEffect(() => {
    let filtered = activities || [];

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(activity => activity.type === filter);
    }

    // Filter by date range
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        return activityDate >= dateRange.start && activityDate <= dateRange.end;
      });
    }

    setFilteredActivities(filtered);
  }, [activities, filter, dateRange]);

  const getActivityIcon = (type) => {
    const activityType = activityTypes.find(t => t.value === type);
    if (activityType) {
      const Icon = activityType.icon;
      return <Icon className="h-5 w-5" />;
    }
    return <ActivityIcon className="h-5 w-5" />;
  };

  const getActivityColor = (type) => {
    const colors = {
      login: 'bg-blue-100 text-blue-600',
      security: 'bg-red-100 text-red-600',
      profile: 'bg-green-100 text-green-600',
      default: 'bg-gray-100 text-gray-600'
    };
    return colors[type] || colors.default;
  };

  const formatActivityTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM dd, yyyy HH:mm');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {activityTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <input
              type="date"
              onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
              className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
              className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredActivities.length} activities found
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ActivityIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No activities found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            filteredActivities.map((activity, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {formatActivityTime(activity.timestamp)}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>

                    {activity.details && (
                      <div className="mt-2 text-xs text-gray-500">
                        <p>{activity.details}</p>
                      </div>
                    )}

                    {activity.ipAddress && (
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <MapPinIcon className="h-3 w-3 mr-1" />
                        <span>IP: {activity.ipAddress}</span>
                        {activity.location && (
                          <span className="ml-2">Location: {activity.location}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
                      {activity.type}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Load More */}
      {filteredActivities.length > 0 && (
        <div className="text-center">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Load More Activities
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;