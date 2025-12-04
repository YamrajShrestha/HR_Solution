import React, { useState } from 'react';
import { DatabaseIcon, SaveIcon, DownloadIcon, ClockIcon, UploadIcon } from 'lucide-react';
import { toast } from 'react-toastify';

const BackupSettings = ({ settings, onSave, onChange, loading, hasChanges }) => {
  const [formData, setFormData] = useState(settings || {
    autoBackup: {
      enabled: true,
      frequency: 'daily',
      time: '02:00',
      retention: 30
    },
    manualBackup: {
      lastBackup: null,
      size: 0
    },
    cloudStorage: {
      provider: 'aws',
      bucket: '',
      region: 'us-east-1'
    },
    encryption: {
      enabled: true,
      algorithm: 'AES-256'
    }
  });

  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleInputChange = (section, field, value) => {
    const updated = { ...formData, [section]: { ...formData[section], [field]: value } };
    setFormData(updated);
    onChange(section, updated[section]);
  };

  const handleBackupNow = async () => {
    setIsBackingUp(true);
    try {
      await fetch('/api/settings/backup/now', { method: 'POST' });
      toast.success('Backup initiated successfully');
    } catch (error) {
      toast.error('Failed to initiate backup');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const response = await fetch('/api/settings/backup/download');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
    } catch (error) {
      toast.error('Failed to download backup');
    }
  };

  const handleSave = async () => {
    await onSave(formData);
    toast.success('Backup settings saved');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <DatabaseIcon className="w-5 h-5 mr-2" />
            Backup Settings
          </h2>
          <p className="text-sm text-gray-600">Configure automatic backups and restore options</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Auto Backup */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2" />
              Automatic Backup
            </h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.autoBackup.enabled}
                  onChange={(e) => handleInputChange('autoBackup', 'enabled', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable automatic backup</span>
              </label>

              {formData.autoBackup.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                    <select
                      value={formData.autoBackup.frequency}
                      onChange={(e) => handleInputChange('autoBackup', 'frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input
                      type="time"
                      value={formData.autoBackup.time}
                      onChange={(e) => handleInputChange('autoBackup', 'time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Retention (days)</label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={formData.autoBackup.retention}
                      onChange={(e) => handleInputChange('autoBackup', 'retention', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cloud Storage */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cloud Storage</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                <select
                  value={formData.cloudStorage.provider}
                  onChange={(e) => handleInputChange('cloudStorage', 'provider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                >
                  <option value="aws">AWS S3</option>
                  <option value="gcp">Google Cloud</option>
                  <option value="azure">Azure Blob</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bucket Name</label>
                <input
                  type="text"
                  value={formData.cloudStorage.bucket}
                  onChange={(e) => handleInputChange('cloudStorage', 'bucket', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                  placeholder="my-backup-bucket"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                <input
                  type="text"
                  value={formData.cloudStorage.region}
                  onChange={(e) => handleInputChange('cloudStorage', 'region', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                  placeholder="us-east-1"
                />
              </div>
            </div>
          </div>

          {/* Encryption */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Encryption</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.encryption.enabled}
                  onChange={(e) => handleInputChange('encryption', 'enabled', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable encryption</span>
              </label>
              {formData.encryption.enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Algorithm</label>
                  <select
                    value={formData.encryption.algorithm}
                    onChange={(e) => handleInputChange('encryption', 'algorithm', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                  >
                    <option value="AES-256">AES-256</option>
                    <option value="AES-128">AES-128</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Manual Backup */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Manual Backup</h3>
            <div className="flex space-x-4">
              <button
                onClick={handleBackupNow}
                disabled={isBackingUp}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isBackingUp ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Backing Up...
                  </>
                ) : (
                  <>
                    <DatabaseIcon className="w-4 h-4 mr-2" />
                    Backup Now
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadBackup}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download Latest
              </button>
            </div>
            {formData.manualBackup.lastBackup && (
              <p className="text-sm text-gray-600 mt-2">
                Last backup: {new Date(formData.manualBackup.lastBackup).toLocaleString()}
              </p>
            )}
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

export default BackupSettings;