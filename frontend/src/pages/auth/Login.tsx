import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../context/authStore';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // Redirect based on role
      if (user.role === 'Director') {
        navigate('/director/dashboard');
      } else if (user.role === 'Librarian') {
        navigate('/librarian/resources');
      } else {
        navigate('/patron/search');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8" style={{ animation: 'slide-up 0.5s ease-out' }}>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-primary-600 p-3 rounded-full" style={{ animation: 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}>
                <BookOpen className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ animation: 'fade-in 0.6s ease-out 0.2s both' }}>Welcome Back</h1>
            <p className="text-gray-600" style={{ animation: 'fade-in 0.6s ease-out 0.3s both' }}>Sign in to your library account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" style={{ animation: 'fade-in 0.6s ease-out 0.4s both' }}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" style={{ animation: 'slide-in-left 0.3s ease-out' }}>
                {error}
              </div>
            )}

            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Library Management System v1.0</p>
        </div>
      </div>
    </div>
  );
};
