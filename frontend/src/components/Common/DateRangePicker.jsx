import React, { useState, useEffect, useRef } from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isWithinInterval, parseISO } from 'date-fns';

const DateRangePicker = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange, 
  minDate = null, 
  maxDate = null, 
  placeholder = "Select date range",
  presets = true,
  clearable = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const pickerRef = useRef(null);

  const presetOptions = [
    { label: 'Today', value: 'today', getValue: () => ({ start: new Date(), end: new Date() }) },
    { label: 'Yesterday', value: 'yesterday', getValue: () => ({ start: addDays(new Date(), -1), end: addDays(new Date(), -1) }) },
    { label: 'Last 7 Days', value: 'last7days', getValue: () => ({ start: addDays(new Date(), -6), end: new Date() }) },
    { label: 'Last 30 Days', value: 'last30days', getValue: () => ({ start: addDays(new Date(), -29), end: new Date() }) },
    { label: 'This Month', value: 'thismonth', getValue: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
    { label: 'Last Month', value: 'lastmonth', getValue: () => ({ start: startOfMonth(subMonths(new Date(), 1)), end: endOfMonth(subMonths(new Date(), 1)) }) },
    { label: 'Custom Range', value: 'custom', getValue: () => null }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartDateSelect = (date) => {
    if (endDate && date > parseISO(endDate)) {
      onStartDateChange(format(date, 'yyyy-MM-dd'));
      onEndDateChange(format(date, 'yyyy-MM-dd'));
    } else {
      onStartDateChange(format(date, 'yyyy-MM-dd'));
    }
    setSelectedPreset('custom');
  };

  const handleEndDateSelect = (date) => {
    if (startDate && date < parseISO(startDate)) {
      onEndDateChange(format(date, 'yyyy-MM-dd'));
      onStartDateChange(format(date, 'yyyy-MM-dd'));
    } else {
      onEndDateChange(format(date, 'yyyy-MM-dd'));
    }
    setSelectedPreset('custom');
  };

  const handlePresetSelect = (preset) => {
    if (preset.getValue) {
      const range = preset.getValue();
      if (range) {
        onStartDateChange(format(range.start, 'yyyy-MM-dd'));
        onEndDateChange(format(range.end, 'yyyy-MM-dd'));
        setSelectedPreset(preset.value);
        setIsOpen(false);
      }
    }
  };

  const handleClear = () => {
    onStartDateChange('');
    onEndDateChange('');
    setSelectedPreset(null);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
          <div key={dayName} className="text-center text-xs font-medium text-gray-500 py-2">
            {dayName}
          </div>
        ))}
        {days.map((day, idx) => {
          const isSelected = (startDate && isSameDay(day, parseISO(startDate))) || (endDate && isSameDay(day, parseISO(endDate)));
          const isInRange = startDate && endDate && isWithinInterval(day, { start: parseISO(startDate), end: parseISO(endDate) });
          const isDisabled = (minDate && day < parseISO(minDate)) || (maxDate && day > parseISO(maxDate));
          const isHovered = hoveredDate && isSameDay(day, hoveredDate);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={idx}
              onClick={() => {
                if (!startDate || (startDate && endDate)) {
                  handleStartDateSelect(day);
                } else {
                  handleEndDateSelect(day);
                }
              }}
              onMouseEnter={() => setHoveredDate(day)}
              onMouseLeave={() => setHoveredDate(null)}
              disabled={isDisabled}
              className={`
                relative w-10 h-10 text-sm rounded-md transition-colors
                ${isSelected ? 'bg-blue-500 text-white' : ''}
                ${isInRange && !isSelected ? 'bg-blue-100' : ''}
                ${isToday && !isSelected ? 'bg-gray-100 font-semibold' : ''}
                ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-50 cursor-pointer'}
                ${!isSameMonth(day, currentMonth) ? 'text-gray-400' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    );
  };

  const renderMonthNavigation = () => (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        className="p-2 hover:bg-gray-100 rounded-md"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      <h3 className="text-lg font-semibold text-gray-900">
        {format(currentMonth, 'MMMM yyyy')}
      </h3>
      <button
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        className="p-2 hover:bg-gray-100 rounded-md"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>
  );

  const displayText = () => {
    if (startDate && endDate) {
      return `${format(parseISO(startDate), 'MMM dd, yyyy')} - ${format(parseISO(endDate), 'MMM dd, yyyy')}`;
    } else if (startDate) {
      return `${format(parseISO(startDate), 'MMM dd, yyyy')} - Select end date`;
    }
    return placeholder;
  };

  return (
    <div className="relative" ref={pickerRef}>
      {/* Input Field */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex items-center justify-between">
          <span className={`text-sm ${startDate || endDate ? 'text-gray-900' : 'text-gray-500'}`}>
            {displayText()}
          </span>
          <div className="flex items-center space-x-2">
            {clearable && (startDate || endDate) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <XIcon className="h-4 w-4 text-gray-400" />
              </button>
            )}
            <CalendarIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
          {/* Presets */}
          {presets && (
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Select</h4>
              <div className="grid grid-cols-2 gap-2">
                {presetOptions.map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => handlePresetSelect(preset)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      selectedPreset === preset.value
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Calendar */}
          <div className="p-4">
            {renderMonthNavigation()}
            {renderCalendar()}
          </div>

          {/* Selected Range Info */}
          {startDate && endDate && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Selected: <span className="font-medium">{displayText()}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.ceil((parseISO(endDate) - parseISO(startDate)) / (1000 * 60 * 60 * 24)) + 1} days
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;