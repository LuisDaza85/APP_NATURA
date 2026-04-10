// src/api/services/producer.service.js
// Servicio para datos del productor

import api from '../axios.config';

export const producerService = {
  // ============================================
  // OBTENER PERFIL DEL PRODUCTOR
  // ============================================
  getProfile: async () => {
    try {
      const response = await api.get('/producer/profile');
      const data = response.data.data || response.data;
      return { success: true, data };
    } catch (error) {
      console.log('Error obteniendo perfil:', error);
      return { success: false, error: error.message };
    }
  },

  // ============================================
  // ACTUALIZAR PERFIL
  // ============================================
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/producer/profile', profileData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============================================
  // OBTENER ESTADÍSTICAS GENERALES
  // ============================================
  getStats: async () => {
    try {
      const response = await api.get('/producer/stats');
      const data = response.data.data || response.data;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============================================
  // OBTENER DASHBOARD DATA
  // ============================================
  getDashboardData: async () => {
    try {
      const response = await api.get('/producer/dashboard');
      const data = response.data.data || response.data;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============================================
  // OBTENER PRODUCTOS
  // ============================================
  getProducts: async () => {
    try {
      const response = await api.get('/products/my-products');
      const data = response.data.data || response.data;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============================================
  // CREAR PRODUCTO
  // ============================================
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============================================
  // ACTUALIZAR PRODUCTO
  // ============================================
  updateProduct: async (productId, productData) => {
    try {
      const response = await api.put(`/products/${productId}`, productData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============================================
  // ELIMINAR PRODUCTO
  // ============================================
  deleteProduct: async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============================================
  // OBTENER NOTIFICACIONES
  // ============================================
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      const data = response.data.data || response.data;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============================================
  // MARCAR NOTIFICACIÓN COMO LEÍDA
  // ============================================
  markNotificationAsRead: async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============================================
  // OBTENER VENTAS
  // ============================================
  getSales: async (params = {}) => {
    try {
      const response = await api.get('/producer/sales', { params });
      const data = response.data.data || response.data;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default producerService;
