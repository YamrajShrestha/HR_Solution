// frontend/src/pages/Attendance/AttendanceCalendar.jsx
import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const AttendanceCalendar = ({ attendance, onDateClick }) => {
  const events = attendance.map(record => ({
    id: record._id,
    title: `${record.employee.personalInfo.firstName} - ${record.status}`,
    start: new Date(record.date),
    end: new Date(record.date),
    resource: record
  }));

  const eventStyleGetter = (event) => {
    const statusColors = {
      present: '#10b981',
      absent: '#ef4444',
      late: '#f59e0b',
      'half-day': '#f97316',
      'on-leave': '#8b5cf6'
    };

    return {
      style: {
        backgroundColor: statusColors[event.resource.status] || '#6b7280',
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className="bg-white rounded-lg shadow p-4" style={{ height: '600px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={(event) => onDateClick(event.resource)}
        views={['month', 'week', 'day']}
        defaultView="month"
      />
    </div>
  );
};

export default AttendanceCalendar;