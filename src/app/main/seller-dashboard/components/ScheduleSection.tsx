'use client';

import { useState } from 'react';

export default function ScheduleSection() {
  const [dateRange, setDateRange] = useState({
    startYear: '',
    startMonth: '',
    startDay: '',
    endYear: '',
    endMonth: '',
    endDay: ''
  });
  const [availability, setAvailability] = useState<{[key: string]: string}>({
    Sunday: 'Available',
    Monday: 'Available',
    Tuesday: 'Available',
    Wednesday: 'Available',
    Thursday: 'Busy',
    Friday: 'Available',
    Saturday: 'Available'
  });

  const [blockType, setBlockType] = useState('Open'); // 'Open' or 'Block'

  const handleDateChange = (field: string, value: string) => {
    // Allow only numbers and limit length
    const numericValue = value.replace(/[^0-9]/g, '');
    let maxLength = 2;
    if (field.includes('Year')) maxLength = 2; // YY
    else if (field.includes('Month')) maxLength = 2; // MM
    else if (field.includes('Day')) maxLength = 2; // DD

    setDateRange(prev => ({
      ...prev,
      [field]: numericValue.slice(0, maxLength)
    }));
  };

  const handleAvailabilityToggle = (day: string, status: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: status
    }));
  };

  const handleSubmit = () => {
    console.log('Date Range:', dateRange);
    console.log('Availability:', availability);
    console.log('Block Type:', blockType);
    // Add your submit logic here
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dateInputFields = [
    { placeholder: 'YY', name: 'startYear', value: dateRange.startYear },
    { placeholder: 'MM', name: 'startMonth', value: dateRange.startMonth },
    { placeholder: 'DD', name: 'startDay', value: dateRange.startDay },
  ];
  const dateInputFieldsEnd = [
    { placeholder: 'YY', name: 'endYear', value: dateRange.endYear },
    { placeholder: 'MM', name: 'endMonth', value: dateRange.endMonth },
    { placeholder: 'DD', name: 'endDay', value: dateRange.endDay },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 bg-gray-100 rounded-lg font-sans">
      {/* Open & Block specific dates section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-3 text-gray-800">Open & Block specific dates</h2>
        
        <div className="flex items-center gap-x-2 mb-3 flex-wrap">
          {dateInputFields.map(field => (
            <input
              key={field.name}
              type="text"
              placeholder={field.placeholder}
              value={field.value}
              onChange={(e) => handleDateChange(field.name, e.target.value)}
              className="w-16 h-10 px-2 py-2 bg-white border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
              maxLength={2}
            />
          ))}
          <span className="mx-1 text-gray-600 text-xl font-light self-center">—</span>
          {dateInputFieldsEnd.map(field => (
            <input
              key={field.name}
              type="text"
              placeholder={field.placeholder}
              value={field.value}
              onChange={(e) => handleDateChange(field.name, e.target.value)}
              className="w-16 h-10 px-2 py-2 bg-white border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
              maxLength={2}
            />
          ))}
        
          <button
            onClick={() => setBlockType('Open')}
            className={`ml-auto px-5 py-2 h-10 rounded text-sm font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              blockType === 'Open'
                ? 'bg-blue-500 text-white focus:ring-blue-400'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-300'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setBlockType('Block')}
            className={`px-5 py-2 h-10 rounded text-sm font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              blockType === 'Block'
                ? 'bg-red-500 text-white focus:ring-red-400'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-300'
            }`}
          >
            Block
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Make sure there is no booking during the time you want to block
        </p>
      </div>

      {/* Availability section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-5 text-gray-800">Availability</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-6">
          {days.map((day) => (
            <div key={day} className="flex items-center justify-between">
              <span className="font-medium text-gray-700 w-28">{day}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAvailabilityToggle(day, 'Available')}
                  className={`px-5 py-2 w-28 rounded text-sm font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    availability[day] === 'Available'
                      ? 'bg-teal-500 text-white focus:ring-teal-400'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300'
                  }`}
                >
                  Available
                </button>
                <button
                  onClick={() => handleAvailabilityToggle(day, 'Busy')}
                  className={`px-5 py-2 w-28 rounded text-sm font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    availability[day] === 'Busy'
                      ? 'bg-yellow-500 text-white focus:ring-yellow-400'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300'
                  }`}
                >
                  Busy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Update Button Container */}
      <div className="flex justify-start">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white py-2.5 px-12 rounded text-sm font-semibold hover:bg-blue-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          Update
        </button>
      </div>
    </div>
  );
}
