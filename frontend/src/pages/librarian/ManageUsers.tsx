import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { librarianAPI } from '../../api/librarian';
import type { User } from '../../types';

export const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Patron' as 'Patron' | 'Librarian',
    first_name: '',
    last_name: '',
    phone_number: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.first_name && user.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (user.last_name && user.last_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await librarianAPI.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await librarianAPI.manageUser(editingUser.user_id, formData);
        alert('User updated successfully!');
      } else {
        await librarianAPI.createUser(formData);
        alert('User created successfully!');
      }
      setShowModal(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone_number: user.phone_number || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await librarianAPI.deleteUser(id);
        alert('User deleted successfully!');
        loadUsers();
      } catch (error: any) {
        alert(error.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'Patron',
      first_name: '',
      last_name: '',
      phone_number: '',
    });
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
            <p className="text-gray-600 mt-1">Add, edit, and manage user accounts</p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add User
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
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
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phone_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'Librarian'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.user_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div
            className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    />
                    <Input
                      label="Last Name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                  </div>
                  <Input
                    label="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <Input
                    label="Phone Number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  />
                  {!editingUser && (
                    <Input
                      label="Password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value as 'Patron' | 'Librarian',
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                      <option value="Patron">Patron</option>
                      <option value="Librarian">Librarian</option>
                    </select>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <Button type="submit" variant="primary" className="flex-1">
                      {editingUser ? 'Update' : 'Create'} User
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
