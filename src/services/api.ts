/**
 * Enterprise API Client for DairyOS
 * Connects frontend modules to Express + Prisma Backend
 */

const API_BASE_URL = '/api/v1';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('dairyos_auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('dairyos_auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('dairyos_auth_token');
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('dairyos_auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Fallback to response text
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Health Check
  async checkHealth() {
    return this.request<{ status: string; database: string }>('/health');
  }

  // Auth Endpoints
  auth = {
    login: async (email: string, password: string) => {
      const res = await this.request<{ success: boolean; token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.token) this.setToken(res.token);
      return res;
    },
    demoSwitch: async (role: string) => {
      const res = await this.request<{ success: boolean; token: string; user: any }>('/auth/demo-switch', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      if (res.token) this.setToken(res.token);
      return res;
    },
    getMe: async () => {
      return this.request<{ success: boolean; user: any }>('/auth/me');
    },
    logout: () => {
      this.clearToken();
    },
  };

  // Metrics Endpoint
  metrics = {
    getSummary: async () => {
      return this.request<{ success: boolean; data: any }>('/metrics/summary');
    },
  };

  // Farmers Endpoints
  farmers = {
    getAll: async (params?: { cluster?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.cluster) query.set('cluster', params.cluster);
      if (params?.search) query.set('search', params.search);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return this.request<{ success: boolean; count: number; data: any[] }>(`/farmers${qs}`);
    },
    create: async (farmer: any) => {
      return this.request<{ success: boolean; data: any }>('/farmers', {
        method: 'POST',
        body: JSON.stringify(farmer),
      });
    },
  };

  // Cattle Endpoints
  cattle = {
    getAll: async (params?: { shed?: string; status?: string }) => {
      const query = new URLSearchParams();
      if (params?.shed) query.set('shed', params.shed);
      if (params?.status) query.set('status', params.status);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return this.request<{ success: boolean; count: number; data: any[] }>(`/cattle${qs}`);
    },
    create: async (cow: any) => {
      return this.request<{ success: boolean; data: any }>('/cattle', {
        method: 'POST',
        body: JSON.stringify(cow),
      });
    },
  };

  // Milk Collections Endpoints
  collections = {
    getAll: async (params?: { date?: string; shift?: string }) => {
      const query = new URLSearchParams();
      if (params?.date) query.set('date', params.date);
      if (params?.shift) query.set('shift', params.shift);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return this.request<{ success: boolean; count: number; data: any[] }>(`/collections${qs}`);
    },
    create: async (collection: any) => {
      return this.request<{ success: boolean; data: any }>('/collections', {
        method: 'POST',
        body: JSON.stringify(collection),
      });
    },
  };

  // Quality Assurance Endpoints
  quality = {
    getAll: async () => {
      return this.request<{ success: boolean; count: number; data: any[] }>('/quality/tests');
    },
    create: async (test: any) => {
      return this.request<{ success: boolean; data: any }>('/quality/tests', {
        method: 'POST',
        body: JSON.stringify(test),
      });
    },
  };

  // Chilling & Silos Endpoints
  chilling = {
    getTanks: async () => {
      return this.request<{ success: boolean; data: any[] }>('/chilling/tanks');
    },
    transfer: async (tankId: string, litres: number, targetTankId: string) => {
      return this.request<{ success: boolean; message?: string; data: any }>(`/chilling/tanks/${tankId}/transfer`, {
        method: 'POST',
        body: JSON.stringify({ litres, targetTankId }),
      });
    },
    getReconciliation: async () => {
      return this.request<{ success: boolean; status: string; data: any }>('/chilling/reconciliation');
    },
  };

  // Processing Endpoints
  processing = {
    getBatches: async () => {
      return this.request<{ success: boolean; count: number; data: any[] }>('/processing/batches');
    },
    launchBatch: async (batchData: any) => {
      return this.request<{ success: boolean; data: any }>('/processing/batches', {
        method: 'POST',
        body: JSON.stringify(batchData),
      });
    },
  };

  // Sales Endpoints
  sales = {
    getOrders: async () => {
      return this.request<{ success: boolean; count: number; data: any[] }>('/sales/orders');
    },
    createOrder: async (orderData: any) => {
      return this.request<{ success: boolean; data: any }>('/sales/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    },
    getInvoice: async (orderId: string) => {
      return this.request<{ success: boolean; data: any }>(`/sales/orders/${orderId}/invoice`);
    },
    dispatch: async (orderId: string, details?: { vehicleNumber?: string; driverName?: string }) => {
      return this.request<{ success: boolean; data: any }>(`/sales/orders/${orderId}/dispatch`, {
        method: 'PATCH',
        body: JSON.stringify(details || {}),
      });
    },
  };

  // Payments Endpoints
  payments = {
    getAll: async () => {
      return this.request<{ success: boolean; count: number; data: any[] }>('/payments');
    },
    create: async (paymentData: any) => {
      return this.request<{ success: boolean; data: any }>('/payments', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
    },
    getPendingSummary: async () => {
      return this.request<{ success: boolean; data: any }>('/payments/pending-summary');
    },
    disburseAllPending: async () => {
      return this.request<{ success: boolean; message: string; disbursedCount: number; totalAmountDisbursed: number; disbursements: any[] }>('/payments/disburse-all-pending', {
        method: 'POST',
      });
    },
  };

  // Hardware IoT Endpoints
  iot = {
    getDevices: async () => {
      return this.request<{ success: boolean; devices: any[] }>('/iot/devices');
    },
    postLactoscan: async (data: any) => {
      return this.request<{ success: boolean; message: string; data: any }>('/iot/lactoscan', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    postSiloTelemetry: async (data: any) => {
      return this.request<{ success: boolean; message: string; data: any }>('/iot/silo-telemetry', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  };

  // Gemini AI Endpoints
  ai = {
    forecastProcurement: async (params?: { forecastHorizonHours?: number; expectedTempCelsius?: number }) => {
      return this.request<{ success: boolean; data: any }>('/ai/forecast-procurement', {
        method: 'POST',
        body: JSON.stringify(params || {}),
      });
    },
    optimizeFeed: async (params?: { targetYieldL?: number; breed?: string }) => {
      return this.request<{ success: boolean; data: any }>('/ai/optimize-feed', {
        method: 'POST',
        body: JSON.stringify(params || {}),
      });
    },
    analyzeAnomalies: async () => {
      return this.request<{ success: boolean; data: any }>('/ai/analyze-anomalies', {
        method: 'POST',
      });
    },
  };
}

export const api = new ApiService();
