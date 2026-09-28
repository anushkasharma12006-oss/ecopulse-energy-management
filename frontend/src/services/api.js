/**
 * API service for communicating with FastAPI backend
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = `HTTP Error ${response.status}`;
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      // ignore JSON parse fail
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

export const api = {
  // Health
  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    return handleResponse(res);
  },

  // Energy Overview & Time-series
  async getEnergySummary() {
    const res = await fetch(`${BASE_URL}/energy/summary`);
    return handleResponse(res);
  },

  async getEnergyTimeseries(hours = 24) {
    const res = await fetch(`${BASE_URL}/energy/timeseries?hours=${hours}`);
    return handleResponse(res);
  },

  async seedData(hours = 48) {
    const res = await fetch(`${BASE_URL}/energy/seed?hours=${hours}`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async resetData() {
    const res = await fetch(`${BASE_URL}/energy/reset`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Subsystem specific readings
  async getSolarReadings(limit = 25) {
    const res = await fetch(`${BASE_URL}/solar/readings?limit=${limit}`);
    return handleResponse(res);
  },

  async getWindReadings(limit = 25) {
    const res = await fetch(`${BASE_URL}/wind/readings?limit=${limit}`);
    return handleResponse(res);
  },

  async getBatteryReadings(limit = 25) {
    const res = await fetch(`${BASE_URL}/battery/readings?limit=${limit}`);
    return handleResponse(res);
  },

  async getConsumptionReadings(limit = 25) {
    const res = await fetch(`${BASE_URL}/consumption/readings?limit=${limit}`);
    return handleResponse(res);
  },

  async getGridReadings(limit = 25) {
    const res = await fetch(`${BASE_URL}/grid/readings?limit=${limit}`);
    return handleResponse(res);
  },

  // CSV Import
  async uploadCsv(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/import/csv`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async loadSampleCsv() {
    const res = await fetch(`${BASE_URL}/import/sample`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async getCsvTemplate() {
    const res = await fetch(`${BASE_URL}/import/template`);
    if (!res.ok) throw new Error("Failed to fetch template");
    return res.text();
  }
};
