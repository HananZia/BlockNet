// API Configuration
// Change BASE_URL when your backend is deployed
export const API_CONFIG = {
  BASE_URL: "https://eliz-discourseless-florine.ngrok-free.dev",
  API_PREFIX: '/api',
  TIMEOUT: 30000,
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${endpoint}`;
};

// API Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/profile',
  
  // Files
  FILES: '/files',
  FILE_UPLOAD: '/files/upload',
  FILE_VERIFY: '/files/verify',
  FILE_DOWNLOAD: '/files/download',
  
  // Sharing
   // Sharing
  SHARE_FILE: '/share/share',           // POST
  SHARED_WITH_ME: '/share/shared-with-me', 
  SHARED_BY_ME: '/share/shared-by-me',
  
  // Blockchain
  TRANSACTIONS: '/blockchain/transactions',
  TRANSACTION_DETAIL: '/blockchain/transaction',
  SEARCH_BLOCKCHAIN: '/blockchain/search',
  
  // Admin
  ADMIN_USERS :'/api/admin/users',
  ADMIN_STATS :'/api/admin/stats',
  ADMIN_FILES :'/api/admin/files',
  ADMIN_TRANSACTIONS :'/api/admin/transactions',
  ADMIN_TOGGLE_USER :'/api/admin/users/toggle/<int:user_id>',

  FILE_CERTIFICATE: '/api/files/certificate'

};
