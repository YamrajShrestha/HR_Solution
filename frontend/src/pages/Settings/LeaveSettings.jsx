import React, { useState } from 'react';
import { CalendarIcon, SaveIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { toast } from 'react-toastify';

const LeaveSettings = ({ settings, onSave, onChange, loading, hasChanges }) => {
  const [formData, setFormData] = useState(settings || {
    types: [
      { name: 'Annual Leave', code: 'annual', days: 20, carryForward: false, maxCarryForward: 0 },
      { name: 'Sick Leave', code: 'sick', days: 10, carryForward: false, maxCarryForward: 0 },
      { name: 'Personal Leave', code: 'personal', days: 5, carryForward: false, maxCarryForward: 0 }
    ],
    policies: {
      minNoticeDays: 7,
      maxConsecutiveDays: 30,
      allowHalfDay: true,
      requireApproval: true,
      allowNegativeBalance: false
    }
  });

  const [newLeaveType, setNewLeaveType] = useState({
    name: '',
    code: '',
    days: 0,
    carryForward: false,
    maxCarryForward: 0
  });

  const handlePolicyChange = (key, value) => {
    const updated = {
      ...formData,
      policies: { ...formData.policies, [key]: value }
    };
    setFormData(updated);
    onChange('policies', updated.policies);
  };

  const handleLeaveTypeChange = (index, field, value) => {
    const updated = [...formData.types];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, types: updated });
    onChange('types', updated);
  };

  const handleAddLeaveType = () => {
    if (!newLeaveType.name || !newLeaveType.code) {
      toast.warning('Please fill in name and code');
      return;
    }
    setFormData({
      ...formData,
      types: [...formData.types, newLeaveType]
    });
    setNewLeaveType({ name: '', code: '', days: 0, carryForward: false, maxCarryForward: 0 });
  };

  const handleRemoveLeaveType = (index) => {
    const updated = formData.types.filter((_, i) => i !== index);
    setFormData({ ...formData, types: updated });
  };

  const handleSave = async () => {
    await onSave(formData);
    toast.success('Leave settings saved');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            Leave Settings
          </h2>
          <p className="text-sm text-gray-600">Configure leave types and policies</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Leave Types */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Types</h3>
            <div className="space-y-4">
              {formData.types.map((type, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={type.name}
                        onChange={(e) => handleLeaveTypeChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                      <input
                        type="text"
                        value={type.code}
                        onChange={(e) => handleLeaveTypeChange(index, 'code', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Days/Year</label>
                      <input
                        type="number"
                        value={type.days}
                        onChange={(e) => handleLeaveTypeChange(index, 'days', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={type.carryForward}
                          onChange={(e) => handleLeaveTypeChange(index, 'carryForward', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Carry Forward</span>
                      </label>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => handleRemoveLeaveType(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New Leave Type */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Leave Type</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newLeaveType.name}
                    onChange={(e) => setNewLeaveType({ ...newLeaveType, name: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Code"
                    value={newLeaveType.code}
                    onChange={(e) => setNewLeaveType({ ...newLeaveType, code: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Days"
                    value={newLeaveType.days}
                    onChange={(e) => setNewLeaveType({ ...newLeaveType, days: parseInt(e.target.value) })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newLeaveType.carryForward}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, carryForward: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Carry Forward</span>
                  </label>
                  <button
                    onClick={handleAddLeaveType}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                  >
                    <PlusIcon className="w-4 h-4 mr-2 inline" /> Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* General Policies */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Policies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Notice (days)</label>
                <input
                  type="number"
                  value={formData.policies.minNoticeDays}
                  onChange={(e) => handlePolicyChange('minNoticeDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Consecutive Days</label>
                <input
                  type="number"
                  value={formData.policies.maxConsecutiveDays}
                  onChange={(e) => handlePolicyChange('maxConsecutiveDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.policies.allowHalfDay}
                    onChange={(e) => handlePolicyChange('allowHalfDay', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Allow Half-Day Leave</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.policies.requireApproval}
                    onChange={(e) => handlePolicyChange('requireApproval', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Require Approval</span>
                </label>
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

export default LeaveSettings;