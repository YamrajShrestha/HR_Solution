import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import { 
  CameraIcon, 
  MapPinIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon
} from 'lucide-react'
import { toast } from 'react-toastify'

const MobileApp = () => {
  const { user } = useAuthStore()
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState(null)
  const [location, setLocation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)

  useEffect(() => {
    // Request camera permission
    requestCameraPermission()
    // Check today's attendance status
    checkTodayStatus()
    
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      })
      setCameraStream(stream)
    } catch (error) {
      console.error('Camera permission denied:', error)
      toast.warning('Camera access denied. Some features may be limited.')
    }
  }

  const checkTodayStatus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await api.get(`/attendance?startDate=${today}&endDate=${today}`)
      const todayRecord = response.data.data[0]
      
      if (todayRecord) {
        setIsCheckedIn(true)
        setCheckInTime(todayRecord.checkIn.time)
        if (todayRecord.checkOut.time) {
          setIsCheckedIn(false) // Already checked out
        }
      }
    } catch (error) {
      console.error('Error checking status:', error)
    }
  }

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }

  const handleCheckIn = async () => {
    setIsLoading(true)
    try {
      const location = await getCurrentLocation()
      const address = await reverseGeocode(location.latitude, location.longitude)
      
      const response = await api.post('/attendance/checkin', {
        latitude: location.latitude,
        longitude: location.longitude,
        address: address,
        type: 'mobile',
        note: 'Checked in via mobile app'
      })

      setIsCheckedIn(true)
      setCheckInTime(new Date())
      setLocation(location)
      toast.success('Check-in successful!')
      
    } catch (error) {
      console.error('Check-in error:', error)
      toast.error(error.response?.data?.message || 'Check-in failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setIsLoading(true)
    try {
      const location = await getCurrentLocation()
      const address = await reverseGeocode(location.latitude, location.longitude)
      
      await api.post('/attendance/checkout', {
        latitude: location.latitude,
        longitude: location.longitude,
        address: address,
        type: 'mobile',
        note: 'Checked out via mobile app'
      })

      setIsCheckedIn(false)
      toast.success('Check-out successful!')
      
    } catch (error) {
      console.error('Check-out error:', error)
      toast.error(error.response?.data?.message || 'Check-out failed')
    } finally {
      setIsLoading(false)
    }
  }

  const reverseGeocode = async (latitude, longitude) => {
    try {
      // Using OpenStreetMap Nominatim API (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      )
      const data = await response.json()
      return data.display_name || 'Location not found'
    } catch (error) {
      console.error('Geocoding error:', error)
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
    }
  }

  const capturePhoto = () => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    
    if (cameraStream) {
      video.srcObject = cameraStream
      video.play()
      
      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          canvas.getContext('2d').drawImage(video, 0, 0)
          const dataURL = canvas.toDataURL('image/jpeg')
          resolve(dataURL)
        }
      })
    }
    return null
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">HR Mobile</h1>
        <p className="text-sm opacity-90">Check-in/out with location</p>
      </div>

      {/* Status Card */}
      <div className="p-4">
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Status</p>
              <p className={`text-lg font-semibold ${isCheckedIn ? 'text-green-600' : 'text-gray-600'}`}>
                {isCheckedIn ? 'Checked In' : 'Checked Out'}
              </p>
              {checkInTime && (
                <p className="text-xs text-gray-500">
                  Since {new Date(checkInTime).toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isCheckedIn ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {isCheckedIn ? (
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {/* Location Info */}
        {location && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <MapPinIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-900">Current Location</p>
                <p className="text-xs text-blue-700">
                  Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                </p>
                <p className="text-xs text-blue-600">
                  Accuracy: ±{location.accuracy}m
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isCheckedIn ? (
            <button
              onClick={handleCheckIn}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Checking In...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  Check In
                </div>
              )}
            </button>
          ) : (
            <button
              onClick={handleCheckOut}
              disabled={isLoading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Checking Out...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  Check Out
                </div>
              )}
            </button>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              Apply Leave
            </button>
            <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              Travel Request
            </button>
          </div>
        </div>

        {/* Geo-fencing Info */}
        <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> Location tracking is required for attendance verification. 
            Please ensure you're within the designated office area when checking in/out.
          </p>
        </div>
      </div>
    </div>
  )
}

export default MobileApp