import api from './api'; // assuming api.js has an axios instance with auth interceptor

export const driverPortalService = {
  getDashboard: async () => {
    const response = await api.get('/driver-portal/dashboard');
    return response.data;
  },
  getCurrentTrip: async () => {
    const response = await api.get('/driver-portal/trip');
    return response.data;
  },
  getLogbook: async () => {
    const response = await api.get('/driver-portal/logbook');
    return response.data;
  },
  getAlerts: async () => {
    const response = await api.get('/driver-portal/alerts');
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/driver-portal/profile');
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put('/driver-portal/profile', data);
    return response.data;
  },
  getNotifications: async () => {
    const response = await api.get('/driver-portal/notifications');
    return response.data;
  }
};
