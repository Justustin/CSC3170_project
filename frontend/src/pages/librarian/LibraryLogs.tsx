import React, { useState, useEffect } from 'react';
import { FileText, Search } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { librarianAPI } from '../../api/librarian';

interface LogEntry {
  log_id: number;
  user_id: number;
  action: string;
  details: string;
  created_at: string;
  users?: {
    username: string;
  };
}

export const LibraryLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLogs(logs);
    } else {
      const filtered = logs.filter(
        (log) =>
          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.users?.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLogs(filtered);
    }
  }, [searchQuery, logs]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await librarianAPI.getLibraryLogs();
      setLogs(data);
      setFilteredLogs(data);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionColor = (action: string) => {
    if (action.toLowerCase().includes('delete')) return 'bg-red-100 text-red-800';
    if (action.toLowerCase().includes('create') || action.toLowerCase().includes('add')) return 'bg-green-100 text-green-800';
    if (action.toLowerCase().includes('update') || action.toLowerCase().includes('edit')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Library Logs</h1>
            <p className="text-gray-600 mt-1">View system activity and audit trail</p>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <FileText className="h-5 w-5" />
            <span>{filteredLogs.length} entries</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
            <p className="text-gray-500">System activity will appear here when actions are performed.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {log.users?.username || 'System'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};
