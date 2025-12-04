import React, { useState } from 'react';
import { BellIcon, MailIcon, SmartphoneIcon, SaveIcon } from 'lucide-react';
import { toast } from 'react-toastify';

const NotificationPreferences = ({ preferences, onSave }) => {
  const [settings, setSettings] = useState(preferences || {
    email: {
      leaveRequests: true,
      attendanceAlerts: true,
      travelNotifications: true,
      payrollUpdates: true,
      systemAnnouncements: true
    },
    sms: {
      leaveApproval: false,
      attendanceReminders: false,
      emergencyAlerts: true
    },
    inApp: {
      all: true,
      sound: true,
      desktop: true
    }
  });

  const handleSave = async () => {
    await onSave(settings);
    toast.success('Notification preferences saved');
  };

  const handleToggle = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <BellIcon className="h-5 w-5 mr-2" />
            Notification Preferences
          </h3>
        </div>

        <div className="p-6 space-y-8">
          {/* Email Notifications */}
          <div>
            <h4 className="text-md font-medium text-gray-900 flex items-center mb-4">
              <MailIcon className="h-5 w-5 mr-2" />
              Email Notifications
            </h4>
            <div className="space-y-3">
              {Object.entries(settings.email).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleToggle('email', key, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* SMS Notifications */}
          <div>
            <h4 className="text-md font-medium text-gray-900 flex items-center mb-4">
              <SmartphoneIcon className="h-5 w-5 mr-2" />
              SMS Notifications
            </h4>
            <div className="space-y-3">
              {Object.entries(settings.sms).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleToggle('sms', key, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* In-App Notifications */}
          <div>
            <h4 className="text-md font-medium text-gray-900 flex items-center mb-4">
              <BellIcon className="h-5 w-5 mr-2" />
              In-App Notifications
            </h4>
            <div className="space-y-3">
              {Object.entries(settings.inApp).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleToggle('inApp', key, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <SaveIcon className="h-4 w-4 mr-2" />
          Save Preferences
        </button>
      </div>
    </div>
  );
};

export default NotificationPreferences;