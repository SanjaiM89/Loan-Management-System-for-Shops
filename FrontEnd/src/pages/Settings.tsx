import { useState } from 'react';
import { Save, Trash2, Calendar } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DateRangePicker from '../components/ui/DateRangePicker';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useAuth } from '../hooks/useAuth';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  
  // Form states
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to set new password';
      }
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user info
      await updateUser({
        name: formData.name,
        email: formData.email,
        ...(formData.newPassword && { password: formData.newPassword })
      });
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearDatabase = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Clearing database with date range:', dateRange);
    } catch (error) {
      console.error('Error clearing database:', error);
    } finally {
      setIsLoading(false);
      setShowClearDialog(false);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account and application settings</p>
      </header>
      
      {/* Account Settings */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="input-label">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`input-field ${errors.name ? 'border-error-500' : ''}`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-error-500">{errors.name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="input-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`input-field ${errors.email ? 'border-error-500' : ''}`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-error-500">{errors.email}</p>
            )}
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-md font-medium mb-3">Change Password</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="input-label">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className={`input-field ${errors.currentPassword ? 'border-error-500' : ''}`}
                />
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-error-500">{errors.currentPassword}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="newPassword" className="input-label">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`input-field ${errors.newPassword ? 'border-error-500' : ''}`}
                />
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-error-500">{errors.newPassword}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="input-label">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`input-field ${errors.confirmPassword ? 'border-error-500' : ''}`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-error-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              icon={<Save className="h-4 w-4" />}
              isLoading={isLoading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
      
      {/* Database Management */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Database Management</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-md font-medium mb-2">Clear Database</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select a date range to clear specific records, or leave empty to clear all data.
            </p>
            
            <div className="flex items-center space-x-4">
              <div className="flex-grow">
                <DateRangePicker
                  startDate={dateRange[0]}
                  endDate={dateRange[1]}
                  onChange={(dates) => setDateRange(dates)}
                />
              </div>
              <Button
                variant="accent"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={() => setShowClearDialog(true)}
              >
                Clear Data
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Clear Database Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleClearDatabase}
        title="Clear Database"
        message={
          <div className="space-y-2">
            <p>Are you sure you want to clear the database?</p>
            {dateRange[0] && dateRange[1] ? (
              <p>
                This will delete all records between{' '}
                <span className="font-medium">{dateRange[0].toLocaleDateString()}</span> and{' '}
                <span className="font-medium">{dateRange[1].toLocaleDateString()}</span>.
              </p>
            ) : (
              <p className="font-medium text-error-600 dark:text-error-400">
                This will delete ALL records from the database!
              </p>
            )}
            <p>This action cannot be undone.</p>
          </div>
        }
        confirmLabel="Clear Database"
        isLoading={isLoading}
      />
    </div>
  );
};

export default Settings;