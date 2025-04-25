import { X } from 'lucide-react';
import Button from './Button';
import DateRangePicker from './DateRangePicker';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  onDateRangeChange: (dates: [Date | null, Date | null]) => void;
  additionalFilters?: React.ReactNode;
}

const FilterDrawer = ({ 
  isOpen, 
  onClose, 
  dateRange, 
  onDateRangeChange,
  additionalFilters 
}: FilterDrawerProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="relative w-96">
          <div className="h-full bg-white dark:bg-gray-800 shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Range
                  </label>
                  <DateRangePicker
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                    onChange={onDateRangeChange}
                  />
                </div>
                
                {additionalFilters}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    onDateRangeChange([null, null]);
                  }}
                  fullWidth
                >
                  Reset
                </Button>
                <Button onClick={onClose} fullWidth>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterDrawer;