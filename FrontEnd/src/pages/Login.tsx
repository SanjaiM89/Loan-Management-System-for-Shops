import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, LogIn } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid email or password. Try admin@example.com / password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-primary-950 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary-500 flex items-center justify-center">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-5 text-3xl font-bold text-gray-900 dark:text-white">
            Loan Management System for Shops
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Manage your shop's product loans efficiently
          </p>
        </div>

        <div className="card-glass backdrop-blur-md p-8 animate-fade-in">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="input-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                  Forgot your password?
                </a>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-error-50 dark:bg-error-900/50 text-error-700 dark:text-error-300 text-sm">
                {error}
              </div>
            )}

            <div>
              <Button
                type="submit"
                fullWidth
                size="large"
                isLoading={isLoading}
                icon={<LogIn className="h-5 w-5" />}
              >
                Sign in
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              Demo credentials: <span className="font-medium text-gray-700 dark:text-gray-300">admin@example.com / password</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;