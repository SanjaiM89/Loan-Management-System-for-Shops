import { format } from 'date-fns';

// Generate random dates within the last year
function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Format date to human-readable string
function formatDate(date: Date) {
  return format(date, 'MMM d, yyyy');
}

// Generate a random ID
function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// Generate random amount between min and max
function randomAmount(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Customer mock data
export interface Customer {
  id: string;
  name: string;
  mobileNumber: string;
  address: string;
  photo: string | null;
  createdAt: string;
  totalLoans: number;
  unpaidLoans: number;
  lastLoanDate: string;
}

export const customers: Customer[] = Array.from({ length: 20 }, (_, i) => {
  const createdDate = randomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date());
  const totalLoans = Math.floor(Math.random() * 10);
  const unpaidLoans = Math.floor(Math.random() * (totalLoans + 1));
  
  return {
    id: generateId(),
    name: [
      'Rajesh Kumar', 'Priya Patel', 'Amit Shah', 'Deepika Singh', 'Suresh Reddy',
      'Anita Desai', 'Vikram Mehta', 'Neha Sharma', 'Arun Verma', 'Meera Kapoor',
      'Sanjay Gupta', 'Pooja Malhotra', 'Rahul Joshi', 'Kavita Rao', 'Arjun Nair',
      'Sunita Iyer', 'Karthik Krishnan', 'Anjali Menon', 'Dinesh Tiwari', 'Lakshmi Venkat'
    ][i % 20],
    mobileNumber: `98765${Math.floor(10000 + Math.random() * 90000)}`,
    address: `${Math.floor(100 + Math.random() * 900)} ${['Gandhi Road', 'Nehru Street', 'Patel Nagar', 'MG Road', 'Subhash Marg'][i % 5]}, ${['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'][i % 5]}`,
    photo: null,
    createdAt: formatDate(createdDate),
    totalLoans,
    unpaidLoans,
    lastLoanDate: formatDate(randomDate(createdDate, new Date())),
  };
});

// Product Categories
export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt: string;
  productsCount: number;
}

export const categories: Category[] = [
  { 
    id: 'cooking-oils',
    name: 'Cooking Oils',
    description: 'Pure and natural cooking oils',
    createdAt: formatDate(new Date('2024-01-15')),
    productsCount: 5
  },
  { 
    id: 'specialty-oils',
    name: 'Specialty Oils',
    description: 'Premium and specialty cooking oils',
    createdAt: formatDate(new Date('2024-01-20')),
    productsCount: 4
  },
  { 
    id: 'organic-oils',
    name: 'Organic Oils',
    description: 'Certified organic cooking oils',
    createdAt: formatDate(new Date('2024-02-01')),
    productsCount: 2
  },
  { 
    id: 'cold-pressed',
    name: 'Cold Pressed Oils',
    description: 'Traditional cold pressed oils',
    createdAt: formatDate(new Date('2024-02-10')),
    productsCount: 1
  },
  { 
    id: 'blended-oils',
    name: 'Blended Oils',
    description: 'Multi-purpose blended oils',
    createdAt: formatDate(new Date('2024-02-15')),
    productsCount: 3
  }
];

// Product mock data
export interface Product {
  id: string;
  name: string;
  unit: string;
  category: string;
  photo: string | null;
  createdAt: string;
}

export const products: Product[] = Array.from({ length: 15 }, (_, i) => {
  const createdDate = randomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date());
  
  return {
    id: generateId(),
    name: [
      'Premium Groundnut Oil', 'Pure Sesame Oil', 'Virgin Coconut Oil', 'Cold Pressed Mustard Oil',
      'Extra Virgin Olive Oil', 'Traditional Wood Pressed Oil', 'Organic Sunflower Oil',
      'Black Sesame Oil', 'Pure Castor Oil', 'Rice Bran Oil', 'Filtered Groundnut Oil',
      'Cold Pressed Coconut Oil', 'Premium Mustard Oil', 'Organic Sesame Oil', 'Blended Cooking Oil'
    ][i % 15],
    unit: ['l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l'][i % 15],
    category: ['cooking-oils', 'specialty-oils', 'organic-oils', 'cold-pressed', 'blended-oils'][i % 5],
    photo: null,
    createdAt: formatDate(createdDate),
  };
});

// Loan mock data
export interface Loan {
  id: string;
  customerId: string;
  productId: string;
  amount: number;
  status: 'paid' | 'unpaid';
  loanDate: string;
  dueDate: string;
  paymentDate: string | null;
}

export const loans: Loan[] = [];

// Generate loans for customers
customers.forEach(customer => {
  const numLoans = customer.totalLoans;
  
  for (let i = 0; i < numLoans; i++) {
    const loanDate = randomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date());
    const dueDate = new Date(loanDate);
    dueDate.setDate(dueDate.getDate() + 30);
    
    const isPaid = i >= customer.unpaidLoans;
    const paymentDate = isPaid ? 
      formatDate(randomDate(loanDate, new Date())) : null;
    
    loans.push({
      id: generateId(),
      customerId: customer.id,
      productId: products[Math.floor(Math.random() * products.length)].id,
      amount: randomAmount(500, 10000),
      status: isPaid ? 'paid' : 'unpaid',
      loanDate: formatDate(loanDate),
      dueDate: formatDate(dueDate),
      paymentDate,
    });
  }
});

// Dashboard stats data
export const dashboardStats = {
  totalCustomers: customers.length,
  totalLoans: loans.length,
  totalUnpaidAmount: loans
    .filter(loan => loan.status === 'unpaid')
    .reduce((sum, loan) => sum + loan.amount, 0),
  totalPaidAmount: loans
    .filter(loan => loan.status === 'paid')
    .reduce((sum, loan) => sum + loan.amount, 0),
  recentCustomers: customers
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5),
  recentLoans: loans
    .sort((a, b) => new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime())
    .slice(0, 5)
    .map(loan => {
      const customer = customers.find(c => c.id === loan.customerId);
      const product = products.find(p => p.id === loan.productId);
      return {
        ...loan,
        customerName: customer?.name || 'Unknown',
        productName: product?.name || 'Unknown',
      };
    }),
};

// Customer lookup by ID
export function getCustomerById(id: string): Customer | undefined {
  return customers.find(customer => customer.id === id);
}

// Get loans by customer ID
export function getLoansByCustomerId(customerId: string) {
  return loans
    .filter(loan => loan.customerId === customerId)
    .map(loan => {
      const product = products.find(p => p.id === loan.productId);
      return {
        ...loan,
        productName: product?.name || 'Unknown',
      };
    })
    .sort((a, b) => new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime());
}

// Mark loan as paid
export function markLoanAsPaid(loanId: string): boolean {
  const loanIndex = loans.findIndex(loan => loan.id === loanId);
  
  if (loanIndex !== -1 && loans[loanIndex].status === 'unpaid') {
    loans[loanIndex] = {
      ...loans[loanIndex],
      status: 'paid',
      paymentDate: formatDate(new Date())
    };
    
    // Update customer's unpaid loans count
    const customerId = loans[loanIndex].customerId;
    const customerIndex = customers.findIndex(customer => customer.id === customerId);
    
    if (customerIndex !== -1) {
      customers[customerIndex] = {
        ...customers[customerIndex],
        unpaidLoans: customers[customerIndex].unpaidLoans - 1
      };
    }
    
    return true;
  }
  
  return false;
}

// Delete customer
export function deleteCustomer(id: string): boolean {
  const index = customers.findIndex(customer => customer.id === id);
  if (index !== -1) {
    customers.splice(index, 1);
    return true;
  }
  return false;
}

// Delete product
export function deleteProduct(id: string): boolean {
  const index = products.findIndex(product => product.id === id);
  if (index !== -1) {
    products.splice(index, 1);
    return true;
  }
  return false;
}

// Update product
export function updateProduct(id: string, data: Partial<Product>): boolean {
  const index = products.findIndex(product => product.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...data };
    return true;
  }
  return false;
}

// Add category
export function addCategory(category: Omit<Category, 'productsCount' | 'createdAt'>): Category {
  const newCategory = {
    ...category,
    createdAt: formatDate(new Date()),
    productsCount: 0
  };
  categories.push(newCategory);
  return newCategory;
}

// Update category
export function updateCategory(id: string, data: Partial<Category>): boolean {
  const index = categories.findIndex(category => category.id === id);
  if (index !== -1) {
    categories[index] = { ...categories[index], ...data };
    return true;
  }
  return false;
}

// Delete category
export function deleteCategory(id: string): boolean {
  const index = categories.findIndex(category => category.id === id);
  if (index !== -1) {
    categories.splice(index, 1);
    return true;
  }
  return false;
}