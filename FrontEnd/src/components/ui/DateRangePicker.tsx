import { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (dates: [Date | null, Date | null]) => void;
  className?: string;
}

const DateRangePicker = ({ startDate, endDate, onChange, className = '' }: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <div 
        className="input-field flex items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
        <span className="text-sm">
          {startDate && endDate ? (
            `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
          ) : (
            'Select date range'
          )}
        </span>
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          <DatePicker
            selected={startDate}
            onChange={onChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
            maxDate={new Date()}
          />
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;