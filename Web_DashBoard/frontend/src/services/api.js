import { API_BASE_URL } from '../config';
const API_BASE = `${API_BASE_URL}/api`;

export const fetchDashboardSummary = async () => {
  try {
    const res = await fetch(`${API_BASE}/dashboard/summary`);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
};

export const fetchShipments = async () => {
  try {
    const res = await fetch(`${API_BASE}/shipments`);
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
};

export const fetchAlerts = async () => {
  try {
    const res = await fetch(`${API_BASE}/alerts`);
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
};

export const fetchLogbook = async (driverId) => {
  try {
    const res = await fetch(`${API_BASE}/logbook/${driverId}`);
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
};

export const fetchSensorData = async (deviceId) => {
  try {
    const res = await fetch(`${API_BASE}/sensors/${deviceId}`);
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
};

export const queueCommand = async (deviceId, command) => {
  try {
    const res = await fetch(`${API_BASE}/commands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, command })
    });
    return await res.json();
  } catch (error) {
    console.error("Queue command error:", error);
    return { success: false };
  }
};
