// src/pages/Employees/EmployeeForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SaveIcon, XIcon, UploadIcon } from 'lucide-react';
import { toast } from 'react-toastify';

const schema = yup.object().shape({
  employeeId: yup.string().required('Employee ID is required'),
  personalInfo: yup.object().shape({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    phone: yup.string().optional(),
    dateOfBirth: yup.date().optional(),
    gender: yup.string().oneOf(['male', 'female', 'other']).optional(),
    address: yup.object().shape({
      street: yup.string().optional(),
      city: yup.string().optional(),
      state: yup.string().optional(),
      zipCode: yup.string().optional(),
      country: yup.string().optional()
    }).optional()
  }),
  employmentInfo: yup.object().shape({
    department: yup.string().required('Department is required'),
    position: yup.string().required('Position is required'),
    employmentType: yup.string().oneOf(['full-time', 'part-time', 'contract', 'intern']).required('Employment type is required'),
    joinDate: yup.date().required('Join date is required'),
    status: yup.string().oneOf(['active', 'inactive', 'terminated', 'on-leave']).required('Status is required')
  }),
  compensation: yup.object().shape({
    basicSalary: yup.number().positive().required('Basic salary is required')
  }).optional()
});

const EmployeeForm = ({ employee, onSave, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: employee || {}
  });

  useEffect(() => {
    if (employee) {
      reset(employee);
      setAvatarPreview(employee.personalInfo?.avatar);
    }
  }, [employee, reset]);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setValue('personalInfo.avatar', file);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await onSave(data);
      toast.success(employee ? 'Employee updated successfully' : 'Employee created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving employee');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Avatar Upload */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-500 text-sm">No Photo</span>
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
            <UploadIcon className="w-4 h-4" />
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </label>
        </div>
        <div>
          <p className="text-sm text-gray-600">Profile Photo</p>
          <p className="text-xs text-gray-500">Click to upload a new photo</p>
        </div>
      </div>

      {/* Personal Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
          <input
            type="text"
            {...register('personalInfo.firstName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
            placeholder="John"
          />
          {errors.personalInfo?.firstName && <p className="text-sm text-red-600">{errors.personalInfo.firstName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
          <input
            type="text"
            {...register('personalInfo.lastName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
            placeholder="Doe"
          />
          {errors.personalInfo?.lastName && <p className="text-sm text-red-600">{errors.personalInfo.lastName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input
            type="email"
            {...register('personalInfo.email')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
            placeholder="john.doe@example.com"
          />
          {errors.personalInfo?.email && <p className="text-sm text-red-600">{errors.personalInfo.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            {...register('personalInfo.phone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <input
            type="date"
            {...register('personalInfo.dateOfBirth')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <select {...register('personalInfo.gender')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500">
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-md font-semibold text-gray-900 mb-3">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            {...register('personalInfo.address.street')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
            placeholder="Street"
          />
          <input
            type="text"
            {...register('personalInfo.address.city')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
            placeholder="City"
          />
          <input
            type="text"
            {...register('personalInfo.address.state')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
            placeholder="State"
          />
          <input
            type="text"
            {...register('personalInfo.address.zipCode')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
            placeholder="ZIP Code"
          />
        </div>
      </div>

      {/* Employment Info */}
      <div>
        <h3 className="text-md font-semibold text-gray-900 mb-3">Employment Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID *</label>
            <input
              type="text"
              {...register('employeeId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
              placeholder="EMP001"
            />
            {errors.employeeId && <p className="text-sm text-red-600">{errors.employeeId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
            <input
              type="text"
              {...register('employmentInfo.department')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
              placeholder="Engineering"
            />
            {errors.employmentInfo?.department && <p className="text-sm text-red-600">{errors.employmentInfo.department.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
            <input
              type="text"
              {...register('employmentInfo.position')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
              placeholder="Software Engineer"
            />
            {errors.employmentInfo?.position && <p className="text-sm text-red-600">{errors.employmentInfo.position.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type *</label>
            <select {...register('employmentInfo.employmentType')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500">
              <option value="">Select Type</option>
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="contract">Contract</option>
              <option value="intern">Intern</option>
            </select>
            {errors.employmentInfo?.employmentType && <p className="text-sm text-red-600">{errors.employmentInfo.employmentType.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Join Date *</label>
            <input
              type="date"
              {...register('employmentInfo.joinDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
            />
            {errors.employmentInfo?.joinDate && <p className="text-sm text-red-600">{errors.employmentInfo.joinDate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
            <select {...register('employmentInfo.status')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500">
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="terminated">Terminated</option>
              <option value="on-leave">On Leave</option>
            </select>
            {errors.employmentInfo?.status && <p className="text-sm text-red-600">{errors.employmentInfo.status.message}</p>}
          </div>
        </div>
      </div>

      {/* Compensation */}
      <div>
        <h3 className="text-md font-semibold text-gray-900 mb-3">Compensation</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Basic Salary *</label>
          <input
            type="number"
            {...register('compensation.basicSalary')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
            placeholder="50000"
          />
          {errors.compensation?.basicSalary && <p className="text-sm text-red-600">{errors.compensation.basicSalary.message}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <XIcon className="w-4 h-4 mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <SaveIcon className="w-4 h-4 mr-2" />
              {employee ? 'Update Employee' : 'Create Employee'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;