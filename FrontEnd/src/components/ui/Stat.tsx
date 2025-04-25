import { ReactNode } from 'react';
import Card from './Card';

interface StatProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  isLoading?: boolean;
  className?: string;
}

const Stat = ({ title, value, icon, change, isLoading = false, className = '' }: StatProps) => {
  return (
    <Card className={`${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
          ) : (
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {value}
            </p>
          )}
          
          {change && (
            <div className="flex items-center mt-1">
              <span className={
                change.type === 'increase' 
                  ? 'text-success-600 dark:text-success-400' 
                  : 'text-error-600 dark:text-error-400'
              }>
                {change.type === 'increase' ? '↑' : '↓'} {Math.abs(change.value)}%
              </span>
              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">from last month</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default Stat;