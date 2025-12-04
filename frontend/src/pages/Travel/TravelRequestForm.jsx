// frontend/src/pages/Travel/TravelRequestForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MapPinIcon, CalendarIcon, DollarSignIcon, PlaneIcon, FileTextIcon } from 'lucide-react';

const schema = yup.object({
  purpose: yup.string().required('Purpose is required').min(10, 'Purpose must be at least 10 characters'),
  destination: yup.object({
    country: yup.string().required('Country is required'),
    city: yup.string().required('City is required'),
    address: yup.string().required('Address is required')
  }),
  startDate: yup.date().required('Start date is required').min(new Date(), 'Cannot select past date'),
  endDate: yup.date().required('End date is required')
    .min(yup.ref('startDate'), 'End date must be after start date'),
  transportation: yup.object({
    type: yup.string().required('Transportation type is required'),
    details: yup.string().required('Details are required'),
    cost: yup.number().required('Cost is required').min(0, 'Cost cannot be negative')
  }),
  accommodation: yup.object({
    type: yup.string().required('Accommodation type is required'),
    details: yup.string().required('Details are required'),
    cost: yup.number().required('Cost is required').min(0, 'Cost cannot be negative')
  }),
  dailyAllowance: yup.object({
    amount: yup.number().required('Daily allowance is required').min(0, 'Amount cannot be negative'),
    days: yup.number().required('Number of days is required').min(1, 'Must be at least 1 day'),
    currency: yup.string().default('USD')
  }),
  advanceAmount: yup.number().min(0, 'Advance amount cannot be negative').default(0),
  itinerary: yup.array().of(
    yup.object({
      date: yup.date().required(),
      activity: yup.string().required('Activity is required'),
      location: yup.string().required('Location is required'),
      cost: yup.number().min(0, 'Cost cannot be negative').default(0)
    })
  ),
  isInternational: yup.boolean().default(false),
  visaRequired: yup.boolean().default(false)
});

const TravelRequestForm = ({ travel, onSave, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  
  const { register, handleSubmit, formState: { errors }, watch, setValue, control } = useForm({
    resolver: yupResolver(schema),
    defaultValues: travel || {
      purpose: '',
      destination: { country: '', city: '', address: '' },
      startDate: '',
      endDate: '',
      transportation: { type: '', details: '', cost: 0 },
      accommodation: { type: '', details: '', cost: 0 },
      dailyAllowance: { amount: 0, days: 1, currency: 'USD' },
      advanceAmount: 0,
      itinerary: [],
      isInternational: false,
      visaRequired: false
    }
  });

  const formData = watch();
  const isInternational = watch('isInternational');

  // Calculate total cost
  React.useEffect(() => {
    const transportCost = Number(formData.transportation?.cost || 0);
    const accommodationCost = Number(formData.accommodation?.cost || 0);
    const allowanceCost = Number(formData.dailyAllowance?.amount || 0) * Number(formData.dailyAllowance?.days || 1);
    const itineraryCost = formData.itinerary?.reduce((sum, item) => sum + Number(item.cost || 0), 0) || 0;
    
    setTotalCost(transportCost + accommodationCost + allowanceCost + itineraryCost);
  }, [formData]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const submissionData = {
        ...data,
        totalEstimatedCost: totalCost
      };
      await onSave(submissionData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const transportationTypes = [
    { value: 'flight', label: 'Flight' },
    { value: 'train', label: 'Train' },
    { value: 'bus', label: 'Bus' },
    { value: 'car', label: 'Car Rental' },
    { value: 'taxi', label: 'Taxi' },
    { value: 'other', label: 'Other' }
  ];

  const accommodationTypes = [
    { value: 'hotel', label: 'Hotel' },
    { value: 'guesthouse', label: 'Guest House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <PlaneIcon className="h-5 w-5 mr-2" />
          Travel Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose of Travel *
            </label>
            <textarea
              {...register('purpose')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Please describe the purpose of your travel..."
            />
            {errors.purpose && (
              <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isInternational')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">International Travel</span>
              </label>

              {isInternational && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('visaRequired')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Visa Required</span>
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Advance Amount Requested
              </label>
              <input
                type="number"
                {...register('advanceAmount')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                step="0.01"
              />
              {errors.advanceAmount && (
                <p className="mt-1 text-sm text-red-600">{errors.advanceAmount.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Destination */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <MapPinIcon className="h-5 w-5 mr-2" />
          Destination
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <input
              type="text"
              {...register('destination.country')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., United States"
            />
            {errors.destination?.country && (
              <p className="mt-1 text-sm text-red-600">{errors.destination.country.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              {...register('destination.city')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., New York"
            />
            {errors.destination?.city && (
              <p className="mt-1 text-sm text-red-600">{errors.destination.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              {...register('destination.address')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 123 Business Ave"
            />
            {errors.destination?.address && (
              <p className="mt-1 text-sm text-red-600">{errors.destination.address.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Travel Dates */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Travel Dates
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              {...register('startDate')}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="date"
              {...register('endDate')}
              min={formData.startDate || new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Transportation */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Transportation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <select
              {...register('transportation.type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Type</option>
              {transportationTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.transportation?.type && (
              <p className="mt-1 text-sm text-red-600">{errors.transportation.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Details *
            </label>
            <input
              type="text"
              {...register('transportation.details')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Flight numbers, train details, etc."
            />
            {errors.transportation?.details && (
              <p className="mt-1 text-sm text-red-600">{errors.transportation.details.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cost *
            </label>
            <input
              type="number"
              {...register('transportation.cost')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              step="0.01"
            />
            {errors.transportation?.cost && (
              <p className="mt-1 text-sm text-red-600">{errors.transportation.cost.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Accommodation */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Accommodation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <select
              {...register('accommodation.type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Type</option>
              {accommodationTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.accommodation?.type && (
              <p className="mt-1 text-sm text-red-600">{errors.accommodation.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Details *
            </label>
            <input
              type="text"
              {...register('accommodation.details')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Hotel name, address, etc."
            />
            {errors.accommodation?.details && (
              <p className="mt-1 text-sm text-red-600">{errors.accommodation.details.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cost *
            </label>
            <input
              type="number"
              {...register('accommodation.cost')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              step="0.01"
            />
            {errors.accommodation?.cost && (
              <p className="mt-1 text-sm text-red-600">{errors.accommodation.cost.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Daily Allowance */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <DollarSignIcon className="h-5 w-5 mr-2" />
          Daily Allowance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <input
              type="number"
              {...register('dailyAllowance.amount')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              step="0.01"
            />
            {errors.dailyAllowance?.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.dailyAllowance.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Days *
            </label>
            <input
              type="number"
              {...register('dailyAllowance.days')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1"
              min="1"
            />
            {errors.dailyAllowance?.days && (
              <p className="mt-1 text-sm text-red-600">{errors.dailyAllowance.days.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              {...register('dailyAllowance.currency')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="NPR">NPR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Total Cost Display */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-blue-900">Total Estimated Cost:</span>
          <span className="text-2xl font-bold text-blue-900">${totalCost.toLocaleString()}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting...
            </div>
          ) : (
            'Submit Request'
          )}
        </button>
      </div>
    </form>
  );
};

export default TravelRequestForm;