import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://93.127.199.146:3001/api";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

class ApiService {
  private async getAuthHeaders(isFormData: boolean = false) {
    const token = await AsyncStorage.getItem("accessToken");
    const headers: any = {};
    
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      const normalizedEndpoint = endpoint.startsWith("/")
        ? endpoint.slice(1)
        : endpoint;

      const response = await fetch(`${BASE_URL}/${normalizedEndpoint}`, {
        headers,
        ...options,
      });

      // Handle 304 Not Modified responses
      if (response.status === 304) {
        return {
          success: true,
          message: "Data not modified",
          data: null as T
        };
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        // If response is not JSON, show raw text
        const text = await response.text();
        throw new Error(`Non-JSON response: ${text}`);
      }

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry the request with new token
            const newHeaders = await this.getAuthHeaders();
            const retryResponse = await fetch(`${BASE_URL}/${normalizedEndpoint}`, {
              ...options,
              headers: newHeaders,
            });

            if (retryResponse.status === 304) {
              return {
                success: true,
                message: "Data not modified",
                data: null as T
              };
            }

            let retryData;
            try {
              retryData = await retryResponse.json();
            } catch (retryJsonErr) {
              const retryText = await retryResponse.text();
              throw new Error(`Non-JSON response: ${retryText}`);
            }
            if (!retryResponse.ok) {
              throw new Error(retryData.message || `API request failed: ${retryResponse.status} ${retryResponse.statusText}`);
            }
            return retryData;
          }
        }
        throw new Error(data.message || `API request failed: ${response.status} ${response.statusText}`);
      }

      return data;
    } catch (error: any) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!refreshToken) return false;

      const response = await fetch(`${BASE_URL}/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem("accessToken", data.data.accessToken);
        await AsyncStorage.setItem("refreshToken", data.data.refreshToken);
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
    sortOrder?: "asc" | "desc";
    category?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    if (params?.category) queryParams.append("category", params.category);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return this.request(`getitemdata${query}`);
  }

  async getItemById(id: string) {
    return this.request(`getitem/${id}`);
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
    return this.request("senditemdata", {
      method: "POST",
      body: JSON.stringify(item),
    });
  }

  async deleteItem(id: string) {
    return this.request(`deleteitem/${id}`, {
      method: "DELETE",
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
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.minWeight)
      queryParams.append("minWeight", params.minWeight.toString());
    if (params?.maxWeight)
      queryParams.append("maxWeight", params.maxWeight.toString());

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return this.request(`getboxes${query}`);
  }

  async addBox(box: {
    box_name: string;
    length: number;
    breadth: number;
    height: number;
    quantity: number;
    max_weight: number;
  }) {
    return this.request("addbox", {
      method: "POST",
      body: JSON.stringify(box),
    });
  }

  async updateBoxQuantity(box_name: string, additionalQuantity: number) {
    return this.request("updateboxquantity", {
      method: "POST",
      body: JSON.stringify({ box_name, additionalQuantity }),
    });
  }

  async deleteBox(id: string) {
    return this.request(`deletebox/${id}`, {
      method: "DELETE",
    });
  }

  async removeBoxItem(data: {
    boxId: string;
    itemId: string;
    boxQuantity: number;
    itemQuantity: number;
  }) {
    return this.request("removeboxitem", {
      method: "POST",
      body: JSON.stringify(data),
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
    cartons: {
      length: number;
      breadth: number;
      height: number;
      maxWeight: number;
    }[];
  }) {
    return this.request("optimal-packing2", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Add this method for POST /api/optimal-packing2
  /**
   * Call POST /api/optimal-packing2 with productId and quantity.
   * @param data { productId: string; quantity: number }
   */
  async optimalPacking2(data: { productId: string; quantity: number }) {
    return this.request("optimal-packing2", {
      method: "POST",
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
    return this.request("calculate-shipping", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getCartonSizes() {
    return this.request("carton-sizes");
  }

  // Packing Data Management
  async sendPackagingData(data: {
    productName: string;
    shape: string;
    weight: number;
    quantity: number;
    price: number;
  }) {
    return this.request("sendPackagingData", {
      method: "POST",
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
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.productName)
      queryParams.append("productName", params.productName);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return this.request(`getPackagingData${query}`);
  }

  async getPackagingStatistics() {
    return this.request("packaging-statistics");
  }

  async deletePackagingData(id: string) {
    return this.request(`deletePackaging/${id}`, {
      method: "DELETE",
    });
  }

  // AI Integration
  async predictDimensionsWithDetails(
    imageUri: string,
    referenceObject?: string,
    unit?: string,
    additionalContext?: string
  ) {
    try {
      const formData = new FormData();
      
      // Create proper file object for React Native
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      // For React Native, we need to append the file with proper metadata
      formData.append("image", {
        uri: imageUri,
        type: type,
        name: filename,
      } as any);
      
      if (referenceObject) formData.append("referenceObject", referenceObject);
      if (unit) formData.append("unit", unit);
      if (additionalContext) formData.append("additionalContext", additionalContext);

      const token = await AsyncStorage.getItem("accessToken");
      const headers: any = {
        'Accept': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      // Don't set Content-Type for FormData - let fetch handle it

      console.log('Making request to:', `${BASE_URL}/ai/predict-dimensions`);
      console.log('FormData contents:', { imageUri, referenceObject, unit, additionalContext });

      const response = await fetch(`${BASE_URL}/ai/predict-dimensions`, {
        method: "POST",
        headers,
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Handle 304 Not Modified responses
      if (response.status === 304) {
        return {
          success: true,
          message: "Data not modified",
          data: null
        };
      }

      let data;
      try {
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        data = JSON.parse(responseText);
      } catch (jsonErr) {
        console.error('JSON parsing error:', jsonErr);
        throw new Error(`Invalid JSON response from server`);
      }

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry the request with new token
            const newToken = await AsyncStorage.getItem("accessToken");
            const retryHeaders: any = {
              'Accept': 'application/json',
            };
            if (newToken) {
              retryHeaders.Authorization = `Bearer ${newToken}`;
            }
            
            const retryResponse = await fetch(`${BASE_URL}/ai/predict-dimensions`, {
              method: "POST",
              headers: retryHeaders,
              body: formData,
            });

            if (retryResponse.status === 304) {
              return {
                success: true,
                message: "Data not modified",
                data: null
              };
            }

            let retryData;
            try {
              const retryText = await retryResponse.text();
              retryData = JSON.parse(retryText);
            } catch (retryJsonErr) {
              throw new Error(`Invalid JSON response from server on retry`);
            }
            
            if (!retryResponse.ok) {
              throw new Error(retryData.message || `API request failed: ${retryResponse.status} ${retryResponse.statusText}`);
            }
            return retryData;
          }
        }
        throw new Error(data.message || `API request failed: ${response.status} ${response.statusText}`);
      }

      return data;
    } catch (error: any) {
      console.error('AI Prediction Error:', error);
      
      // Provide more specific error messages
      if (error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection and ensure the server is running.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Request timed out. Please try again.');
      } else if (error.message.includes('JSON')) {
        throw new Error('Server returned invalid response. Please try again.');
      }
      
      throw error;
    }
  }

  async getPredictionHistory(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return this.request(`ai/prediction-history${query}`);
  }

  // User Management
  async updateUserProfile(userData: {
    name?: string;
    phone?: string;
    company?: string;
    address?: string;
    profileImage?: string;
  }) {
    return this.request("user/update", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async getUserProfile() {
    return this.request("user/profile");
  }
  async updateBox(
    id: string,
    boxUpdate: Partial<{
      box_name: string;
      length: number;
      breadth: number;
      height: number;
      quantity: number;
      max_weight: number;
    }>
  ) {
    return this.request("updatebox", {
      method: "PUT",
      body: JSON.stringify({ id, ...boxUpdate }),
    });
  }

}

export const apiService = new ApiService();
