import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import { PlusIcon, SearchIcon, EyeIcon, EditIcon, TrashIcon } from 'lucide-react'
import { toast } from 'react-toastify'
import DataTable from '../../components/Common/DataTable'
import Modal from '../../components/Common/Modal'
import EmployeeForm from './EmployeeForm'

const Employees = () => {
  const { user } = useAuthStore()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchEmployees()
  }, [currentPage, searchTerm])

  const fetchEmployees = async () => {
    try {
      const response = await api.get(`/employees?page=${currentPage}&search=${searchTerm}`)
      setEmployees(response.data.data)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      toast.error('Error fetching employees')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEmployee = () => {
    setSelectedEmployee(null)
    setIsModalOpen(true)
  }

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee)
    setIsModalOpen(true)
  }

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${employeeId}`)
        toast.success('Employee deleted successfully')
        fetchEmployees()
      } catch (error) {
        toast.error('Error deleting employee')
      }
    }
  }

  const handleSaveEmployee = async (employeeData) => {
    try {
      if (selectedEmployee) {
        await api.put(`/employees/${selectedEmployee._id}`, employeeData)
        toast.success('Employee updated successfully')
      } else {
        await api.post('/employees', employeeData)
        toast.success('Employee created successfully')
      }
      setIsModalOpen(false)
      fetchEmployees()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving employee')
    }
  }

  const columns = [
    { key: 'employeeId', label: 'Employee ID' },
    { key: 'fullName', label: 'Name' },
    { key: 'department', label: 'Department' },
    { key: 'position', label: 'Position' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ]

  const formatEmployeeData = (employee) => ({
    ...employee,
    fullName: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
    department: employee.employmentInfo.department,
    position: employee.employmentInfo.position,
    status: employee.employmentInfo.status
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <button
          onClick={handleAddEmployee}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Employee
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Employees Table */}
      <DataTable
        columns={columns}
        data={employees.map(formatEmployeeData)}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        actions={(employee) => (
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditEmployee(employee)}
              className="text-blue-600 hover:text-blue-900"
            >
              <EditIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteEmployee(employee._id)}
              className="text-red-600 hover:text-red-900"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      />

      {/* Employee Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEmployee ? 'Edit Employee' : 'Add Employee'}
      >
        <EmployeeForm
          employee={selectedEmployee}
          onSave={handleSaveEmployee}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

export default Employees