import Papa from 'papaparse';
import { Customer } from '../data/mockData';

export const exportCustomersToCSV = (customers: Customer[]) => {
  const data = customers.map(customer => ({
    'Name': customer.name,
    'Mobile Number': customer.mobileNumber,
    'Address': customer.address,
    'Registration Date': customer.createdAt,
    'Total Loans': customer.totalLoans,
    'Unpaid Loans': customer.unpaidLoans,
    'Last Loan Date': customer.lastLoanDate
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};