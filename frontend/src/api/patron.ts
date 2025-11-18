import axiosInstance from './axios';
import type { Resource, Borrowing, Notification, SearchParams } from '../types';

export const patronAPI = {
  searchCatalog: async (params: SearchParams): Promise<Resource[]> => {
    const response = await axiosInstance.get('/patron/search', { params });
    return response.data;
  },

  borrowResource: async (resource_id: number) => {
    const response = await axiosInstance.post('/patron/borrow', { resource_id });
    return response.data;
  },

  reserveResource: async (resource_id: number) => {
    const response = await axiosInstance.post('/patron/reserve', { resource_id });
    return response.data;
  },

  getBorrowHistory: async (): Promise<Borrowing[]> => {
    const response = await axiosInstance.get('/patron/borrow-history');
    return response.data;
  },

  getBorrowedBooks: async (): Promise<Borrowing[]> => {
    const response = await axiosInstance.get('/patron/get-borrowed-books');
    return response.data;
  },

  renewBorrowing: async (borrowingId: number) => {
    const response = await axiosInstance.put(`/patron/renew-borrowing/${borrowingId}`);
    return response.data;
  },

  returnBorrowing: async (borrowingId: number) => {
    const response = await axiosInstance.put(`/patron/return-borrowing/${borrowingId}`);
    return response.data;
  },

  getNotifications: async (): Promise<Notification[]> => {
    const response = await axiosInstance.get('/patron/notifications');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await axiosInstance.put('/patron/update-profile', data);
    return response.data;
  },
};
