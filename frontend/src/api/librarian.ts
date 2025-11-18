import axiosInstance from './axios';
import type { Resource, User } from '../types';

export const librarianAPI = {
  // Resource management
  getResources: async (): Promise<Resource[]> => {
    const response = await axiosInstance.get('/librarian/get-resources');
    return response.data;
  },

  addResource: async (data: Partial<Resource>) => {
    const response = await axiosInstance.post('/librarian/add-resource', data);
    return response.data;
  },

  updateResource: async (id: number, data: Partial<Resource>) => {
    const response = await axiosInstance.put(`/librarian/update-resource/${id}`, data);
    return response.data;
  },

  editResource: async (id: number, data: Partial<Resource>) => {
    const response = await axiosInstance.put(`/librarian/edit-resource/${id}`, data);
    return response.data;
  },

  deleteResource: async (id: number) => {
    const response = await axiosInstance.delete(`/librarian/delete-resource/${id}`);
    return response.data;
  },

  // User management
  getAllUsers: async (): Promise<User[]> => {
    const response = await axiosInstance.get('/librarian/get-all-users');
    return response.data;
  },

  createUser: async (data: any) => {
    const response = await axiosInstance.post('/librarian/create-user', data);
    return response.data;
  },

  manageUser: async (id: number, data: any) => {
    const response = await axiosInstance.put(`/librarian/manage-user/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await axiosInstance.delete(`/librarian/delete-user/${id}`);
    return response.data;
  },

  // Borrowing management
  manageBorrowing: async (id: number, data: any) => {
    const response = await axiosInstance.put(`/librarian/manage-borrowing/${id}`, data);
    return response.data;
  },

  // Inventory and reports
  trackInventory: async () => {
    const response = await axiosInstance.get('/librarian/track-inventory');
    return response.data;
  },

  generateReports: async () => {
    const response = await axiosInstance.get('/librarian/generate-reports');
    return response.data;
  },

  // Notifications
  sendNotification: async (data: { user_id: number; message: string }) => {
    const response = await axiosInstance.post('/librarian/send-notification', data);
    return response.data;
  },

  // Reservations
  handleReservation: async (id: number, data: any) => {
    const response = await axiosInstance.put(`/librarian/handle-reservation/${id}`, data);
    return response.data;
  },
};
