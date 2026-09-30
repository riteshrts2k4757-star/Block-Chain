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

// ============================================================
// Integrity / Data Verification API
// ============================================================

export const fetchIntegrityStats = async () => {
  try {
    const res = await fetch(`${API_BASE}/integrity/stats`);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Fetch integrity stats error:", error);
    return null;
  }
};

export const fetchIntegrityBlocks = async (limit = 20, offset = 0, deviceId = 'CONT001') => {
  try {
    const res = await fetch(`${API_BASE}/integrity/blocks?limit=${limit}&offset=${offset}&deviceId=${deviceId}`);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Fetch integrity blocks error:", error);
    return [];
  }
};

export const verifyIntegrityChain = async (deviceId = 'CONT001') => {
  try {
    const res = await fetch(`${API_BASE}/integrity/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId })
    });
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Verify chain error:", error);
    return { verified: false, errors: [{ message: error.message }] };
  }
};

export const fetchRecoveryEvents = async () => {
  try {
    const res = await fetch(`${API_BASE}/integrity/recovery`);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Fetch recovery events error:", error);
    return [];
  }
};

export const resetIntegrityLogs = async (type = 'all') => {
  try {
    const res = await fetch(`${API_BASE}/integrity/reset`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    });
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Reset integrity logs error:", error);
    return { success: false, error: { message: error.message } };
  }
};

export const createDemoRecord = async (recordData) => {
  try {
    const res = await fetch(`${API_BASE}/integrity/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recordData)
    });
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Create demo record error:", error);
    return { success: false, error: { message: error.message } };
  }
};

