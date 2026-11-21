const API_BASE = '/api';

/**
 * Universal Fetch Client with Bearer token injection and error handling
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('fitsphere_token') || localStorage.getItem('fitcrowd_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  loginDemo: (role) =>
    request('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),
  socialLogin: (provider, role = 'client', details = {}) =>
    request('/auth/social-login', {
      method: 'POST',
      body: JSON.stringify({ provider, role, ...details }),
    }),
  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getMe: () => request('/auth/me'),

  // Crowd & Occupancy
  getLiveCrowd: () => request('/crowd/live'),
  getPredictedCrowd: (dayOfWeek, date) => {
    const params = new URLSearchParams();
    if (dayOfWeek !== undefined) params.append('dayOfWeek', dayOfWeek);
    if (date) params.append('date', date);
    return request(`/crowd/predicted?${params.toString()}`);
  },
  getRecommendation: (date, start, end) => {
    const params = new URLSearchParams({ date, start, end });
    return request(`/crowd/recommend?${params.toString()}`);
  },
  getMetrics: () => request('/crowd/metrics'),
  setStrategy: (strategy) =>
    request('/crowd/strategy', {
      method: 'POST',
      body: JSON.stringify({ strategy }),
    }),
  checkIn: (checkInType = 'MANUAL_APP') =>
    request('/crowd/check-in', {
      method: 'POST',
      body: JSON.stringify({ checkInType }),
    }),
  checkOut: () => request('/crowd/check-out', { method: 'POST' }),
  getMyStatus: () => request('/crowd/my-status'),
  getMyHistory: () => request('/crowd/my-history'),

  // Bookings
  getSlots: (date) => request(`/bookings/slots?date=${date}`),
  bookSlot: (slotId) =>
    request('/bookings/book', {
      method: 'POST',
      body: JSON.stringify({ slotId }),
    }),
  cancelBooking: (bookingId) =>
    request(`/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
    }),
  getMyBookings: () => request('/bookings/my-bookings'),

  // Admin
  getAnalytics: () => request('/admin/analytics'),
  updateCapacity: (maxCapacity) =>
    request('/admin/capacity', {
      method: 'PATCH',
      body: JSON.stringify({ maxCapacity }),
    }),
  listMembers: () => request('/admin/members'),
  listUsers: () => request('/admin/users'),
  updateUserStatus: (id, isActive) =>
    request(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),
  deleteUser: (id) =>
    request(`/admin/users/${id}`, {
      method: 'DELETE',
    }),
  createAnnouncement: (payload) =>
    request('/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getAnnouncements: () => request('/admin/announcements'),
  simulateSurge: () => request('/admin/simulator/surge', { method: 'POST' }),
  simulateReset: () => request('/admin/simulator/reset', { method: 'POST' }),

  // Shop & Orders
  getProducts: (params = {}) => {
    const q = new URLSearchParams();
    if (params.category && params.category !== 'all') q.append('category', params.category);
    if (params.search) q.append('search', params.search);
    if (params.sort) q.append('sort', params.sort);
    const qs = q.toString();
    return request(`/shop/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (id) => request(`/shop/products/${id}`),
  checkout: (payload) =>
    request('/shop/checkout', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getMyOrders: () => request('/shop/my-orders'),
  getOrder: (id) => request(`/shop/orders/${id}`),
};
