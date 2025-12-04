import React, { useState } from 'react';
import { ClockIcon, MapPinIcon, SaveIcon } from 'lucide-react';
import { toast } from 'react-toastify';

const AttendanceSettings = ({ settings, onSave, onChange, loading, hasChanges }) => {
  const [formData, setFormData] = useState(settings || {
    officeLocation: {
      latitude: 27.7172,
      longitude: 85.3240,
      address: 'Kathmandu, Nepal'
    },
    geoFencing: {
      enabled: true,
      radius: 500,
      strictMode: false
    },
    workHours: {
      startTime: '09:00',
      endTime: '17:00',
      gracePeriod: 15,
      halfDayThreshold: 4
    },
    overtime: {
      enabled: true,
      autoCalculate: true,
      rate: 1.5
    },
    remoteWork: {
      enabled: true,
      requireApproval: true,
      allowCheckIn: true
    }
  });

  const handleInputChange = (section, field, value) => {
    const updated = {
      ...formData,
      [section]: { ...formData[section], [field]: value }
    };
    setFormData(updated);
    onChange(section, updated[section]);
  };

  const handleSave = async () => {
    await onSave(formData);
    toast.success('Attendance settings saved');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2" />
            Attendance Settings
          </h2>
          <p className="text-sm text-gray-600">Configure attendance tracking and geo-fencing</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Office Location */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="w-5 h-5 mr-2" />
              Office Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.officeLocation.latitude}
                  onChange={(e) => handleInputChange('officeLocation', 'latitude', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.officeLocation.longitude}
                  onChange={(e) => handleInputChange('officeLocation', 'longitude', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={formData.officeLocation.address}
                  onChange={(e) => handleInputChange('officeLocation', 'address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Geo-Fencing */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Geo-Fencing Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.geoFencing.enabled}
                    onChange={(e) => handleInputChange('geoFencing', 'enabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Geo-Fencing</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Radius (meters)</label>
                <input
                  type="number"
                  value={formData.geoFencing.radius}
                  onChange={(e) => handleInputChange('geoFencing', 'radius', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                  min="50"
                  max="5000"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.geoFencing.strictMode}
                    onChange={(e) => handleInputChange('geoFencing', 'strictMode', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Strict Mode</span>
                </label>
              </div>
            </div>
          </div>

          {/* Work Hours */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Work Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={formData.workHours.startTime}
                  onChange={(e) => handleInputChange('workHours', 'startTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.workHours.endTime}
                  onChange={(e) => handleInputChange('workHours', 'endTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grace Period (minutes)</label>
                <input
                  type="number"
                  value={formData.workHours.gracePeriod}
                  onChange={(e) => handleInputChange('workHours', 'gracePeriod', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                  min="0"
                  max="60"
                />
              </div>
            </div>
          </div>

          {/* Overtime */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Overtime Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.overtime.enabled}
                    onChange={(e) => handleInputChange('overtime', 'enabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Overtime</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.overtime.autoCalculate}
                    onChange={(e) => handleInputChange('overtime', 'autoCalculate', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto Calculate</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Overtime Rate</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.overtime.rate}
                  onChange={(e) => handleInputChange('overtime', 'rate', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                  min="1"
                  max="3"
                />
              </div>
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

export default AttendanceSettings;