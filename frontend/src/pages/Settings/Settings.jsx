import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { 
  CogIcon,
  UserIcon,
  BellIcon,
  ShieldIcon,
  CreditCardIcon,
  GlobeIcon,
  MailIcon,
  DatabaseIcon,
  SaveIcon,
  KeyIcon,
  UsersIcon,
  BuildingIcon,
  CalendarIcon,
  DollarSignIcon,
  MapPinIcon,
  EyeIcon,
  EyeOffIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import CompanySettings from './CompanySettings';
import EmailSettings from './EmailSettings';
import LeaveSettings from './LeaveSettings';
import AttendanceSettings from './AttendanceSettings';
import PayrollSettings from './PayrollSettings';
import SecuritySettings from './SecuritySettings';
import NotificationSettings from './NotificationSettings';
import BackupSettings from './BackupSettings';
import IntegrationSettings from './IntegrationSettings';

const Settings = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const tabs = [
    { id: 'company', label: 'Company', icon: BuildingIcon },
    { id: 'email', label: 'Email', icon: MailIcon },
    { id: 'leave', label: 'Leave', icon: CalendarIcon },
    { id: 'attendance', label: 'Attendance', icon: MapPinIcon },
    { id: 'payroll', label: 'Payroll', icon: DollarSignIcon },
    { id: 'security', label: 'Security', icon: ShieldIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'integrations', label: 'Integrations', icon: GlobeIcon },
    { id: 'backup', label: 'Backup', icon: DatabaseIcon }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings');
      setSettings(response.data.data);
    } catch (error) {
      toast.error('Error fetching settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (section, data) => {
    try {
      setLoading(true);
      await api.put(`/settings/${section}`, data);
      setSettings(prev => ({ ...prev, [section]: data }));
      setHasChanges(false);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Error saving settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'company':
        return (
          <CompanySettings
            settings={settings?.company}
            onSave={(data) => handleSaveSettings('company', data)}
            onChange={(key, value) => handleSettingChange('company', key, value)}
            loading={loading}
            hasChanges={hasChanges}
          />
        );
      case 'email':
        return (
          <EmailSettings
            settings={settings?.email}
            onSave={(data) => handleSaveSettings('email', data)}
            onChange={(key, value) => handleSettingChange('email', key, value)}
            loading={loading}
            hasChanges={hasChanges}
          />
        );
      case 'leave':
        return (
          <LeaveSettings
            settings={settings?.leave}
            onSave={(data) => handleSaveSettings('leave', data)}
            onChange={(key, value) => handleSettingChange('leave', key, value)}
            loading={loading}
            hasChanges={hasChanges}
          />
        );
      case 'attendance':
        return (
          <AttendanceSettings
            settings={settings?.attendance}
            onSave={(data) => handleSaveSettings('attendance', data)}
            onChange={(key, value) => handleSettingChange('attendance', key, value)}
            loading={loading}
            hasChanges={hasChanges}
          />
        );
      case 'payroll':
        return (
          <PayrollSettings
            settings={settings?.payroll}
            onSave={(data) => handleSaveSettings('payroll', data)}
            onChange={(key, value) => handleSettingChange('payroll', key, value)}
            loading={loading}
            hasChanges={hasChanges}
          />
        );
      case 'security':
        return (
          <SecuritySettings
            settings={settings?.security}
            onSave={(data) => handleSaveSettings('security', data)}
            onChange={(key, value) => handleSettingChange('security', key, value)}
            loading={loading}
            hasChanges={hasChanges}
          />
        );
      case 'notifications':
        return (
          <NotificationSettings
            settings={settings?.notifications}
            onSave={(data) => handleSaveSettings('notifications', data)}
            onChange={(key, value) => handleSettingChange('notifications', key, value)}
            loading={loading}
            hasChanges={hasChanges}
          />
        );
      case 'integrations':
        return (
          <IntegrationSettings
            settings={settings?.integrations}
            onSave={(data) => handleSaveSettings('integrations', data)}
            onChange={(key, value) => handleSettingChange('integrations', key, value)}
            loading={loading}
            hasChanges={hasChanges}
          />
        );
      case 'backup':
        return (
          <BackupSettings
            settings={settings?.backup}
            onSave={(data) => handleSaveSettings('backup', data)}
            onChange={(key, value) => handleSettingChange('backup', key, value)}
            loading={loading}
            hasChanges={hasChanges}
          />
        );
      default:
        return null;
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <CogIcon className="h-5 w-5 mr-2" />
            Settings
          </h2>
          <p className="text-sm text-gray-600 mt-1">Configure your system</p>
        </div>
        
        <nav className="mt-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;