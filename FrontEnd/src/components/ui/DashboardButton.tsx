import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './Button';

const DashboardButton = () => {
  return (
    <Link to="/">
      <Button
        variant="outline"
        icon={<Home className="h-4 w-4" />}
        className="fixed bottom-4 right-4 z-50 shadow-lg"
      >
        Dashboard
      </Button>
    </Link>
  );
};

export default DashboardButton;