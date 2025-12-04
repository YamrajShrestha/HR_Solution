import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  HomeIcon, 
  UsersIcon, 
  CalendarIcon, 
  ClockIcon, 
  PlaneIcon, 
  FileTextIcon,
  SettingsIcon,
  SmartphoneIcon
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Employees', href: '/employees', icon: UsersIcon },
  { name: 'Leave', href: '/leave', icon: CalendarIcon },
  { name: 'Attendance', href: '/attendance', icon: ClockIcon },
  { name: 'Travel', href: '/travel', icon: PlaneIcon },
  { name: 'Reports', href: '/reports', icon: FileTextIcon },
  { name: 'Mobile App', href: '/mobile', icon: SmartphoneIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
]

const Sidebar = ({ onClose }) => {
  return (
    <div className="flex flex-col h-full bg-white shadow-lg">
      <div className="flex items-center justify-between h-16 px-4 border-b">
        <h1 className="text-xl font-bold text-gray-900">HR Solution</h1>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Close sidebar</span>
          ×
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
            onClick={onClose}
          >
            <item.icon
              className="mr-3 h-5 w-5"
              aria-hidden="true"
            />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar