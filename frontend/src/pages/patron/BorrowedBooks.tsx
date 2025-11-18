import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, RefreshCw, CheckCircle } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { patronAPI } from '../../api/patron';
import type { Borrowing } from '../../types';

export const BorrowedBooks: React.FC = () => {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [renewingId, setRenewingId] = useState<number | null>(null);
  const [returningId, setReturningId] = useState<number | null>(null);

  useEffect(() => {
    loadBorrowedBooks();
  }, []);

  const loadBorrowedBooks = async () => {
    setIsLoading(true);
    try {
      const data = await patronAPI.getBorrowedBooks();
      setBorrowings(data);
    } catch (error) {
      console.error('Error loading borrowed books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenew = async (borrowingId: number) => {
    setRenewingId(borrowingId);
    try {
      await patronAPI.renewBorrowing(borrowingId);
      alert('Book renewed successfully!');
      loadBorrowedBooks();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to renew book');
    } finally {
      setRenewingId(null);
    }
  };

  const handleReturn = async (borrowingId: number, title: string) => {
    if (!confirm(`Are you sure you want to return "${title}"?`)) {
      return;
    }

    setReturningId(borrowingId);
    try {
      await patronAPI.returnBorrowing(borrowingId);
      alert('Book returned successfully!');
      loadBorrowedBooks();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to return book');
    } finally {
      setReturningId(null);
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Borrowed Books</h1>
            <p className="text-gray-600 mt-1">Manage your active borrowings</p>
          </div>
          <Button variant="secondary" onClick={loadBorrowedBooks}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : borrowings.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No borrowed books</h3>
              <p className="text-gray-600">You haven't borrowed any books yet</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {borrowings.map((borrowing) => {
              const daysUntilDue = getDaysUntilDue(borrowing.due_date);
              const isOverdue = daysUntilDue < 0;
              const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 3;

              return (
                <Card key={borrowing.borrowing_id}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="bg-primary-100 p-3 rounded-lg">
                        <BookOpen className="h-8 w-8 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {borrowing.resource?.title || 'Unknown Title'}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          by {borrowing.resource?.author || 'Unknown Author'}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-gray-600">Borrowed Date</p>
                            <p className="font-medium flex items-center mt-1">
                              <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                              {formatDate(borrowing.borrow_date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Due Date</p>
                            <p
                              className={`font-medium flex items-center mt-1 ${
                                isOverdue
                                  ? 'text-red-600'
                                  : isDueSoon
                                  ? 'text-orange-600'
                                  : 'text-gray-900'
                              }`}
                            >
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(borrowing.due_date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Renewals</p>
                            <p className="font-medium mt-1">{borrowing.renewals} / 2</p>
                          </div>
                        </div>

                        {isOverdue && (
                          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            <p className="text-sm text-red-700 font-medium">
                              ⚠️ Overdue by {Math.abs(daysUntilDue)} day(s)
                            </p>
                          </div>
                        )}

                        {isDueSoon && !isOverdue && (
                          <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                            <p className="text-sm text-orange-700 font-medium">
                              ⏰ Due in {daysUntilDue} day(s)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      <Button
                        variant="primary"
                        onClick={() => handleReturn(borrowing.borrowing_id, borrowing.resource?.title || 'this book')}
                        isLoading={returningId === borrowing.borrowing_id}
                        disabled={renewingId !== null}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Return
                      </Button>
                      {borrowing.renewals < 2 && !isOverdue && (
                        <Button
                          variant="secondary"
                          onClick={() => handleRenew(borrowing.borrowing_id)}
                          isLoading={renewingId === borrowing.borrowing_id}
                          disabled={returningId !== null}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Renew
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};
