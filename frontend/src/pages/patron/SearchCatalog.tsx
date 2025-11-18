import React, { useState, useEffect } from 'react';
import { Search, Book, User as UserIcon } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { patronAPI } from '../../api/patron';
import type { Resource } from '../../types';

export const SearchCatalog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [borrowingId, setBorrowingId] = useState<number | null>(null);

  useEffect(() => {
    loadCatalog();
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

  const loadCatalog = async () => {
    setIsLoading(true);
    try {
      const data = await patronAPI.searchCatalog({});
      setResources(data);
      setFilteredResources(data);
    } catch (error) {
      console.error('Error loading catalog:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBorrow = async (resourceId: number) => {
    setBorrowingId(resourceId);
    try {
      await patronAPI.borrowResource(resourceId);
      alert('Book borrowed successfully!');
      loadCatalog();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to borrow book');
    } finally {
      setBorrowingId(null);
    }
  };

  const handleReserve = async (resourceId: number) => {
    try {
      await patronAPI.reserveResource(resourceId);
      alert('Book reserved successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to reserve book');
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Search Catalog</h1>
            <p className="text-gray-600 mt-1">Discover and borrow books from our collection</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource.resource_id} className="flex flex-col">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <Book className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                      {resource.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <UserIcon className="h-4 w-4 mr-1" />
                      {resource.author}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ISBN:</span>
                    <span className="font-medium">{resource.isbn}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{resource.resource_type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Year:</span>
                    <span className="font-medium">{resource.publication_year}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Genre:</span>
                    <span className="font-medium">{resource.genre}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available:</span>
                    <span
                      className={`font-semibold ${
                        resource.available_copies > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {resource.available_copies} / {resource.total_copies}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {resource.available_copies > 0 ? (
                    <Button
                      variant="primary"
                      onClick={() => handleBorrow(resource.resource_id)}
                      isLoading={borrowingId === resource.resource_id}
                      className="flex-1"
                    >
                      Borrow
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => handleReserve(resource.resource_id)}
                      className="flex-1"
                    >
                      Reserve
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredResources.length === 0 && (
          <div className="text-center py-12">
            <Book className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600">Try adjusting your search query</p>
          </div>
        )}
      </div>
    </Layout>
  );
};
