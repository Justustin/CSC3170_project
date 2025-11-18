export interface User {
  user_id: number;
  username: string;
  email: string;
  role: 'Librarian' | 'Patron';
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Resource {
  resource_id: number;
  title: string;
  author: string;
  isbn: string;
  publication_year: number;
  genre: string;
  total_copies: number;
  available_copies: number;
  resource_type: 'Book' | 'Journal';
  publisher?: string;
  description?: string;
}

export interface Borrowing {
  borrowing_id: number;
  user_id: number;
  resource_id: number;
  borrow_date: string;
  due_date: string;
  return_date?: string;
  renewals: number;
  status: 'Active' | 'Returned' | 'Overdue';
  resource?: Resource;
}

export interface Reservation {
  reservation_id: number;
  user_id: number;
  resource_id: number;
  reservation_date: string;
  status: 'Pending' | 'Fulfilled' | 'Cancelled';
  resource?: Resource;
}

export interface Notification {
  notification_id: number;
  user_id: number;
  message: string;
  date_sent: string;
  is_read: boolean;
}

export interface SearchParams {
  query?: string;
  type?: 'Book' | 'Journal' | 'All';
  genre?: string;
  author?: string;
}

export interface Report {
  total_resources: number;
  total_borrowings: number;
  active_borrowings: number;
  overdue_borrowings: number;
  total_users: number;
  popular_resources: Resource[];
}
