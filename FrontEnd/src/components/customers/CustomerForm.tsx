import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { Camera, Upload } from 'lucide-react';

interface CustomerFormProps {
  onSubmit?: (customerData: CustomerFormData) => void;
  initialData?: Partial<CustomerFormData>;
}

export interface CustomerFormData {
  name: string;
  mobileNumber: string;
  address: string;
  photo: string | null;
}

const CustomerForm = ({ onSubmit, initialData }: CustomerFormProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: initialData?.name || '',
    mobileNumber: initialData?.mobileNumber || '',
    address: initialData?.address || '',
    photo: initialData?.photo || null,
  });
  
  const [errors, setErrors] = useState<Partial<CustomerFormData>>({});
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name as keyof CustomerFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setFormData(prev => ({ ...prev, photo: event.target?.result as string }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Partial<CustomerFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber.trim())) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Mock submission - replace with actual API call
        console.log('Customer data:', formData);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Navigate back to customers list
        navigate('/customers');
      }
    } catch (error) {
      console.error('Error saving customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo upload section */}
      <div className="mb-6 flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
            {formData.photo ? (
              <img src={formData.photo} alt="Customer" className="w-full h-full object-cover" />
            ) : (
              <Camera className="h-12 w-12 text-gray-400" />
            )}
          </div>
          <label htmlFor="photo" className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full cursor-pointer hover:bg-primary-600 transition-colors">
            <Upload className="h-4 w-4" />
            <input 
              type="file" 
              id="photo" 
              accept="image/*" 
              className="hidden" 
              onChange={handlePhotoChange}
            />
          </label>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Upload customer photo (optional)</p>
      </div>
      
      {/* Name field */}
      <div className="input-group">
        <label htmlFor="name" className="input-label">
          Full Name <span className="text-error-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`input-field ${errors.name ? 'border-error-500 focus:ring-error-500' : ''}`}
          placeholder="John Doe"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-error-500">{errors.name}</p>
        )}
      </div>
      
      {/* Mobile Number field */}
      <div className="input-group">
        <label htmlFor="mobileNumber" className="input-label">
          Mobile Number <span className="text-error-500">*</span>
        </label>
        <input
          type="tel"
          id="mobileNumber"
          name="mobileNumber"
          value={formData.mobileNumber}
          onChange={handleChange}
          className={`input-field ${errors.mobileNumber ? 'border-error-500 focus:ring-error-500' : ''}`}
          placeholder="1234567890"
        />
        {errors.mobileNumber && (
          <p className="mt-1 text-sm text-error-500">{errors.mobileNumber}</p>
        )}
      </div>
      
      {/* Address field */}
      <div className="input-group">
        <label htmlFor="address" className="input-label">
          Address <span className="text-error-500">*</span>
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          className={`input-field ${errors.address ? 'border-error-500 focus:ring-error-500' : ''}`}
          placeholder="123 Main St, City, Country"
        ></textarea>
        {errors.address && (
          <p className="mt-1 text-sm text-error-500">{errors.address}</p>
        )}
      </div>
      
      {/* Form actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate('/customers')}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          isLoading={isSubmitting}
        >
          Save Customer
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;