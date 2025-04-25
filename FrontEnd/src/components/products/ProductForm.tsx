import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { Camera, Upload } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface ProductFormData {
  id?: string;
  name: string;
  unit: string;
  category: string;
  photo?: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  onSubmit?: (productData: ProductFormData) => void;
  initialData?: Partial<ProductFormData>;
}

const UNIT_TYPES = [
  { id: 'kg', name: 'Kilogram (kg)' },
  { id: 'g', name: 'Gram (g)' },
  { id: 'l', name: 'Liter (l)' },
  { id: 'ml', name: 'Milliliter (ml)' },
  { id: 'pcs', name: 'Pieces (pcs)' },
  { id: 'pkg', name: 'Package (pkg)' },
];

const ProductForm = ({ onSubmit, initialData }: ProductFormProps) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<ProductFormData>({
    id: initialData?.id || '',
    name: initialData?.name || '',
    unit: initialData?.unit || '',
    category: initialData?.category || '',
    photo: initialData?.photo || null,
  });
  const [errors, setErrors] = useState<Partial<ProductFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8000/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ProductFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({ ...prev, photo: event.target.result as string }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<ProductFormData> = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.unit) newErrors.unit = 'Unit is required';
    if (!formData.category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const productData = {
        id: formData.id,
        name: formData.name,
        unit: formData.unit,
        category: formData.category,
        photo: formData.photo || undefined,
      };
      if (onSubmit) {
        await onSubmit(productData);
      } else {
        await axios.post('http://localhost:8000/products', productData);
        toast.success('Product created');
        navigate('/products');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6 flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-32 h-32 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
            {formData.photo ? (
              <img src={formData.photo} alt="Product" className="w-full h-full object-cover" />
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
        <p className="text-sm text-gray-500 dark:text-gray-400">Upload product photo (optional)</p>
      </div>
      <div className="input-group">
        <label htmlFor="name" className="input-label">
          Product Name <span className="text-error-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`input-field ${errors.name ? 'border-error-500 focus:ring-error-500' : ''}`}
          placeholder="Smartphone XYZ"
        />
        {errors.name && <p className="mt-1 text-sm text-error-500">{errors.name}</p>}
      </div>
      <div className="input-group">
        <label htmlFor="unit" className="input-label">
          Unit <span className="text-error-500">*</span>
        </label>
        <select
          id="unit"
          name="unit"
          value={formData.unit}
          onChange={handleChange}
          className={`input-field ${errors.unit ? 'border-error-500 focus:ring-error-500' : ''}`}
        >
          <option value="">Select a unit</option>
          {UNIT_TYPES.map(unit => (
            <option key={unit.id} value={unit.id}>{unit.name}</option>
          ))}
        </select>
        {errors.unit && <p className="mt-1 text-sm text-error-500">{errors.unit}</p>}
      </div>
      <div className="input-group">
        <label htmlFor="category" className="input-label">
          Category <span className="text-error-500">*</span>
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`input-field ${errors.category ? 'border-error-500 focus:ring-error-500' : ''}`}
        >
          <option value="">Select a category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-sm text-error-500">{errors.category}</p>}
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/products')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Save Product
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;