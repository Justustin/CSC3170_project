import React, { useState, useEffect } from 'react';
import { AlertTriangle, User, BookOpen, Mail, Phone, Calendar } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import api from '../../api/axios';

interface OverdueBorrowing {
  borrowing_id: number;
  user_id: number;
  resource_id: number;
  borrow_date: string;
  due_date: string;
  renewals: number;
  days_overdue: number;
  users?: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  resources?: {
    title: string;
    author: string;
    isbn: string;
    resource_type: string;
  };
}

export const Overdue: React.FC = () => {
  const [overdueItems, setOverdueItems] = useState<OverdueBorrowing[]>([]);
  const [filteredItems, setFilteredItems] = useState<OverdueBorrowing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingNotification, setSendingNotification] = useState<number | null>(null);

  useEffect(() => {
    loadOverdueItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchTerm, overdueItems]);

  const loadOverdueItems = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/librarian/overdue');
      // Calculate days overdue for each item
      const itemsWithDays = data.map((item: any) => ({
        ...item,
        days_overdue: Math.floor((new Date().getTime() - new Date(item.due_date).getTime()) / (1000 * 60 * 60 * 24))
      }));
      setOverdueItems(itemsWithDays);
    } catch (error) {
      console.error('Error loading overdue items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = overdueItems;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.resources?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.users?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.users?.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const sendReminder = async (userId: number, borrowingId: number, userName: string, bookTitle: string) => {
    setSendingNotification(borrowingId);
    try {
      await api.post('/librarian/send-notification', {
        user_id: userId,
        message: `Reminder: "${bookTitle}" is overdue. Please return it as soon as possible to avoid late fees.`
      });
      alert(`Reminder sent to ${userName} successfully!`);
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send reminder. Please try again.');
    } finally {
      setSendingNotification(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSeverityColor = (daysOverdue: number) => {
    if (daysOverdue > 30) return 'text-red-700 bg-red-100 border-red-300';
    if (daysOverdue > 14) return 'text-orange-700 bg-orange-100 border-orange-300';
    return 'text-yellow-700 bg-yellow-100 border-yellow-300';
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

  const severeCases = overdueItems.filter(item => item.days_overdue > 30).length;
  const moderateCases = overdueItems.filter(item => item.days_overdue > 14 && item.days_overdue <= 30).length;
  const recentCases = overdueItems.filter(item => item.days_overdue <= 14).length;

  return (
    <Layout>
      <div className="space-y-6">
        <div style={{ animation: 'fade-in 0.6s ease-out' }}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Overdue Items</h1>
              <p className="text-gray-600 mt-1">Manage overdue borrowings and send reminders</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card
            className="bg-gradient-to-br from-red-500 to-red-600 text-white"
            style={{ animation: 'slide-up 0.5s ease-out' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Total Overdue</p>
                <p className="text-3xl font-bold mt-2">{overdueItems.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-200" />
            </div>
          </Card>

          <Card
            className="bg-gradient-to-br from-red-600 to-red-700 text-white"
            style={{ animation: 'slide-up 0.5s ease-out 0.1s both' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Severe (30+ days)</p>
                <p className="text-3xl font-bold mt-2">{severeCases}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-200" />
            </div>
          </Card>

          <Card
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white"
            style={{ animation: 'slide-up 0.5s ease-out 0.2s both' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Moderate (15-30 days)</p>
                <p className="text-3xl font-bold mt-2">{moderateCases}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-200" />
            </div>
          </Card>

          <Card
            className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white"
            style={{ animation: 'slide-up 0.5s ease-out 0.3s both' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Recent (1-14 days)</p>
                <p className="text-3xl font-bold mt-2">{recentCases}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-200" />
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card style={{ animation: 'fade-in 0.6s ease-out 0.4s both' }}>
          <Input
            type="text"
            placeholder="Search by book title, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </Card>

        {/* Overdue Items List */}
        <div className="space-y-4" style={{ animation: 'fade-in 0.6s ease-out 0.5s both' }}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <Card
                key={item.borrowing_id}
                className={`border-l-4 ${getSeverityColor(item.days_overdue).split(' ')[2]}`}
                style={{ animation: `slide-in-left 0.4s ease-out ${index * 0.05}s both` }}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Book Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-6 w-6 text-gray-400 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{item.resources?.title}</h3>
                        <p className="text-gray-600">{item.resources?.author}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            ISBN: {item.resources?.isbn}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            {item.resources?.resource_type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Borrower Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <User className="h-6 w-6 text-gray-400 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900">{item.users?.username}</h4>
                        <p className="text-sm text-gray-600">
                          {item.users?.first_name} {item.users?.last_name}
                        </p>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            {item.users?.email}
                          </div>
                          {item.users?.phone_number && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-4 w-4" />
                              {item.users?.phone_number}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Due Info & Actions */}
                  <div className="flex flex-col justify-between lg:w-64">
                    <div>
                      <div className={`px-3 py-2 rounded-lg ${getSeverityColor(item.days_overdue)}`}>
                        <p className="text-xs font-medium">OVERDUE</p>
                        <p className="text-2xl font-bold">{item.days_overdue} days</p>
                      </div>
                      <div className="mt-3 space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Borrowed:</span>
                          <span className="font-medium">{formatDate(item.borrow_date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Due:</span>
                          <span className="font-medium text-red-600">{formatDate(item.due_date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Renewals:</span>
                          <span className="font-medium">{item.renewals}/2</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      className="w-full mt-4"
                      onClick={() => sendReminder(
                        item.user_id,
                        item.borrowing_id,
                        item.users?.username || '',
                        item.resources?.title || ''
                      )}
                      isLoading={sendingNotification === item.borrowing_id}
                      disabled={sendingNotification !== null}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Reminder
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="py-12">
              <div className="text-center">
                <AlertTriangle className="h-16 w-16 text-green-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Overdue Items!</h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? 'No overdue items match your search'
                    : 'All books are returned on time or still within the borrowing period.'}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};
