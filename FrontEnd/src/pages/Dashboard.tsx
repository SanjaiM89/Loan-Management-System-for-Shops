import { useState, useEffect } from 'react';
import { Users, Package, IndianRupee, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Stat from '../components/ui/Stat';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/currency';
import axios from 'axios';
import { toast } from 'react-toastify';

interface DashboardStats {
  totalCustomers: number;
  totalLoans: number;
  totalUnpaidAmount: number;
  totalPaidAmount: number;
}

interface ChartDataPoint {
  name: string;
  loans: number;
  collections: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalLoans: 0,
    totalUnpaidAmount: 0,
    totalPaidAmount: 0
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/dashboard');
        setStats(response.data.stats);
        setChartData(response.data.chartData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back to your loan management dashboard</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <Stat 
            title="Total Customers" 
            value={stats.totalCustomers} 
            icon={<Users className="h-5 w-5" />}
            change={{ value: 12, type: 'increase' }}
          />
          
          <Stat 
            title="Total Loans" 
            value={stats.totalLoans} 
            icon={<Package className="h-5 w-5" />}
            change={{ value: 8, type: 'increase' }}
          />
          
          <Stat 
            title="Outstanding Loans" 
            value={formatCurrency(stats.totalUnpaidAmount)} 
            icon={<IndianRupee className="h-5 w-5" />}
            change={{ value: 5, type: 'increase' }}
          />
          
          <Stat 
            title="Total Collections" 
            value={formatCurrency(stats.totalPaidAmount)} 
            icon={<TrendingUp className="h-5 w-5" />}
            change={{ value: 16, type: 'increase' }}
          />
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full">
            <h2 className="text-lg font-semibold mb-4">Loan Activity</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area 
                    type="monotone" 
                    dataKey="loans" 
                    stackId="1"
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="collections" 
                    stackId="1"
                    stroke="#14B8A6" 
                    fill="#14B8A6" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/customers/add">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-primary-500">
            <div className="flex items-center">
              <div className="mr-4 p-3 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Add Customer</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Register a new customer</p>
              </div>
            </div>
          </Card>
        </Link>
        
        <Link to="/products/add">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-secondary-500">
            <div className="flex items-center">
              <div className="mr-4 p-3 rounded-full bg-secondary-100 dark:bg-secondary-900/50 text-secondary-600 dark:text-secondary-400">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Add Product</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Create a new product</p>
              </div>
            </div>
          </Card>
        </Link>
        
        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-accent-500">
          <div className="flex items-center">
            <div className="mr-4 p-3 rounded-full bg-accent-100 dark:bg-accent-900/50 text-accent-600 dark:text-accent-400">
              <IndianRupee className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Create Loan</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Create a new loan record</p>
            </div>
          </div>
        </Card>
        
        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-success-500">
          <div className="flex items-center">
            <div className="mr-4 p-3 rounded-full bg-success-100 dark:bg-success-900/50 text-success-600 dark:text-success-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">View Reports</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Analyze loan statistics</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;