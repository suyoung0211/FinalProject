import { projectId, publicAnonKey } from './supabase/info.tsx';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c1775708`;

// Get access token from session storage
export function getAccessToken(): string | null {
  return sessionStorage.getItem('access_token');
}

// Set access token to session storage
export function setAccessToken(token: string) {
  sessionStorage.setItem('access_token', token);
}

// Clear access token
export function clearAccessToken() {
  sessionStorage.removeItem('access_token');
}

// Generic API call function
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const accessToken = getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken || publicAnonKey}`,
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authAPI = {
  signup: async (email: string, password: string, name: string) => {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },
};

// Pages API
export const pagesAPI = {
  list: async () => {
    return apiCall('/pages', { method: 'GET' });
  },
  
  create: async (data: { title: string; content?: string; template?: string; icon?: string }) => {
    return apiCall('/pages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  update: async (id: string, data: Partial<{ title: string; content: string; template: string; icon: string }>) => {
    return apiCall(`/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete: async (id: string) => {
    return apiCall(`/pages/${id}`, { method: 'DELETE' });
  },
  
  aiGenerate: async (prompt: string) => {
    return apiCall('/pages/ai-generate', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  },
};

// Study Logs API
export const studyLogsAPI = {
  list: async () => {
    return apiCall('/study-logs', { method: 'GET' });
  },
  
  create: async (data: { duration: number; notes?: string }) => {
    return apiCall('/study-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
