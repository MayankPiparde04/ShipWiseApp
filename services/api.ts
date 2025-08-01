import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.29.177:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

class ApiService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers,
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry the request with new token
            const newHeaders = await this.getAuthHeaders();
            const retryResponse = await fetch(`${BASE_URL}${endpoint}`, {
              ...options,
              headers: newHeaders,
            });
            return await retryResponse.json();
          }
        }
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await fetch(`${BASE_URL}/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem('accessToken', data.data.accessToken);
        await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Item Management
  async getItems(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/getitemdata${query}`);
  }

  async getItemById(id: string) {
    return this.request(`/getitem/${id}`);
  }

  async addOrUpdateItem(item: {
    productName: string;
    quantity: number;
    weight: number;
    price: number;
    dimensions: {
      length: number;
      breadth: number;
      height: number;
    };
    category?: string;
    brand?: string;
  }) {
    return this.request('/senditemdata', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async deleteItem(id: string) {
    return this.request(`/deleteitem/${id}`, {
      method: 'DELETE',
    });
  }

  // Box Management
  async getBoxes(params?: {
    page?: number;
    limit?: number;
    search?: string;
    minWeight?: number;
    maxWeight?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.minWeight) queryParams.append('minWeight', params.minWeight.toString());
    if (params?.maxWeight) queryParams.append('maxWeight', params.maxWeight.toString());

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/getboxes${query}`);
  }

  async addBox(box: {
    boxName: string;
    length: number;
    breadth: number;
    height: number;
    quantity: number;
    max_weight: number;
  }) {
    return this.request('/addbox', {
      method: 'POST',
      body: JSON.stringify(box),
    });
  }

  async updateBoxQuantity(boxName: string, additionalQuantity: number) {
    return this.request('/updateboxquantity', {
      method: 'POST',
      body: JSON.stringify({ boxName, additionalQuantity }),
    });
  }

  async deleteBox(id: string) {
    return this.request(`/deletebox/${id}`, {
      method: 'DELETE',
    });
  }

  // Packing & Shipping
  async calculateOptimalPacking(data: {
    product: {
      length: number;
      breadth: number;
      height: number;
      weight: number;
      quantity: number;
    };
    cartons: Array<{
      length: number;
      breadth: number;
      height: number;
      maxWeight: number;
    }>;
  }) {
    return this.request('/optimal-packing2', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async calculateShipping(data: {
    shape: string;
    dimensions: any;
    unit: string;
    weight: number;
    weightUnit: string;
    quantity: number;
    preferences?: {
      optimizeFor: string;
    };
  }) {
    return this.request('/calculate-shipping', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCartonSizes() {
    return this.request('/carton-sizes');
  }

  // Packing Data Management
  async sendPackagingData(data: {
    productName: string;
    shape: string;
    weight: number;
    quantity: number;
    price: number;
  }) {
    return this.request('/sendPackagingData', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPackagingData(params?: {
    page?: number;
    limit?: number;
    productName?: string;
    sortBy?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.productName) queryParams.append('productName', params.productName);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/getPackagingData${query}`);
  }

  async getPackagingStatistics() {
    return this.request('/packaging-statistics');
  }

  async deletePackagingData(id: string) {
    return this.request(`/deletePackaging/${id}`, {
      method: 'DELETE',
    });
  }

  // AI Integration
  async predictDimensions(
    imageUri: string,
    referenceObject?: string,
    unit?: string,
    additionalContext?: string
  ) {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    } as any);
    
    if (referenceObject) formData.append('referenceObject', referenceObject);
    if (unit) formData.append('unit', unit);
    if (additionalContext) formData.append('additionalContext', additionalContext);

    const token = await AsyncStorage.getItem('accessToken');
    try {
      const response = await fetch(`${BASE_URL}/ai/predict-dimensions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Prediction failed');
      }
      return data;
    } catch (error) {
      console.error('AI Predict Dimensions Error:', error);
      throw error;
    }
  }

  async getPredictionHistory(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/ai/prediction-history${query}`);
  }
}

export const apiService = new ApiService();
