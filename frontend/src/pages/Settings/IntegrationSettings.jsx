import React, { useState } from 'react';
import { GlobeIcon, SaveIcon, KeyIcon, PlugIcon } from 'lucide-react';
import { toast } from 'react-toastify';

const IntegrationSettings = ({ settings, onSave, onChange, loading, hasChanges }) => {
  const [formData, setFormData] = useState(settings || {
    slack: { enabled: false, webhookUrl: '', channel: '' },
    googleWorkspace: { enabled: false, clientId: '', clientSecret: '' },
    microsoft: { enabled: false, tenantId: '', clientId: '', clientSecret: '' },
    webhooks: []
  });

  const [newWebhook, setNewWebhook] = useState({ url: '', events: [], secret: '' });

  const handleToggle = (service, enabled) => {
    const updated = { ...formData, [service]: { ...formData[service], enabled } };
    setFormData(updated);
    onChange(service, updated[service]);
  };

  const handleInputChange = (service, field, value) => {
    const updated = { ...formData, [service]: { ...formData[service], [field]: value } };
    setFormData(updated);
    onChange(service, updated[service]);
  };

  const handleAddWebhook = () => {
    if (!newWebhook.url) {
      toast.warning('Webhook URL is required');
      return;
    }
    const updated = { ...formData, webhooks: [...formData.webhooks, newWebhook] };
    setFormData(updated);
    setNewWebhook({ url: '', events: [], secret: '' });
  };

  const handleRemoveWebhook = (index) => {
    const updated = { ...formData, webhooks: formData.webhooks.filter((_, i) => i !== index) };
    setFormData(updated);
  };

  const handleSave = async () => {
    await onSave(formData);
    toast.success('Integration settings saved');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <PlugIcon className="w-5 h-5 mr-2" />
            Integration Settings
          </h2>
          <p className="text-sm text-gray-600">Connect with third-party services</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Slack Integration */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">Slack</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Slack</h3>
                  <p className="text-sm text-gray-600">Send notifications to Slack channels</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.slack.enabled}
                  onChange={(e) => handleToggle('slack', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {formData.slack.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                  <input
                    type="url"
                    value={formData.slack.webhookUrl}
                    onChange={(e) => handleInputChange('slack', 'webhookUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                    placeholder="https://hooks.slack.com/services/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
                  <input
                    type="text"
                    value={formData.slack.channel}
                    onChange={(e) => handleInputChange('slack', 'channel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                    placeholder="#hr-notifications"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Google Workspace */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Google Workspace</h3>
                  <p className="text-sm text-gray-600">Sync with Google Calendar and Drive</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.googleWorkspace.enabled}
                  onChange={(e) => handleToggle('googleWorkspace', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {formData.googleWorkspace.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
                  <input
                    type="text"
                    value={formData.googleWorkspace.clientId}
                    onChange={(e) => handleInputChange('googleWorkspace', 'clientId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Secret</label>
                  <input
                    type="password"
                    value={formData.googleWorkspace.clientSecret}
                    onChange={(e) => handleInputChange('googleWorkspace', 'clientSecret', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Microsoft 365 */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Microsoft 365</h3>
                  <p className="text-sm text-gray-600">Integrate with Teams and Outlook</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.microsoft.enabled}
                  onChange={(e) => handleToggle('microsoft', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {formData.microsoft.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tenant ID</label>
                  <input
                    type="text"
                    value={formData.microsoft.tenantId}
                    onChange={(e) => handleInputChange('microsoft', 'tenantId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
                  <input
                    type="text"
                    value={formData.microsoft.clientId}
                    onChange={(e) => handleInputChange('microsoft', 'clientId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Secret</label>
                  <input
                    type="password"
                    value={formData.microsoft.clientSecret}
                    onChange={(e) => handleInputChange('microsoft', 'clientSecret', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Custom Webhooks */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <GlobeIcon className="w-5 h-5 mr-2" />
              Custom Webhooks
            </h3>
            <div className="space-y-4">
              {formData.webhooks.map((hook, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{hook.url}</span>
                    <button
                      onClick={() => handleRemoveWebhook(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    Events: {hook.events.join(', ')}
                  </div>
                </div>
              ))}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Add Webhook</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="url"
                    placeholder="Webhook URL"
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Events (comma-separated)"
                    value={newWebhook.events.join(',')}
                    onChange={(e) => setNewWebhook({ ...newWebhook, events: e.target.value.split(',').map(s => s.trim()) })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Secret (optional)"
                    value={newWebhook.secret}
                    onChange={(e) => setNewWebhook({ ...newWebhook, secret: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleAddWebhook}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Add Webhook
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

export default IntegrationSettings;