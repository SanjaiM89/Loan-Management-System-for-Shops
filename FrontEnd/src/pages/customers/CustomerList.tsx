import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Phone, Search, Filter, ChevronLeft, ChevronRight, Trash2, Download, Calendar } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DashboardButton from '../../components/ui/DashboardButton';
import FilterDrawer from '../../components/ui/FilterDrawer';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { customers, Customer, deleteCustomer } from '../../data/mockData';
import { exportCustomersToCSV } from '../../utils/csv';
import DateRangePicker from '../../components/ui/DateRangePicker';

const CustomerList = () => {
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportDateRange, setExportDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null
  });
  
  const customersPerPage = 10;
  
  useEffect(() => {
    let result = [...customers];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        customer => 
          customer.name.toLowerCase().includes(query) ||
          customer.mobileNumber.includes(query) ||
          customer.address.toLowerCase().includes(query)
      );
    }
    
    if (showUnpaidOnly) {
      result = result.filter(customer => customer.unpaidLoans > 0);
    }
    
    if (dateRange.startDate && dateRange.endDate) {
      result = result.filter(customer => {
        const customerDate = new Date(customer.createdAt);
        return customerDate >= dateRange.startDate && customerDate <= dateRange.endDate;
      });
    }
    
    setFilteredCustomers(result);
    setCurrentPage(1);
  }, [searchQuery, showUnpaidOnly, dateRange]);
  
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    
    setIsLoading(true);
    try {
      const success = deleteCustomer(customerToDelete.id);
      if (success) {
        setFilteredCustomers(prev => prev.filter(c => c.id !== customerToDelete.id));
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleExportCSV = () => {
    let customersToExport = [...filteredCustomers];
    
    if (exportDateRange[0] && exportDateRange[1]) {
      customersToExport = customersToExport.filter(customer => {
        const customerDate = new Date(customer.createdAt);
        return customerDate >= exportDateRange[0]! && customerDate <= exportDateRange[1]!;
      });
    }
    
    exportCustomersToCSV(customersToExport);
    setShowExportDialog(false);
    setExportDateRange([null, null]);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <DashboardButton />
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Customers</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your customers and their loans</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            icon={<Download className="h-4 w-4" />}
            onClick={() => setShowExportDialog(true)}
          >
            Export CSV
          </Button>
          <Link to="/customers/add">
            <Button icon={<Plus className="h-4 w-4" />}>
              Add Customer
            </Button>
          </Link>
        </div>
      </header>
      
      <Card className="p-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search customers..."
              className="pl-10 w-full input-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-primary-600 rounded"
                checked={showUnpaidOnly}
                onChange={() => setShowUnpaidOnly(!showUnpaidOnly)}
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                Unpaid loans only
              </span>
            </label>
            
            <Button 
              variant="outline" 
              icon={<Filter className="h-4 w-4" />}
              onClick={() => setIsFilterDrawerOpen(true)}
            >
              More Filters
            </Button>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="overflow-x-auto -mx-4 md:-mx-6">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mobile</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Loans</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Last Loan</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-700">
              {currentCustomers.length > 0 ? (
                currentCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <Link to={`/customers/${customer.id}`} className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                        {customer.name}
                      </Link>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <a 
                        href={`tel:${customer.mobileNumber}`} 
                        className="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        {customer.mobileNumber}
                      </a>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <span className="text-gray-900 dark:text-gray-200 font-medium">{customer.totalLoans}</span>
                      {customer.unpaidLoans > 0 && (
                        <span className="ml-2 text-sm text-warning-600 dark:text-warning-400">
                          ({customer.unpaidLoans} unpaid)
                        </span>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                      {customer.lastLoanDate}
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      {customer.unpaidLoans > 0 ? (
                        <span className="badge-warning">Has Unpaid Loans</span>
                      ) : (
                        <span className="badge-success">All Paid</span>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/customers/${customer.id}`}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                        >
                          <Button variant="outline" size="small">
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="small"
                          icon={<Trash2 className="h-4 w-4" />}
                          onClick={() => {
                            setCustomerToDelete(customer);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 md:px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No customers found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredCustomers.length > 0 && (
          <div className="px-4 md:px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{indexOfFirstCustomer + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(indexOfLastCustomer, filteredCustomers.length)}
              </span>{' '}
              of <span className="font-medium">{filteredCustomers.length}</span> customers
            </div>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="small"
                icon={<ChevronLeft className="h-4 w-4" />}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="small"
                icon={<ChevronRight className="h-4 w-4" />}
                iconPosition="right"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        dateRange={dateRange}
        onDateRangeChange={(dates) => setDateRange({ startDate: dates[0], endDate: dates[1] })}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCustomerToDelete(null);
        }}
        onConfirm={handleDeleteCustomer}
        title="Delete Customer"
        message={
          <p>
            Are you sure you want to delete <span className="font-medium">{customerToDelete?.name}</span>? This action cannot be undone.
          </p>
        }
        confirmLabel="Delete"
        isLoading={isLoading}
      />

      <ConfirmDialog
        isOpen={showExportDialog}
        onClose={() => {
          setShowExportDialog(false);
          setExportDateRange([null, null]);
        }}
        onConfirm={handleExportCSV}
        title="Export Customers"
        message={
          <div className="space-y-4">
            <p>Select a date range to export specific customers, or leave empty to export all.</p>
            <DateRangePicker
              startDate={exportDateRange[0]}
              endDate={exportDateRange[1]}
              onChange={(dates) => setExportDateRange(dates)}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {exportDateRange[0] && exportDateRange[1]
                ? `This will export customers registered between ${exportDateRange[0].toLocaleDateString()} and ${exportDateRange[1].toLocaleDateString()}`
                : 'This will export all customers'}
            </p>
          </div>
        }
        confirmLabel="Export"
        isLoading={isLoading}
      />
    </div>
  );
};

export default CustomerList;