// User & Auth Types
export interface User {
  id: string;
  email: string;
  username: string;
  admin: boolean;
  created_at: string;
  role?: string;
  is_active?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// File Types
export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  hash: string;
  blockchain_tx?: string;
  uploaded_at: string;
  verified: boolean;
  owner_id: string;
  owner_name?: string;
}

export interface FileUploadResponse {
  file: FileItem;
  blockchain_hash: string;
  transaction_id: string;
}

export interface FileVerificationResult {
  verified: boolean;
  file?: FileItem;
  blockchain_hash?: string;
  timestamp?: string;
  block_number?: number;
}

// Sharing Types
export interface SharedFile {
  id: string;
  file: FileItem;   // file.name instead of file.name
  shared_by: User;
  shared_with: User;
  shared_at: string;
  expires_at?: string;
}

export interface ShareRequest {
  file_id: string;
  recipient_email: string;
  expires_at?: string;
}

// Blockchain Types
export interface BlockchainTransaction {
  id: string;
  hash: string;
  block_number: number;
  timestamp: string;
  file_hash: string;
  file_name?: string;
  owner_id: string;
  owner_name?: string;
  status: 'pending' | 'confirmed' | 'failed';
}

// Admin Types
export interface SystemStats {
  total_users: number;
  active_users: number;
  total_files: number;
  total_transactions: number;
  storage_used: number;
  recent_activity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'upload' | 'verify' | 'share' | 'login' | 'register';
  description: string;
  user_name?: string;
  timestamp: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
