import React, { useState, useEffect } from 'react';
import { BarChart3, BookOpen, Users, TrendingUp, Calendar } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { librarianAPI } from '../../api/librarian';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await librarianAPI.generateReports();
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
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

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Library Reports</h1>
          <p className="text-gray-600 mt-1">Overview of library statistics and analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Resources</p>
                <p className="text-3xl font-bold mt-2">
                  {reports?.total_resources || 0}
                </p>
              </div>
              <div className="bg-blue-400 bg-opacity-30 p-3 rounded-lg">
                <BookOpen className="h-8 w-8" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold mt-2">
                  {reports?.total_users || 0}
                </p>
              </div>
              <div className="bg-green-400 bg-opacity-30 p-3 rounded-lg">
                <Users className="h-8 w-8" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Active Borrowings</p>
                <p className="text-3xl font-bold mt-2">
                  {reports?.active_borrowings || 0}
                </p>
              </div>
              <div className="bg-purple-400 bg-opacity-30 p-3 rounded-lg">
                <TrendingUp className="h-8 w-8" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Overdue Items</p>
                <p className="text-3xl font-bold mt-2">
                  {reports?.overdue_borrowings || 0}
                </p>
              </div>
              <div className="bg-red-400 bg-opacity-30 p-3 rounded-lg">
                <Calendar className="h-8 w-8" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Popular Resources</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {reports?.popular_resources && reports.popular_resources.length > 0 ? (
                reports.popular_resources.slice(0, 5).map((resource: any, index: number) => (
                  <div
                    key={resource.resource_id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full font-semibold text-sm">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{resource.title}</p>
                        <p className="text-sm text-gray-500">{resource.author}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {resource.borrow_count || 0} borrows
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No data available</p>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Borrowings</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {reports?.total_borrowings || 0}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Returned Items</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(reports?.total_borrowings || 0) - (reports?.active_borrowings || 0)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Average Borrowing Duration</p>
                  <p className="text-2xl font-bold text-purple-600">14 days</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Overview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Category
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                    Total Items
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                    Available
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                    Borrowed
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-900">Books</td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right">
                    {reports?.total_resources || 0}
                  </td>
                  <td className="py-3 px-4 text-sm text-green-600 text-right font-medium">
                    {reports?.available_resources || 0}
                  </td>
                  <td className="py-3 px-4 text-sm text-blue-600 text-right font-medium">
                    {reports?.active_borrowings || 0}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
