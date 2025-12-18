import { getApiUrl } from '@/config/api';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('blocknet_token');
  }

  private getHeaders(isFormData: boolean = false): HeadersInit {
    const headers: HeadersInit = {};
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData) headers['Content-Type'] = 'application/json';
    return headers;
  }

  // ----------------------
  // Generic GET
  // ----------------------
  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(getApiUrl(endpoint), {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  // ----------------------
  // Generic POST
  // ----------------------
  async post<T>(endpoint: string, data?: any, isFormData: boolean = false): Promise<T> {
    const body = isFormData ? data : JSON.stringify(data || {});
    const res = await fetch(getApiUrl(endpoint), {
      method: 'POST',
      headers: this.getHeaders(isFormData),
      body,
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  // ----------------------
  // Generic DELETE
  // ----------------------
  async delete<T>(endpoint: string): Promise<T> {
    const res = await fetch(getApiUrl(endpoint), {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  // ----------------------
  // FILE UPLOAD
  // ----------------------
  async uploadFile(
    endpoint: string,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', getApiUrl(endpoint), true);

      const token = this.getToken();
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (err) {
            reject(new Error('Failed to parse server response'));
          }
        } else {
          reject(new Error(xhr.responseText || 'Upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during file upload'));
      xhr.send(formData);
    });
  }

  // ----------------------
  // ADMIN API ENDPOINTS
  // ----------------------
  async getUsers() {
    return this.get('/api/admin/users');
  }

  async toggleUserStatus(userId: number) {
    return this.post(`/admin/users/toggle/${userId}`);
  }

  async deleteUser(userId: number) {
    return this.delete(`/admin/users/delete/${userId}`);
  }

  async getFiles() {
    return this.get('/api/admin/files');
  }

  async deleteFile(fileId: number) {
    return this.delete(`/api/admin/files/delete/${fileId}`);
  }

  async getStats() {
    return this.get('/admin/stats');
  }
}

export const api = new ApiService();
