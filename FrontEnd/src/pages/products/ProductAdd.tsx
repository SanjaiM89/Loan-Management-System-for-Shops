import Card from '../ui/Card';
import ProductForm from '../components/products/ProductForm';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProductAdd = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add Product</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Create a new product</p>
      </header>
      <Card>
        <ProductForm
          onSubmit={async (data) => {
            try {
              await axios.post('http://localhost:8000/products', data);
              toast.success('Product created');
              navigate('/products');
            } catch (error) {
              console.error('Error creating product:', error);
              toast.error('Failed to create product');
            }
          }}
        />
      </Card>
    </div>
  );
};

export default ProductAdd;