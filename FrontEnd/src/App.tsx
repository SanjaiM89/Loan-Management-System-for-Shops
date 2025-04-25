import { useEffect } from 'react';
import { Navigate, Route, Routes, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import CustomerList from './pages/customers/CustomerList';
import CustomerAdd from './pages/customers/CustomerAdd';
import CustomerDetail from './pages/customers/CustomerDetail';
import ProductList from './pages/products/ProductList';
import ProductAdd from './pages/products/ProductAdd';
import CategoryList from './pages/products/CategoryList';
import CategoryForm from './pages/products/CategoryForm';
import ProductForm from './components/products/ProductForm';
import Card from './components/ui/Card';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const CategoryEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/categories/${id}`);
        setCategory(response.data);
      } catch (error) {
        console.error('Error fetching category:', error);
        toast.error('Failed to load category');
        navigate('/products/categories');
      }
    };
    fetchCategory();
  }, [id, navigate]);

  if (!category) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Category</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Update category details</p>
      </header>
      <Card title="Edit Category">
        <CategoryForm
          initialData={category}
          onSubmit={async (data) => {
            try {
              await axios.put(`http://localhost:8000/categories/${id}`, data);
              toast.success('Category updated');
              navigate('/products/categories');
            } catch (error) {
              console.error('Error updating category:', error);
              toast.error('Failed to update category');
            }
          }}
        />
      </Card>
    </div>
  );
};

const ProductEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
        navigate('/products');
      }
    };
    fetchProduct();
  }, [id, navigate]);

  if (!product) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Product</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Update product details</p>
      </header>
      <Card title="Edit Product">
        <ProductForm
          initialData={product}
          onSubmit={async (data) => {
            try {
              await axios.put(`http://localhost:8000/products/${id}`, data);
              toast.success('Product updated');
              navigate('/products');
            } catch (error) {
              console.error('Error updating product:', error);
              toast.error('Failed to update product');
            }
          }}
        />
      </Card>
    </div>
  );
};

function App() {
  const { theme } = useTheme();
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="customers">
            <Route index element={<CustomerList />} />
            <Route path="add" element={<CustomerAdd />} />
            <Route path=":id" element={<CustomerDetail />} />
          </Route>
          <Route path="products">
            <Route index element={<ProductList />} />
            <Route path="add" element={<ProductAdd />} />
            <Route path=":id/edit" element={<ProductEdit />} />
            <Route path="categories">
              <Route index element={<CategoryList />} />
              <Route path="add" element={
                <div className="space-y-6 animate-fade-in">
                  <header>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add Category</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Create a new category</p>
                  </header>
                  <Card title="New Category">
                    <CategoryForm 
                      onSubmit={async (data) => {
                        try {
                          await axios.post('http://localhost:8000/categories', data);
                          toast.success('Category created');
                          navigate('/products/categories');
                        } catch (error) {
                          console.error('Error creating category:', error);
                          toast.error('Failed to create category');
                        }
                      }}
                    />
                  </Card>
                </div>
              } />
              <Route path=":id/edit" element={<CategoryEdit />} />
            </Route>
          </Route>
          <Route path="settings" element={<Settings />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;