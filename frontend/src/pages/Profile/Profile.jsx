import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { 
  UserIcon, 
  MailIcon, 
  PhoneIcon, 
  MapPinIcon, 
  CalendarIcon,
  KeyIcon,
  CameraIcon,
  EditIcon,
  SaveIcon,
  XIcon,
  ShieldIcon,
  BellIcon,
  ActivityIcon,
  UploadIcon,
  EyeIcon,
  EyeOffIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import PersonalInfo from './PersonalInfo';
import ContactInfo from './ContactInfo';
import EmergencyContact from './EmergencyContact';
import Documents from './Documents';
import AccountSecurity from './AccountSecurity';
import NotificationPreferences from './NotificationPreferences';
import ActivityLog from './ActivityLog';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: UserIcon },
    { id: 'contact', label: 'Contact Details', icon: MailIcon },
    { id: 'emergency', label: 'Emergency Contact', icon: PhoneIcon },
    { id: 'documents', label: 'Documents', icon: UploadIcon },
    { id: 'security', label: 'Security', icon: ShieldIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'activity', label: 'Activity Log', icon: ActivityIcon }
  ];

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/employees/${user.id}`);
      setProfileData(response.data.data);
      setAvatarPreview(response.data.data.personalInfo?.avatar);
    } catch (error) {
      toast.error('Error fetching profile data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (section, data) => {
    try {
      setLoading(true);
      const response = await api.put(`/employees/${user.id}`, { [section]: data });
      setProfileData(response.data.data);
      updateUser(response.data.data);
      setHasChanges(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Error updating profile');
      console.error(error);
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and GIF files are allowed');
      return;
    }

    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);

    // Create FormData and upload
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.post(`/employees/${user.id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProfileData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          avatar: response.data.avatar
        }
      }));
      
      updateUser({
        ...user,
        personalInfo: {
          ...user.personalInfo,
          avatar: response.data.avatar
        }
      });
      
      toast.success('Avatar updated successfully');
    } catch (error) {
      toast.error('Error uploading avatar');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordChange = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error changing password');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const handleTwoFactorToggle = async (enabled) => {
    try {
      await api.put(`/employees/${user.id}`, {
        security: {
          twoFactorEnabled: enabled
        }
      });
      
      setProfileData(prev => ({
        ...prev,
        security: {
          ...prev.security,
          twoFactorEnabled: enabled
        }
      }));
      
      toast.success(`Two-factor authentication ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Error updating two-factor authentication');
      console.error(error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <PersonalInfo
            data={profileData?.personalInfo}
            onSave={(data) => handleUpdateProfile('personalInfo', data)}
            onAvatarUpload={handleAvatarUpload}
            avatarPreview={avatarPreview}
            isUploading={isUploading}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            hasChanges={hasChanges}
          />
        );
      case 'contact':
        return (
          <ContactInfo
            data={profileData?.personalInfo}
            onSave={(data) => handleUpdateProfile('personalInfo', data)}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            hasChanges={hasChanges}
          />
        );
      case 'emergency':
        return (
          <EmergencyContact
            data={profileData?.personalInfo?.emergencyContact}
            onSave={(data) => handleUpdateProfile('personalInfo', { 
              ...profileData.personalInfo, 
              emergencyContact: data 
            })}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            hasChanges={hasChanges}
          />
        );
      case 'documents':
        return (
          <Documents
            documents={profileData?.documents}
            employeeId={user.id}
            onUploadComplete={() => fetchProfileData()}
          />
        );
      case 'security':
        return (
          <AccountSecurity
            data={profileData?.security}
            onPasswordChange={handlePasswordChange}
            onTwoFactorToggle={handleTwoFactorToggle}
            user={user}
          />
        );
      case 'notifications':
        return (
          <NotificationPreferences
            preferences={profileData?.notificationPreferences}
            onSave={(data) => handleUpdateProfile('notificationPreferences', data)}
          />
        );
      case 'activity':
        return (
          <ActivityLog
            activities={profileData?.activityLog}
            employeeId={user.id}
          />
        );
      default:
        return null;
    }
  };

  if (loading && !profileData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-12 w-12 text-gray-400" />
                )}
              </div>
              {activeTab === 'personal' && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                  <CameraIcon className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {profileData?.personalInfo?.firstName} {profileData?.personalInfo?.lastName}
              </h1>
              <p className="text-gray-600">{profileData?.employmentInfo?.position}</p>
              <p className="text-sm text-gray-500">{profileData?.employmentInfo?.department}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
                <span className="text-sm text-gray-500">
                  Employee ID: {profileData?.employeeId}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setActiveTab('security')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <KeyIcon className="h-4 w-4 mr-2" />
                Change Password
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <BellIcon className="h-4 w-4 mr-2" />
                Notifications
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Profile;