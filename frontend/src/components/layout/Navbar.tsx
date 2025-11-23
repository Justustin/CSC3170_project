import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, User, Bell } from 'lucide-react';
import { useAuthStore } from '../../context/authStore';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">LibraryMS</span>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            {user?.role === 'Patron' && (
              <>
                <Link
                  to="/patron/search"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Search Catalog
                </Link>
                <Link
                  to="/patron/borrowed"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  My Books
                </Link>
                <Link
                  to="/patron/notifications"
                  className="text-gray-700 hover:text-primary-600 relative"
                >
                  <Bell className="h-5 w-5" />
                </Link>
              </>
            )}

            {user?.role === 'Director' && (
              <>
                <Link
                  to="/director/dashboard"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/librarian/resources"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Resources
                </Link>
                <Link
                  to="/librarian/users"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Users
                </Link>
                <Link
                  to="/librarian/borrowings"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Borrowings
                </Link>
                <Link
                  to="/librarian/reports"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Reports
                </Link>
                <Link
                  to="/librarian/logs"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Logs
                </Link>
              </>
            )}

            {user?.role === 'Librarian' && (
              <>
                <Link
                  to="/librarian/resources"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Resources
                </Link>
                <Link
                  to="/librarian/users"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Users
                </Link>
                <Link
                  to="/librarian/borrowings"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Borrowings
                </Link>
                <Link
                  to="/librarian/reports"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Reports
                </Link>
                <Link
                  to="/librarian/logs"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Logs
                </Link>
              </>
            )}

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{user?.username}</span>
                <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
