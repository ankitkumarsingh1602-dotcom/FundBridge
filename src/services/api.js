const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('fundbridge_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API request failed');
  return data;
};

export const api = {
  register: (payload) =>
    fetch(`${API_URL}/auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) }).then(handleResponse),
  login: (payload) =>
    fetch(`${API_URL}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) }).then(handleResponse),
  getMe: () => fetch(`${API_URL}/auth/me`, { headers: getHeaders() }).then(handleResponse),
  updateProfile: (payload) =>
    fetch(`${API_URL}/auth/profile`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(payload) }).then(handleResponse),
  toggleWishlist: (campaignId) =>
    fetch(`${API_URL}/auth/wishlist/${campaignId}`, { method: 'POST', headers: getHeaders() }).then(handleResponse),

  getCampaigns: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_URL}/campaigns${query ? `?${query}` : ''}`, { headers: getHeaders() }).then(handleResponse);
  },
  getCampaignById: (id) => fetch(`${API_URL}/campaigns/${id}`, { headers: getHeaders() }).then(handleResponse),
  createCampaign: (payload) =>
    fetch(`${API_URL}/campaigns`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) }).then(handleResponse),
  updateCampaign: (id, payload) =>
    fetch(`${API_URL}/campaigns/${id}`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(payload) }).then(handleResponse),
  deleteCampaign: (id) =>
    fetch(`${API_URL}/campaigns/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  addExpense: (id, payload) =>
    fetch(`${API_URL}/campaigns/${id}/expenses`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) }).then(handleResponse),
  addMilestone: (id, payload) =>
    fetch(`${API_URL}/campaigns/${id}/milestones`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) }).then(handleResponse),
  updateMilestone: (id, milestoneId, status) =>
    fetch(`${API_URL}/campaigns/${id}/milestones/${milestoneId}`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ status }) }).then(handleResponse),
  addUpdate: (id, payload) =>
    fetch(`${API_URL}/campaigns/${id}/updates`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) }).then(handleResponse),
  askQuestion: (id, payload) =>
    fetch(`${API_URL}/campaigns/${id}/qa`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) }).then(handleResponse),
  answerQuestion: (id, qaId, answer) =>
    fetch(`${API_URL}/campaigns/${id}/qa/${qaId}`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ answer }) }).then(handleResponse),

  donate: (payload) =>
    fetch(`${API_URL}/donations`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) }).then(handleResponse),
  getMyDonations: () => fetch(`${API_URL}/donations/my`, { headers: getHeaders() }).then(handleResponse),

  getGroups: () => fetch(`${API_URL}/groups`, { headers: getHeaders() }).then(handleResponse),
  createGroup: (payload) =>
    fetch(`${API_URL}/groups`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) }).then(handleResponse),
  contributeGroup: (id, amount) =>
    fetch(`${API_URL}/groups/${id}/contribute`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ amount }) }).then(handleResponse),

  getNotifications: () => fetch(`${API_URL}/notifications`, { headers: getHeaders() }).then(handleResponse),
  markAllNotificationsRead: () =>
    fetch(`${API_URL}/notifications/read-all`, { method: 'PATCH', headers: getHeaders() }).then(handleResponse),

  getAdminOverview: () => fetch(`${API_URL}/admin/overview`, { headers: getHeaders() }).then(handleResponse),
  verifyCampaign: (id, payload) =>
    fetch(`${API_URL}/admin/campaigns/${id}/verify`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(payload) }).then(handleResponse),
};