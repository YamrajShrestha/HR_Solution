import React, { useState } from 'react';
import { DollarSignIcon, SaveIcon, CalendarIcon, PercentIcon } from 'lucide-react';
import { toast } from 'react-toastify';

const PayrollSettings = ({ settings, onSave, onChange, loading, hasChanges }) => {
  const [formData, setFormData] = useState(settings || {
    currency: 'USD',
    paySchedule: 'monthly',
    payDay: 1,
    taxSettings: {
      federalTax: true,
      stateTax: true,
      socialSecurity: true,
      medicare: true
    },
    deductions: {
      healthInsurance: { enabled: true, percentage: 5 },
      retirement: { enabled: true, percentage: 3 },
      other: { enabled: false, percentage: 0 }
    },
    overtime: {
      enabled: true,
      rate: 1.5
    },
    bonuses: {
      enabled: true,
      frequency: 'quarterly'
    }
  });

  const handleInputChange = (section, field, value) => {
    const updated = { ...formData, [section]: { ...formData[section], [field]: value } };
    setFormData(updated);
    onChange(section, updated[section]);
  };

  const handleSave = async () => {
    await onSave(formData);
    toast.success('Payroll settings saved');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <DollarSignIcon className="w-5 h-5 mr-2" />
            Payroll Settings
          </h2>
          <p className="text-sm text-gray-600">Configure payroll calculations and schedules</p>
        </div>

        <div className="p-6 space-y-8">
          {/* General Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="NPR">NPR</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pay Schedule</label>
                <select
                  value={formData.paySchedule}
                  onChange={(e) => setFormData({ ...formData, paySchedule: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pay Day</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.payDay}
                  onChange={(e) => setFormData({ ...formData, payDay: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tax Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tax Settings</h3>
            <div className="space-y-3">
              {Object.entries(formData.taxSettings).map(([key, value]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleInputChange('taxSettings', key, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Deductions</h3>
            <div className="space-y-4">
              {Object.entries(formData.deductions).map(([key, config]) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.enabled}
                        onChange={(e) => handleInputChange('deductions', key, { ...config, enabled: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enabled</span>
                    </label>
                  </div>
                  {config.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Percentage (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={config.percentage}
                          onChange={(e) => handleInputChange('deductions', key, { ...config, percentage: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Overtime & Bonuses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Overtime</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.overtime.enabled}
                    onChange={(e) => handleInputChange('overtime', 'enabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Overtime</span>
                </label>
                {formData.overtime.enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Overtime Rate</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="3"
                      value={formData.overtime.rate}
                      onChange={(e) => handleInputChange('overtime', 'rate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bonuses</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.bonuses.enabled}
                    onChange={(e) => handleInputChange('bonuses', 'enabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Bonuses</span>
                </label>
                {formData.bonuses.enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                    <select
                      value={formData.bonuses.frequency}
                      onChange={(e) => handleInputChange('bonuses', 'frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                )}
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

export default PayrollSettings;