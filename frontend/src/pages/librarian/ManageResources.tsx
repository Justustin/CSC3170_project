import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { librarianAPI } from '../../api/librarian';
import type { Resource } from '../../types';

export const ManageResources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publication_year: new Date().getFullYear(),
    genre: '',
    total_copies: 1,
    available_copies: 1,
    resource_type: 'Book' as 'Book' | 'Journal',
    publisher: '',
    description: '',
  });

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredResources(resources);
    } else {
      const filtered = resources.filter(
        (resource) =>
          resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.isbn.includes(searchQuery)
      );
      setFilteredResources(filtered);
    }
  }, [searchQuery, resources]);

  const loadResources = async () => {
    setIsLoading(true);
    try {
      const data = await librarianAPI.getResources();
      setResources(data);
      setFilteredResources(data);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingResource) {
        await librarianAPI.editResource(editingResource.resource_id, formData);
        alert('Resource updated successfully!');
      } else {
        await librarianAPI.addResource(formData);
        alert('Resource added successfully!');
      }
      setShowModal(false);
      resetForm();
      loadResources();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      author: resource.author,
      isbn: resource.isbn,
      publication_year: resource.publication_year,
      genre: resource.genre,
      total_copies: resource.total_copies,
      available_copies: resource.available_copies,
      resource_type: resource.resource_type,
      publisher: resource.publisher || '',
      description: resource.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await librarianAPI.deleteResource(id);
        alert('Resource deleted successfully!');
        loadResources();
      } catch (error: any) {
        alert(error.response?.data?.error || 'Failed to delete resource');
      }
    }
  };

  const resetForm = () => {
    setEditingResource(null);
    setFormData({
      title: '',
      author: '',
      isbn: '',
      publication_year: new Date().getFullYear(),
      genre: '',
      total_copies: 1,
      available_copies: 1,
      resource_type: 'Book',
      publisher: '',
      description: '',
    });
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Resources</h1>
            <p className="text-gray-600 mt-1">Add, edit, and manage library resources</p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Resource
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
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
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ISBN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Copies
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResources.map((resource) => (
                  <tr key={resource.resource_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{resource.title}</div>
                      <div className="text-sm text-gray-500">{resource.genre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {resource.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resource.isbn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {resource.resource_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {resource.available_copies} / {resource.total_copies}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(resource)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(resource.resource_id)}
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
                  {editingResource ? 'Edit Resource' : 'Add New Resource'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                  <Input
                    label="Author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="ISBN"
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                      required
                    />
                    <Input
                      label="Publication Year"
                      type="number"
                      value={formData.publication_year}
                      onChange={(e) =>
                        setFormData({ ...formData, publication_year: parseInt(e.target.value) })
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Genre"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Type
                      </label>
                      <select
                        value={formData.resource_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            resource_type: e.target.value as 'Book' | 'Journal',
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      >
                        <option value="Book">Book</option>
                        <option value="Journal">Journal</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Total Copies"
                      type="number"
                      min="1"
                      value={formData.total_copies}
                      onChange={(e) =>
                        setFormData({ ...formData, total_copies: parseInt(e.target.value) })
                      }
                      required
                    />
                    <Input
                      label="Available Copies"
                      type="number"
                      min="0"
                      value={formData.available_copies}
                      onChange={(e) =>
                        setFormData({ ...formData, available_copies: parseInt(e.target.value) })
                      }
                      required
                    />
                  </div>
                  <Input
                    label="Publisher"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <Button type="submit" variant="primary" className="flex-1">
                      {editingResource ? 'Update' : 'Add'} Resource
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
