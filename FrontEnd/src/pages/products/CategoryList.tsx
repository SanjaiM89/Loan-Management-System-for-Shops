import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Plus, Search, Trash } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import ConfirmDialog from '../ui/ConfirmDialog';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  productsCount: number;
  createdAt: string;
}

const CategoryList = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const fetchCategories = async () => {
    setIsLoading(true);
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

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await axios.delete(`http://localhost:8000/categories/${deleteDialog.id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
    setDeleteDialog({ open: false, id: null });
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  if (isLoading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Categories</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage product categories</p>
        </div>
        <Button onClick={() => navigate('/products/categories/add')}>
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </header>

      <Card>
        <div className="p-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full input-field"
            />
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No categories found matching your criteria
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredCategories.map(category => (
              <Card key={category.id} className="flex flex-col">
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                  {category.image ? (
                    <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4 flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{category.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {category.description || 'No description'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {category.productsCount} products
                  </p>
                </div>
                <div className="p-4 flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="small"
                    icon={<Edit className="h-4 w-4" />}
                    onClick={() => navigate(`/products/categories/${category.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    icon={<Trash className="h-4 w-4" />}
                    onClick={() => setDeleteDialog({ open: true, id: category.id })}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category?"
      />
    </div>
  );
};

export default CategoryList;