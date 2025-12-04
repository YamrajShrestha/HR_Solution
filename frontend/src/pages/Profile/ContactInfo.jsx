import React, { useState } from 'react';
import { MailIcon, PhoneIcon, MapPinIcon, SaveIcon, XIcon, EditIcon } from 'lucide-react';

const ContactInfo = ({ data, onSave, isEditing, setIsEditing, hasChanges }) => {
  const [formData, setFormData] = useState({
    email: data?.email || '',
    phone: data?.phone || '',
    address: data?.address || { street: '', city: '', state: '', zipCode: '', country: '' }
  });

  const [originalData, setOriginalData] = useState(formData);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
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
        <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
          <input
            type="text"
            value={formData.address.street}
            onChange={(e) => handleInputChange('address.street', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input
            type="text"
            value={formData.address.city}
            onChange={(e) => handleInputChange('address.city', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
          <input
            type="text"
            value={formData.address.state}
            onChange={(e) => handleInputChange('address.state', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
          <input
            type="text"
            value={formData.address.zipCode}
            onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;