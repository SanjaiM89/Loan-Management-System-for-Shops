import { Link, useLocation } from 'react-router-dom';
import { 
  X, Home, Users, Package, DollarSign, Settings, ChevronDown, ChevronRight, Tags
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  onClose?: () => void;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

interface NavGroupProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const NavItem = ({ to, icon, label, isActive }: NavItemProps) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <span className="mr-3 h-5 w-5">{icon}</span>
      {label}
    </Link>
  );
};

const NavGroup = ({ icon, label, children, defaultOpen = false }: NavGroupProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="mr-3 h-5 w-5">{icon}</span>
        {label}
        <span className="ml-auto h-5 w-5">
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
      </button>
      {isOpen && <div className="ml-6 mt-1 space-y-1">{children}</div>}
    </div>
  );
};

const Sidebar = ({ onClose }: SidebarProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const isCustomerSection = location.pathname.startsWith('/customers');
  const isProductSection = location.pathname.startsWith('/products') && !location.pathname.includes('categories');
  const isCategorySection = location.pathname.startsWith('/products/categories');

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors">
      {/* Sidebar header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-primary-500 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">LMS</span>
        </Link>
        
        {/* Close button for mobile */}
        {onClose && (
          <button
            type="button"
            className="lg:hidden rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        <NavItem 
          to="/" 
          icon={<Home />} 
          label="Dashboard" 
          isActive={isActive('/')} 
        />
        
        <NavGroup 
          icon={<Users />} 
          label="Customers" 
          defaultOpen={isCustomerSection}
        >
          <NavItem 
            to="/customers" 
            icon={<Users className="h-4 w-4" />} 
            label="All Customers" 
            isActive={isActive('/customers')} 
          />
          <NavItem 
            to="/customers/add" 
            icon={<Users className="h-4 w-4" />} 
            label="Add Customer" 
            isActive={isActive('/customers/add')} 
          />
        </NavGroup>
        
        <NavGroup 
          icon={<Package />} 
          label="Products" 
          defaultOpen={isProductSection}
        >
          <NavItem 
            to="/products" 
            icon={<Package className="h-4 w-4" />} 
            label="All Products" 
            isActive={isActive('/products')} 
          />
          <NavItem 
            to="/products/add" 
            icon={<Package className="h-4 w-4" />} 
            label="Add Product" 
            isActive={isActive('/products/add')} 
          />
        </NavGroup>

        <NavGroup 
          icon={<Tags />} 
          label="Categories" 
          defaultOpen={isCategorySection}
        >
          <NavItem 
            to="/products/categories" 
            icon={<Tags className="h-4 w-4" />} 
            label="All Categories" 
            isActive={isActive('/products/categories')} 
          />
          <NavItem 
            to="/products/categories/add" 
            icon={<Tags className="h-4 w-4" />} 
            label="Add Category" 
            isActive={isActive('/products/categories/add')} 
          />
        </NavGroup>

        <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
          <NavItem 
            to="/settings" 
            icon={<Settings />} 
            label="Settings" 
            isActive={isActive('/settings')} 
          />
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;