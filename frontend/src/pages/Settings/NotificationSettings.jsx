import React, { useState } from 'react';
import { BellIcon, MailIcon, SmartphoneIcon, SaveIcon } from 'lucide-react';
import { toast } from 'react-toastify';

const NotificationSettings = ({ settings, onSave, onChange, loading, hasChanges }) => {
  const [formData, setFormData] = useState(settings || {
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
      enabled: true,
      sound: true,
      desktop: true,
      frequency: 'real-time'
    }
  });

  const handleToggle = (category, key, value) => {
    const updated = { ...formData, [category]: { ...formData[category], [key]: value } };
    setFormData(updated);
    onChange(category, updated[category]);
  };

  const handleSave = async () => {
    await onSave(formData);
    toast.success('Notification settings saved');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <BellIcon className="w-5 h-5 mr-2" />
            Notification Settings
          </h2>
          <p className="text-sm text-gray-600">Configure how you receive notifications</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Email Notifications */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MailIcon className="w-5 h-5 mr-2" />
              Email Notifications
            </h3>
            <div className="space-y-3">
              {Object.entries(formData.email).map(([key, value]) => (
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
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <SmartphoneIcon className="w-5 h-5 mr-2" />
              SMS Notifications
            </h3>
            <div className="space-y-3">
              {Object.entries(formData.sms).map(([key, value]) => (
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">In-App Notifications</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Enable In-App Notifications</span>
                <input
                  type="checkbox"
                  checked={formData.inApp.enabled}
                  onChange={(e) => handleToggle('inApp', 'enabled', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              {formData.inApp.enabled && (
                <>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Sound Alerts</span>
                    <input
                      type="checkbox"
                      checked={formData.inApp.sound}
                      onChange={(e) => handleToggle('inApp', 'sound', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Desktop Notifications</span>
                    <input
                      type="checkbox"
                      checked={formData.inApp.desktop}
                      onChange={(e) => handleToggle('inApp', 'desktop', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                    <select
                      value={formData.inApp.frequency}
                      onChange={(e) => handleToggle('inApp', 'frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                    >
                      <option value="real-time">Real-time</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading || !hasChanges}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <SaveIcon className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;