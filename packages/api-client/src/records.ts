import { apiClient } from './client';

export const recordsApi = {
  getMedications: async (): Promise<{ medications: any[] }> => {
    const response = await apiClient.get('/records/medications');
    return response.data;
  },

  getConditions: async (): Promise<{ conditions: any[] }> => {
    const response = await apiClient.get('/records/conditions');
    return response.data;
  },

  getDocuments: async (params?: { documentType?: string; limit?: number }): Promise<{ 
    documents: any[]; 
    total: number 
  }> => {
    const response = await apiClient.get('/records/documents', { params });
    return response.data;
  },

  getDocument: async (id: string): Promise<{ id: string; downloadUrl: string }> => {
    const response = await apiClient.get(`/records/documents/${id}`);
    return response.data;
  },

  getAllergies: async (): Promise<{ allergies: any[] }> => {
    const response = await apiClient.get('/records/allergies');
    return response.data;
  },

  getRecommendations: async (): Promise<{ recommendations: any[] }> => {
    const response = await apiClient.get('/records/recommendations');
    return response.data;
  },
};
