import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './context/authStore';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Auth pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Patron pages
import { SearchCatalog } from './pages/patron/SearchCatalog';
import { BorrowedBooks } from './pages/patron/BorrowedBooks';
import { Notifications } from './pages/patron/Notifications';

// Librarian pages
import { ManageResources } from './pages/librarian/ManageResources';
import { ManageUsers } from './pages/librarian/ManageUsers';
import { Reports } from './pages/librarian/Reports';
import { Borrowings } from './pages/librarian/Borrowings';
import { Overdue } from './pages/librarian/Overdue';

function App() {
  const { initializeAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/login';
    if (user?.role === 'Director' || user?.role === 'Librarian') {
      return '/librarian/resources';
    }
    return '/patron/search';
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Patron routes */}
        <Route
          path="/patron/search"
          element={
            <ProtectedRoute allowedRoles={['Patron']}>
              <SearchCatalog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patron/borrowed"
          element={
            <ProtectedRoute allowedRoles={['Patron']}>
              <BorrowedBooks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patron/notifications"
          element={
            <ProtectedRoute allowedRoles={['Patron']}>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Librarian routes (Directors have all librarian permissions) */}
        <Route
          path="/librarian/resources"
          element={
            <ProtectedRoute allowedRoles={['Librarian', 'Director']}>
              <ManageResources />
            </ProtectedRoute>
          }
        />
        <Route
          path="/librarian/users"
          element={
            <ProtectedRoute allowedRoles={['Librarian', 'Director']}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/librarian/reports"
          element={
            <ProtectedRoute allowedRoles={['Librarian', 'Director']}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/librarian/borrowings"
          element={
            <ProtectedRoute allowedRoles={['Librarian', 'Director']}>
              <Borrowings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/librarian/overdue"
          element={
            <ProtectedRoute allowedRoles={['Librarian', 'Director']}>
              <Overdue />
            </ProtectedRoute>
          }
        />

        {/* Default route */}
        <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
        <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
