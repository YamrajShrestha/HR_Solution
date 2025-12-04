import React, { useState } from 'react';
import { PhoneIcon, UserIcon, SaveIcon, XIcon, EditIcon } from 'lucide-react';

const EmergencyContact = ({ data, onSave, isEditing, setIsEditing, hasChanges }) => {
  const [formData, setFormData] = useState({
    name: data?.name || '',
    relationship: data?.relationship || '',
    phone: data?.phone || ''
  });

  const [originalData, setOriginalData] = useState(formData);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    setOriginalData(formData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleSave = async () => {
    await onSave(formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Emergency Contact</h3>
        {!isEditing ? (
          <button onClick={handleEdit} className="flex items-center px-3 py-2 border rounded-md text-sm">
            <EditIcon className="w-4 h-4 mr-2" /> Edit
          </button>
        ) : (
          <div className="flex space-x-2">
            <button onClick={handleCancel} className="flex items-center px-3 py-2 border rounded-md text-sm">
              <XIcon className="w-4 h-4 mr-2" /> Cancel
            </button>
            <button onClick={handleSave} disabled={!hasChanges} className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50">
              <SaveIcon className="w-4 h-4 mr-2" /> Save
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
            placeholder="Full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
          <select
            value={formData.relationship}
            onChange={(e) => handleInputChange('relationship', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
          >
            <option value="">Select Relationship</option>
            <option value="spouse">Spouse</option>
            <option value="parent">Parent</option>
            <option value="sibling">Sibling</option>
            <option value="friend">Friend</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>
    </div>
  );
};

export default EmergencyContact;