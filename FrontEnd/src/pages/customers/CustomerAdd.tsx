import Card from '../../components/ui/Card';
import CustomerForm from '../../components/customers/CustomerForm';
import DashboardButton from '../../components/ui/DashboardButton';

const CustomerAdd = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <DashboardButton />
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add New Customer</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Fill in the details to add a new customer</p>
      </header>
      
      <Card>
        <CustomerForm />
      </Card>
    </div>
  );
};

export default CustomerAdd;