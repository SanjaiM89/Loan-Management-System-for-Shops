import CategoryForm from '../../pages/products/CategoryForm';
import { toast } from 'react-toastify';

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  productsCount: number;
  createdAt: string;
}

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, 'productsCount' | 'createdAt'>) => void;
  initialData?: Category;
  title: string;
}

const CategoryDialog = ({ isOpen, onClose, onSave, initialData, title }: CategoryDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900"></div>
        </div>
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true"></span>
        <div className="inline-block transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{title}</h3>
            <CategoryForm
              onSubmit={async (data) => {
                try {
                  await onSave(data);
                  onClose();
                } catch (error) {
                  console.error('Error saving category:', error);
                  toast.error('Failed to save category');
                }
              }}
              initialData={initialData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDialog;