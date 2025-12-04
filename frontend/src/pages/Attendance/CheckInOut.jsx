// frontend/src/pages/Attendance/CheckInOut.jsx
import React, { useState, useEffect } from 'react';
import { MapPinIcon, ClockIcon, CameraIcon } from 'lucide-react';

const CheckInOut = ({ onSuccess, onCancel }) => {
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          setIsLocating(false);
        },
        (error) => {
          console.error('Location error:', error);
          setIsLocating(false);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const capturePhoto = () => {
    // Implement camera capture for mobile devices
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setPhoto(e.target.result);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Location Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <MapPinIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Location</span>
          </div>
          <button
            onClick={getLocation}
            disabled={isLocating}
            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50"
          >
            {isLocating ? 'Locating...' : 'Refresh'}
          </button>
        </div>
        
        {location ? (
          <div>
            <p className="text-xs text-gray-600">
              Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Accuracy: ±{location.accuracy}m
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-500">Location not available</p>
        )}
      </div>

      {/* Photo Capture */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <CameraIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Photo (Optional)</span>
          </div>
          <button
            type="button"
            onClick={capturePhoto}
            className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Capture
          </button>
        </div>
        
        {photo && (
          <div className="mt-3">
            <img src={photo} alt="Captured" className="w-32 h-24 object-cover rounded border" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default CheckInOut;