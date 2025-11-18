import React, { useState, useEffect } from 'react';
import { BarChart3, BookOpen, Users, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { librarianAPI } from '../../api/librarian';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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

  const StatCard = ({
    title,
    value,
    icon: Icon,
    gradient,
    onClick,
    delay = 0
  }: any) => (
    <Card
      className={`${gradient} text-white cursor-pointer card-hover group relative overflow-hidden`}
      onClick={onClick}
      style={{ animation: `slide-up 0.5s ease-out ${delay}s both` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="bg-white/20 p-3 rounded-lg group-hover:bg-white/30 transition-all">
          <Icon className="h-8 w-8" />
        </div>
      </div>
      <ArrowRight className="absolute bottom-3 right-3 h-5 w-5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
    </Card>
  );

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
      <div className="space-y-6">
        <div style={{ animation: 'fade-in 0.6s ease-out' }}>
          <h1 className="text-3xl font-bold text-gray-900">Library Reports</h1>
          <p className="text-gray-600 mt-1">Overview of library statistics and analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Resources"
            value={reports?.total_resources || 0}
            icon={BookOpen}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            onClick={() => navigate('/librarian/resources')}
            delay={0}
          />

          <StatCard
            title="Total Users"
            value={reports?.total_users || 0}
            icon={Users}
            gradient="bg-gradient-to-br from-green-500 to-green-600"
            onClick={() => navigate('/librarian/users')}
            delay={0.1}
          />

          <StatCard
            title="Active Borrowings"
            value={reports?.active_borrowings || 0}
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
            onClick={() => navigate('/librarian/borrowings')}
            delay={0.2}
          />

          <StatCard
            title="Overdue Items"
            value={reports?.overdue_borrowings || 0}
            icon={Calendar}
            gradient="bg-gradient-to-br from-red-500 to-red-600"
            onClick={() => navigate('/librarian/overdue')}
            delay={0.3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ animation: 'fade-in 0.6s ease-out 0.4s both' }}>
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
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer card-hover"
                    style={{ animation: `slide-in-left 0.4s ease-out ${index * 0.1}s both` }}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full font-semibold text-sm">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{resource.title}</p>
                        <p className="text-sm text-gray-500 truncate">{resource.author}</p>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                        {resource.borrow_count || 0} borrows
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No borrowing data available yet</p>
                  <p className="text-sm text-gray-400 mt-1">Popular resources will appear here once users start borrowing</p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
            <div className="space-y-4">
              <div
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all cursor-pointer"
                style={{ animation: 'slide-in-right 0.4s ease-out 0.1s both' }}
              >
                <div>
                  <p className="text-sm text-gray-600">Total Borrowings</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {reports?.total_borrowings || 0}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div
                className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-all cursor-pointer"
                style={{ animation: 'slide-in-right 0.4s ease-out 0.2s both' }}
              >
                <div>
                  <p className="text-sm text-gray-600">Returned Items</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(reports?.total_borrowings || 0) - (reports?.active_borrowings || 0)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div
                className="flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all cursor-pointer"
                style={{ animation: 'slide-in-right 0.4s ease-out 0.3s both' }}
              >
                <div>
                  <p className="text-sm text-gray-600">Average Borrowing Duration</p>
                  <p className="text-2xl font-bold text-purple-600">14 days</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        <Card style={{ animation: 'fade-in 0.6s ease-out 0.5s both' }}>
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
                <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-900">All Resources</td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
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
