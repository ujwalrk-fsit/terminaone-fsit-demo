import axios from 'axios';

export const MOCK_MODE = (import.meta.env.VITE_MOCK_MODE ?? 'true') !== 'false';
export const API_URL = import.meta.env.VITE_API_URL ?? 'https://placeholder.local/api';

// Central API client. Flip VITE_MOCK_MODE=false + VITE_API_URL to wire the
// future NestJS monolith with zero page rewrites (Phase 2).
// Gateway route map preserved: /api/users, /api/roles, /api/investor-portfolio,
// /api/indications, /api/fund-offerings, /api/opportunities,
// /api/documents, /api/signatures, /api/transfers, /api/cms,
// /api/notifications, /api/dashboard, /api/search
export const api = axios.create({ baseURL: API_URL, timeout: 8000 });

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tsg:unauthorized'));
    }
    return Promise.reject(err);
  },
);

export async function get<T>(path: string): Promise<T> {
  if (MOCK_MODE) throw new Error(`local-data mode: ${path} served from bundled sample data, not HTTP`);
  const { data } = await api.get<T>(path);
  return data;
}
