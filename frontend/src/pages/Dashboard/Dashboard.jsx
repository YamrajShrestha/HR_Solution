import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import { 
  UsersIcon, 
  CalendarIcon, 
  ClockIcon, 
  PlaneIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from 'lucide-react'
import StatCard from '../../components/Common/StatCard'
import Chart from '../../components/Common/Chart'

const Dashboard = () => {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/reports/dashboard')
      setStats(response.data.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.email}!
        </h1>
        <p className="mt-2 sm:mt-0 text-gray-600">
          Here's what's happening with your team today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={stats?.employees?.total || 0}
          icon={UsersIcon}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Today"
          value={stats?.attendance?.today?.length || 0}
          icon={ClockIcon}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Pending Leaves"
          value={stats?.leaves?.recent || 0}
          icon={CalendarIcon}
          trend={{ value: 3, isPositive: false }}
        />
        <StatCard
          title="Travel Requests"
          value={stats?.travels?.recent || 0}
          icon={PlaneIcon}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Attendance Overview
          </h3>
          <Chart
            type="line"
            data={stats?.attendance?.chartData || []}
            height={300}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Leave Statistics
          </h3>
          <Chart
            type="bar"
            data={stats?.leaves?.chartData || []}
            height={300}
          />
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Activities
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {stats?.recentActivities?.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-600">{activity}</p>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">
                No recent activities
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard