import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Filter, Plus, Search, Trash } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import FilterDrawer from '../../components/ui/FilterDrawer';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import CategoryDialog from '../../components/products/CategoryDialog';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Product {
  id: string;
  name: string;
  unit: string;
  category: string;
  photo?: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  productsCount: number;
  createdAt: string;
}

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<Category | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null; type: 'product' | 'category' | null }>({ open: false, id: null, type: null });
  const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({ startDate: null, endDate: null });

  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        axios.get('http://localhost:8000/products'),
        axios.get('http://localhost:8000/categories')
      ]);
      setProducts(productsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveCategory = async (categoryData: Omit<Category, 'productsCount' | 'createdAt'>) => {
    try {
      if (selectedCategoryForEdit) {
        await axios.put(`http://localhost:8000/categories/${categoryData.id}`, categoryData);
        toast.success('Category updated');
      } else {
        await axios.post('http://localhost:8000/categories', categoryData);
        toast.success('Category created');
      }
      fetchData();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
    setSelectedCategoryForEdit(null);
  };

  const handleDelete = async () => {
    if (!deleteDialog.id || !deleteDialog.type) return;
    try {
      if (deleteDialog.type === 'product') {
        await axios.delete(`http://localhost:8000/products/${deleteDialog.id}`);
        toast.success('Product deleted');
      } else {
        await axios.delete(`http://localhost:8000/categories/${deleteDialog.id}`);
        toast.success('Category deleted');
      }
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete');
    }
    setDeleteDialog({ open: false, id: null, type: null });
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
      const matchesDateRange = dateRange.startDate && dateRange.endDate
        ? new Date(product.createdAt) >= dateRange.startDate && new Date(product.createdAt) <= dateRange.endDate
        : true;
      return matchesSearch && matchesCategory && matchesDateRange;
    });
  }, [products, searchQuery, selectedCategory, dateRange]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  if (isLoading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Products</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your product catalog</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setIsCategoryDialogOpen(true)} variant="outline">
            Manage Categories
          </Button>
          <Button onClick={() => navigate('/products/add')} variant="primary">
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>
      </header>

      <Card>
        <div className="p-4 flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full input-field"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(true)}
            icon={<Filter className="h-4 w-4" />}
          >
            Filter
          </Button>
        </div>

        {paginatedProducts.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No products found matching your criteria
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 text-left text-sm text-gray-500 dark:text-gray-300">
                <th className="p-4">Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Unit</th>
                <th className="p-4">Created</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(product => (
                <tr key={product.id} className="border-t dark:border-gray-700">
                  <td className="p-4">
                    {product.photo ? (
                      <img src={product.photo} alt={product.name} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                        No Image
                      </div>
                    )}
                  </td>
                  <td className="p-4">{product.name}</td>
                  <td className="p-4">{getCategoryName(product.category)}</td>
                  <td className="p-4">{product.unit}</td>
                  <td className="p-4">{new Date(product.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 flex space-x-2">
                    <Button
                      variant="outline"
                      size="small"
                      icon={<Edit className="h-4 w-4" />}
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="accent"
                      size="small"
                      icon={<Trash className="h-4 w-4" />}
                      onClick={() => setDeleteDialog({ open: true, id: product.id, type: 'product' })}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="p-4 flex justify-between items-center">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        dateRange={dateRange}
        onDateRangeChange={(dates) => setDateRange({ startDate: dates[0], endDate: dates[1] })}
        additionalFilters={
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field w-full"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        }
      />

      <CategoryDialog
        isOpen={isCategoryDialogOpen}
        onClose={() => {
          setIsCategoryDialogOpen(false);
          setSelectedCategoryForEdit(null);
        }}
        onSave={handleSaveCategory}
        initialData={selectedCategoryForEdit}
        title={selectedCategoryForEdit ? 'Edit Category' : 'Add Category'}
      />

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, type: null })}
        onConfirm={handleDelete}
        title={`Delete ${deleteDialog.type === 'product' ? 'Product' : 'Category'}`}
        message={`Are you sure you want to delete this ${deleteDialog.type === 'product' ? 'product' : 'category'}?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default ProductList;