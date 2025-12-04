// frontend/src/pages/Travel/TravelDetailView.jsx
import React, { useState } from 'react';
import { MapPinIcon, CalendarIcon, DollarSignIcon, FileTextIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';

const TravelDetailView = ({ travel, onClose, onApprove, onSubmitExpenses }) => {
  const [approvalStatus, setApprovalStatus] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [showApprovalForm, setShowApprovalForm] = useState(false);

  if (!travel) return null;

  const handleApprove = () => {
    if (approvalStatus && approvalNote) {
      onApprove(travel._id, approvalStatus, approvalNote);
      setShowApprovalForm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Travel Request #{travel.travelId}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{travel.purpose}</p>
          </div>
          <StatusBadge status={travel.status} />
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 flex items-center mb-2">
              <MapPinIcon className="h-4 w-4 mr-2" />
              Destination
            </h4>
            <p className="text-sm text-gray-900">{travel.destination.city}, {travel.destination.country}</p>
            <p className="text-xs text-gray-500">{travel.destination.address}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 flex items-center mb-2">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Travel Dates
            </h4>
            <p className="text-sm text-gray-900">
              {new Date(travel.startDate).toLocaleDateString()} - {new Date(travel.endDate).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-500">
              {Math.ceil((new Date(travel.endDate) - new Date(travel.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 flex items-center mb-2">
              <DollarSignIcon className="h-4 w-4 mr-2" />
              Financial Summary
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transportation:</span>
                <span className="text-gray-900">${travel.transportation?.cost?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Accommodation:</span>
                <span className="text-gray-900">${travel.accommodation?.cost?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Daily Allowance:</span>
                <span className="text-gray-900">${(travel.dailyAllowance?.amount * travel.dailyAllowance?.days)?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t pt-2">
                <span className="text-gray-900">Total Estimated:</span>
                <span className="text-gray-900">${travel.totalEstimatedCost?.toLocaleString() || '0'}</span>
              </div>
              {travel.advanceAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Advance Requested:</span>
                  <span className="text-gray-900">${travel.advanceAmount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 flex items-center mb-2">
              <UserIcon className="h-4 w-4 mr-2" />
              Employee Information
            </h4>
            <p className="text-sm text-gray-900">{travel.employee.personalInfo.firstName} {travel.employee.personalInfo.lastName}</p>
            <p className="text-xs text-gray-500">{travel.employee.employmentInfo.department} - {travel.employee.employmentInfo.position}</p>
          </div>
        </div>
      </div>

      {/* Transportation & Accommodation Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Transportation</h4>
          <div className="space-y-2">
            <p className="text-sm"><span className="text-gray-600">Type:</span> <span className="text-gray-900 capitalize">{travel.transportation?.type}</span></p>
            <p className="text-sm"><span className="text-gray-600">Details:</span> <span className="text-gray-900">{travel.transportation?.details}</span></p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Accommodation</h4>
          <div className="space-y-2">
            <p className="text-sm"><span className="text-gray-600">Type:</span> <span className="text-gray-900 capitalize">{travel.accommodation?.type}</span></p>
            <p className="text-sm"><span className="text-gray-600">Details:</span> <span className="text-gray-900">{travel.accommodation?.details}</span></p>
          </div>
        </div>
      </div>

      {/* Itinerary */}
      {travel.itinerary && travel.itinerary.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 flex items-center mb-3">
            <FileTextIcon className="h-4 w-4 mr-2" />
            Itinerary
          </h4>
          <div className="space-y-2">
            {travel.itinerary.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.activity}</p>
                  <p className="text-xs text-gray-500">{item.location}</p>
                  <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                </div>
                <span className="text-sm text-gray-900">${item.cost.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Section */}
      {travel.status === 'pending' && ['manager', 'hr', 'admin'].includes(travel.userRole) && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Approval Action</h4>
          
          {!showApprovalForm ? (
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setApprovalStatus('approved');
                  setShowApprovalForm(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  setApprovalStatus('rejected');
                  setShowApprovalForm(true);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder={`Please provide a reason for ${approvalStatus}ing this request...`}
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Confirm {approvalStatus === 'approved' ? 'Approval' : 'Rejection'}
                </button>
                <button
                  onClick={() => setShowApprovalForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default TravelDetailView;