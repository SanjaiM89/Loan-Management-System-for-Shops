import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Users, IndianRupee, Check } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getCustomerById, getLoansByCustomerId, markLoanAsPaid } from '../../data/mockData';
import { formatCurrency } from '../../utils/currency';

// Tab type definition
type TabType = 'loans' | 'details' | 'history';

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('loans');
  const [isLoading, setIsLoading] = useState(false);
  
  // Get customer data
  const customer = id ? getCustomerById(id) : undefined;
  const customerLoans = id ? getLoansByCustomerId(id) : [];
  
  // Redirect if customer not found
  useEffect(() => {
    if (id && !customer) {
      navigate('/customers', { replace: true });
    }
  }, [id, customer, navigate]);
  
  if (!customer) {
    return <div>Loading...</div>;
  }
  
  // Handle mark as paid
  const handleMarkAsPaid = async (loanId: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const success = markLoanAsPaid(loanId);
      if (!success) {
        console.error('Failed to mark loan as paid');
      }
    } catch (error) {
      console.error('Error marking loan as paid:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Navigation */}
      <div>
        <Link 
          to="/customers" 
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Customers
        </Link>
      </div>
      
      {/* Customer Profile Header */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 mr-4">
              {customer.photo ? (
                <img src={customer.photo} alt={customer.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <Users className="h-8 w-8" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{customer.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-1">
                <a 
                  href={`tel:${customer.mobileNumber}`} 
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  {customer.mobileNumber}
                </a>
                <span className="hidden sm:inline text-gray-400">•</span>
                <div className="flex items-start text-gray-700 dark:text-gray-300">
                  <MapPin className="h-4 w-4 mr-1 mt-1 flex-shrink-0" />
                  <span>{customer.address}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              icon={<Users className="h-4 w-4" />}
              onClick={() => navigate(`/customers/${id}/edit`)}
            >
              Edit
            </Button>
            <Button 
              icon={<IndianRupee className="h-4 w-4" />}
            >
              New Loan
            </Button>
          </div>
        </div>
        
        {/* Summary Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Customer Since</p>
            <p className="font-medium text-gray-900 dark:text-white">{customer.createdAt}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Loans</p>
            <p className="font-medium text-gray-900 dark:text-white">{customer.totalLoans}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Unpaid Loans</p>
            <p className={`font-medium ${customer.unpaidLoans > 0 ? 'text-warning-600 dark:text-warning-400' : 'text-gray-900 dark:text-white'}`}>
              {customer.unpaidLoans}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last Loan</p>
            <p className="font-medium text-gray-900 dark:text-white">{customer.lastLoanDate}</p>
          </div>
        </div>
      </Card>
      
      {/* Tabs */}
      <div>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setActiveTab('loans')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'loans'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Loans
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Payment History
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="mt-4">
          {/* Loans Tab */}
          {activeTab === 'loans' && (
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Loan Records</h2>
                <Button icon={<IndianRupee className="h-4 w-4" />} size="small">
                  New Loan
                </Button>
              </div>
              
              <div className="overflow-x-auto -mx-4 md:-mx-6">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loan Date</th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-700">
                    {customerLoans.length > 0 ? (
                      customerLoans.map((loan) => (
                        <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                            {loan.productName}
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                            {formatCurrency(loan.amount)}
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                            {loan.loanDate}
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                            {loan.dueDate}
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            {loan.status === 'paid' ? (
                              <span className="badge-success">Paid</span>
                            ) : (
                              <span className="badge-warning">Unpaid</span>
                            )}
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right">
                            {loan.status === 'unpaid' ? (
                              <Button
                                size="small"
                                variant="outline"
                                icon={<Check className="h-4 w-4" />}
                                onClick={() => handleMarkAsPaid(loan.id)}
                                isLoading={isLoading}
                                disabled={isLoading}
                              >
                                Mark Paid
                              </Button>
                            ) : (
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Paid on {loan.paymentDate}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 md:px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          No loans found for this customer
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
          
          {/* Details Tab */}
          {activeTab === 'details' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Personal Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Full Name</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{customer.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Mobile Number</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{customer.mobileNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Address</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{customer.address}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Customer Since</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{customer.createdAt}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Loan Summary</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Total Loans</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{customer.totalLoans}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Unpaid Loans</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{customer.unpaidLoans}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Last Loan Date</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{customer.lastLoanDate}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/customers/${id}/edit`)}
                  >
                    Edit Details
                  </Button>
                </div>
              </div>
            </Card>
          )}
          
          {/* Payment History Tab */}
          {activeTab === 'history' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment History</h2>
              
              {customerLoans.filter(loan => loan.status === 'paid').length > 0 ? (
                <div className="overflow-x-auto -mx-4 md:-mx-6">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800/50">
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loan Date</th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-700">
                      {customerLoans
                        .filter(loan => loan.status === 'paid')
                        .map(loan => (
                          <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                              {loan.productName}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                              {formatCurrency(loan.amount)}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                              {loan.loanDate}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                              {loan.paymentDate}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No payment history available for this customer
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;