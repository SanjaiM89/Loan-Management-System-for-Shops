import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { Camera, Upload } from 'lucide-react';
import { toast } from 'react-toastify';

interface CategoryFormData {
  id?: string;
  name: string;
  description?: string;
  image?: string | null;
}

interface CategoryFormProps {
  onSubmit: (categoryData: CategoryFormData) => void;
  initialData?: CategoryFormData;
}

const CategoryForm = ({ onSubmit, initialData }: CategoryFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CategoryFormData>({
    id: initialData?.id || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    image: initialData?.image || null,
  });
  const [errors, setErrors] = useState<Partial<CategoryFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof CategoryFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({ ...prev, image: event.target.result as string }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<CategoryFormData> = {};
    if (!formData.name.trim()) newErrors.name = 'Category name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        id: formData.id,
        name: formData.name,
        description: formData.description || undefined,
        image: formData.image || undefined,
      });
      toast.success(initialData ? 'Category updated' : 'Category created');
      navigate('/products/categories');
    } catch (error) {
      console.error('Error submitting category:', error);
      toast.error('Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6 flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-32 h-32 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
            {formData.image ? (
              <img src={formData.image} alt="Category" className="w-full h-full object-cover" />
            ) : (
              <Camera className="h-12 w-12 text-gray-400" />
            )}
          </div>
          <label htmlFor="image" className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full cursor-pointer hover:bg-primary-600 transition-colors">
            <Upload className="h-4 w-4" />
            <input
              type="file"
              id="image"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Upload category image (optional)</p>
      </div>
      <div className="input-group">
        <label htmlFor="name" className="input-label">
          Category Name <span className="text-error-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`input-field ${errors.name ? 'border-error-500 focus:ring-error-500' : ''}`}
          placeholder="Electronics"
        />
        {errors.name && <p className="mt-1 text-sm text-error-500">{errors.name}</p>}
      </div>
      <div className="input-group">
        <label htmlFor="description" className="input-label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          className="input-field"
          placeholder="Category description..."
          rows={4}
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/products/categories')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          Save Category
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;