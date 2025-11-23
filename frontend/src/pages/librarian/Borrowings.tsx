import React, { useState, useEffect } from 'react';
import { Calendar, User, BookOpen, Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import api from '../../api/axios';

interface Borrowing {
  borrowing_id: number;
  user_id: number;
  resource_id: number;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  renewals: number;
  status: 'Active' | 'Returned' | 'Overdue';
  users?: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  resources?: {
    title: string;
    author: string;
    isbn: string;
  };
}

export const Borrowings: React.FC = () => {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [filteredBorrowings, setFilteredBorrowings] = useState<Borrowing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Returned' | 'Overdue'>('All');

  useEffect(() => {
    loadBorrowings();
  }, []);

  useEffect(() => {
    filterBorrowings();
  }, [searchTerm, statusFilter, borrowings]);

  const loadBorrowings = async () => {
    setIsLoading(true);
    try {
      // Fetch all borrowings with user and resource details
      const { data } = await api.get('/librarian/borrowings');
      setBorrowings(data);
    } catch (error) {
      console.error('Error loading borrowings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterBorrowings = () => {
    let filtered = borrowings;

    // Filter by status
    if (statusFilter !== 'All') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.resources?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.users?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.users?.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBorrowings(filtered);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      Active: 'bg-blue-100 text-blue-800',
      Returned: 'bg-green-100 text-green-800',
      Overdue: 'bg-red-100 text-red-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle className="h-4 w-4" />;
      case 'Returned': return <CheckCircle className="h-4 w-4" />;
      case 'Overdue': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const stats = {
    total: borrowings.length,
    active: borrowings.filter(b => b.status === 'Active').length,
    returned: borrowings.filter(b => b.status === 'Returned').length,
    overdue: borrowings.filter(b => b.status === 'Overdue').length
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div style={{ animation: 'fade-in 0.6s ease-out' }}>
          <h1 className="text-3xl font-bold text-gray-900">All Borrowings</h1>
          <p className="text-gray-600 mt-1">Manage and track all library borrowings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer card-hover"
            onClick={() => setStatusFilter('All')}
            style={{ animation: 'slide-up 0.5s ease-out' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Borrowings</p>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-200" />
            </div>
          </Card>

          <Card
            className="bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer card-hover"
            onClick={() => setStatusFilter('Active')}
            style={{ animation: 'slide-up 0.5s ease-out 0.1s both' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active</p>
                <p className="text-3xl font-bold mt-2">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </Card>

          <Card
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white cursor-pointer card-hover"
            onClick={() => setStatusFilter('Returned')}
            style={{ animation: 'slide-up 0.5s ease-out 0.2s both' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Returned</p>
                <p className="text-3xl font-bold mt-2">{stats.returned}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-200" />
            </div>
          </Card>

          <Card
            className="bg-gradient-to-br from-red-500 to-red-600 text-white cursor-pointer card-hover"
            onClick={() => setStatusFilter('Overdue')}
            style={{ animation: 'slide-up 0.5s ease-out 0.3s both' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Overdue</p>
                <p className="text-3xl font-bold mt-2">{stats.overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-200" />
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card style={{ animation: 'fade-in 0.6s ease-out 0.4s both' }}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by book title, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              {['All', 'Active', 'Returned', 'Overdue'].map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'primary' : 'secondary'}
                  onClick={() => setStatusFilter(status as any)}
                  className="whitespace-nowrap"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Borrowings Table */}
        <Card style={{ animation: 'fade-in 0.6s ease-out 0.5s both' }}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Book</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Borrower</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Borrow Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Due Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Return Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Renewals</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBorrowings.length > 0 ? (
                  filteredBorrowings.map((borrowing, index) => (
                    <tr
                      key={borrowing.borrowing_id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      style={{ animation: `fade-in 0.3s ease-out ${index * 0.05}s both` }}
                    >
                      <td className="py-3 px-4 text-sm text-gray-900">{borrowing.borrowing_id}</td>
                      <td className="py-3 px-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{borrowing.resources?.title}</p>
                          <p className="text-gray-500 text-xs">{borrowing.resources?.author}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{borrowing.users?.username}</p>
                          <p className="text-gray-500 text-xs">{borrowing.users?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{formatDate(borrowing.borrow_date)}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{formatDate(borrowing.due_date)}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {borrowing.return_date ? formatDate(borrowing.return_date) : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{borrowing.renewals}/2</td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(borrowing.status)}`}>
                          {getStatusIcon(borrowing.status)}
                          {borrowing.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No borrowings found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || statusFilter !== 'All'
                          ? 'Try adjusting your filters'
                          : 'Borrowings will appear here once users start borrowing books'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
