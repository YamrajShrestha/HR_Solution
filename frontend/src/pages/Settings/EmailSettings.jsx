import React, { useState } from 'react';
import { MailIcon, ServerIcon, TestTubeIcon, SaveIcon, XIcon } from 'lucide-react';
import { toast } from 'react-toastify';

const EmailSettings = ({ settings, onSave, onChange, loading, hasChanges }) => {
  const [formData, setFormData] = useState(settings || {
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    fromEmail: '',
    fromName: '',
    encryption: 'tls',
    testEmail: ''
  });

  const [isTesting, setIsTesting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    onChange(field, value);
  };

  const handleTestEmail = async () => {
    if (!formData.testEmail) {
      toast.warning('Please enter a test email address');
      return;
    }

    setIsTesting(true);
    try {
      await fetch('/api/settings/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.testEmail, config: formData })
      });
      toast.success('Test email sent successfully');
    } catch (error) {
      toast.error('Failed to send test email');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    await onSave(formData);
    toast.success('Email settings saved');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <MailIcon className="w-5 h-5 mr-2" />
            Email Configuration
          </h2>
          <p className="text-sm text-gray-600">Configure SMTP settings for sending emails</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host *</label>
              <input
                type="text"
                value={formData.smtpHost}
                onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                placeholder="smtp.gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port *</label>
              <input
                type="number"
                value={formData.smtpPort}
                onChange={(e) => handleInputChange('smtpPort', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                placeholder="587"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
              <input
                type="text"
                value={formData.smtpUser}
                onChange={(e) => handleInputChange('smtpUser', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                placeholder="your-email@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
              <input
                type="password"
                value={formData.smtpPass}
                onChange={(e) => handleInputChange('smtpPass', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                placeholder="Your SMTP password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Email *</label>
              <input
                type="email"
                value={formData.fromEmail}
                onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                placeholder="noreply@yourcompany.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Name *</label>
              <input
                type="text"
                value={formData.fromName}
                onChange={(e) => handleInputChange('fromName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                placeholder="Your Company Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Encryption</label>
              <select
                value={formData.encryption}
                onChange={(e) => handleInputChange('encryption', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
              >
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
                <option value="none">None</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Email</label>
              <div className="flex space-x-2">
                <input
                  type="email"
                  value={formData.testEmail}
                  onChange={(e) => handleInputChange('testEmail', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                  placeholder="test@example.com"
                />
                <button
                  onClick={handleTestEmail}
                  disabled={isTesting}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {isTesting ? 'Testing...' : <TestTubeIcon className="w-4 h-4" />}
                </button>
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

export default EmailSettings;