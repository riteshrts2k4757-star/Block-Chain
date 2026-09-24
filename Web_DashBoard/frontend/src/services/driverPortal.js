import { API_BASE_URL } from '../config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res) => {
  if (!res.ok) {
    let message = 'Network error';
    try {
      const errorData = await res.json();
      message = errorData.message || message;
    } catch (e) {}
    throw new Error(message);
  }
  return res.json();
};

export const driverPortalService = {
  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/api/driver-portal/dashboard`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  getCurrentTrip: async () => {
    const response = await fetch(`${API_BASE_URL}/api/driver-portal/trip`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  getLogbook: async () => {
    const response = await fetch(`${API_BASE_URL}/api/driver-portal/logbook`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  getAlerts: async () => {
    const response = await fetch(`${API_BASE_URL}/api/driver-portal/alerts`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/api/driver-portal/profile`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  updateProfile: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/driver-portal/profile`, { 
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  getNotifications: async () => {
    const response = await fetch(`${API_BASE_URL}/api/driver-portal/notifications`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  updateDutyStatus: async (status) => {
    const response = await fetch(`${API_BASE_URL}/api/driver-portal/status`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },
  updateTripStatus: async (tripId, status) => {
    const response = await fetch(`${API_BASE_URL}/api/driver-portal/trip/${tripId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },
  acknowledgeAlert: async (alertId) => {
    const response = await fetch(`${API_BASE_URL}/api/driver-portal/alerts/${alertId}/acknowledge`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};
