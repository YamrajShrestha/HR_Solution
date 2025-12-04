// frontend/src/pages/Settings/SecuritySettings.jsx
import React, { useState } from 'react';
import { ShieldIcon, KeyIcon, ClockIcon, MailIcon, SmartphoneIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { toast } from 'react-toastify';

const SecuritySettings = ({ settings, onSave, onChange, loading, hasChanges }) => {
  const [formData, setFormData] = useState(settings || {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expiryDays: 90
    },
    twoFactorAuth: {
      enabled: false,
      method: 'email', // 'email' or 'sms'
      requiredFor: ['admin', 'hr'] // roles that require 2FA
    },
    sessionSettings: {
      timeout: 30, // minutes
      concurrentSessions: 1,
      ipBinding: false
    },
    loginAttempts: {
      maxAttempts: 5,
      lockoutDuration: 30, // minutes
      notifyOnLockout: true
    },
    apiSecurity: {
      rateLimit: 100, // requests per minute
      corsOrigins: ['http://localhost:3000'],
      apiKeyRequired: false
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    onChange(section, field, value);
  };

  const handleSave = async () => {
    try {
      await onSave(formData);
      toast.success('Security settings saved successfully');
    } catch (error) {
      toast.error('Error saving security settings');
    }
  };

  const handleTest2FA = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email');
      return;
    }

    setIsTesting(true);
    try {
      // Simulate 2FA test
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('2FA test code sent successfully');
    } catch (error) {
      toast.error('Error testing 2FA');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <ShieldIcon className="h-5 w-5 mr-2" />
            Security Settings
          </h2>
          <p className="text-sm text-gray-600 mt-1">Configure security policies and authentication</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Password Policy */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <KeyIcon className="h-5 w-5 mr-2" />
              Password Policy
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Length
                </label>
                <input
                  type="number"
                  min="6"
                  max="32"
                  value={formData.passwordPolicy.minLength}
                  onChange={(e) => handleInputChange('passwordPolicy', 'minLength', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Expiry (days)
                </label>
                <input
                  type="number"
                  min="30"
                  max="365"
                  value={formData.passwordPolicy.expiryDays}
                  onChange={(e) => handleInputChange('passwordPolicy', 'expiryDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.passwordPolicy.requireUppercase}
                  onChange={(e) => handleInputChange('passwordPolicy', 'requireUppercase', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Require uppercase letters</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.passwordPolicy.requireLowercase}
                  onChange={(e) => handleInputChange('passwordPolicy', 'requireLowercase', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Require lowercase letters</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.passwordPolicy.requireNumbers}
                  onChange={(e) => handleInputChange('passwordPolicy', 'requireNumbers', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Require numbers</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.passwordPolicy.requireSpecialChars}
                  onChange={(e) => handleInputChange('passwordPolicy', 'requireSpecialChars', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Require special characters</span>
              </label>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="border-t pt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <SmartphoneIcon className="h-5 w-5 mr-2" />
              Two-Factor Authentication
            </h3>

            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.twoFactorAuth.enabled}
                  onChange={(e) => handleInputChange('twoFactorAuth', 'enabled', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable two-factor authentication</span>
              </label>

              {formData.twoFactorAuth.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      2FA Method
                    </label>
                    <select
                      value={formData.twoFactorAuth.method}
                      onChange={(e) => handleInputChange('twoFactorAuth', 'method', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="app">Authenticator App</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required for Roles
                    </label>
                    <div className="space-y-2">
                      {['admin', 'hr', 'manager', 'employee'].map(role => (
                        <label key={role} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.twoFactorAuth.requiredFor.includes(role)}
                            onChange={(e) => {
                              const requiredRoles = e.target.checked
                                ? [...formData.twoFactorAuth.requiredFor, role]
                                : formData.twoFactorAuth.requiredFor.filter(r => r !== role);
                              handleInputChange('twoFactorAuth', 'requiredFor', requiredRoles);
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 capitalize">{role}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Test 2FA */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="Enter test email"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleTest2FA}
                      disabled={isTesting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isTesting ? 'Testing...' : 'Test 2FA'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Session Settings */}
          <div className="border-t pt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              Session Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={formData.sessionSettings.timeout}
                  onChange={(e) => handleInputChange('sessionSettings', 'timeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Concurrent Sessions
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.sessionSettings.concurrentSessions}
                  onChange={(e) => handleInputChange('sessionSettings', 'concurrentSessions', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.sessionSettings.ipBinding}
                  onChange={(e) => handleInputChange('sessionSettings', 'ipBinding', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable IP binding for sessions</span>
              </label>
            </div>
          </div>

          {/* Login Attempts */}
          <div className="border-t pt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Login Attempts</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Failed Attempts
                </label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={formData.loginAttempts.maxAttempts}
                  onChange={(e) => handleInputChange('loginAttempts', 'maxAttempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lockout Duration (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={formData.loginAttempts.lockoutDuration}
                  onChange={(e) => handleInputChange('loginAttempts', 'lockoutDuration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.loginAttempts.notifyOnLockout}
                  onChange={(e) => handleInputChange('loginAttempts', 'notifyOnLockout', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Notify admin on account lockout</span>
              </label>
            </div>
          </div>

          {/* API Security */}
          <div className="border-t pt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">API Security</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate Limit (requests/minute)
                </label>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={formData.apiSecurity.rateLimit}
                  onChange={(e) => handleInputChange('apiSecurity', 'rateLimit', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CORS Origins
                </label>
                <input
                  type="text"
                  value={formData.apiSecurity.corsOrigins.join(', ')}
                  onChange={(e) => handleInputChange('apiSecurity', 'corsOrigins', e.target.value.split(',').map(s => s.trim()))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="http://localhost:3000, https://example.com"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.apiSecurity.apiKeyRequired}
                  onChange={(e) => handleInputChange('apiSecurity', 'apiKeyRequired', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Require API key for all requests</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading || !hasChanges}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <KeyIcon className="h-4 w-4 mr-2" />
                Save Security Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;