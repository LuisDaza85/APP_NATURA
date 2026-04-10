// src/contexts/NotificationContext.jsx
// Contexto para notificaciones push

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { authService } from '../api/services';
import { NOTIFICATION_CHANNELS } from '../constants/config';

// Configurar comportamiento de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Registrar para notificaciones push
    registerForPushNotifications();

    // Listener para notificaciones recibidas (app en primer plano)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notificación recibida:', notification);
      handleNotificationReceived(notification);
    });

    // Listener para cuando el usuario toca la notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notificación tocada:', response);
      handleNotificationResponse(response);
    });

    // Limpiar listeners
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // ============================================
  // REGISTRAR PARA PUSH NOTIFICATIONS
  // ============================================
  const registerForPushNotifications = async () => {
    try {
      if (!Device.isDevice) {
        console.log('⚠️ Push notifications solo funcionan en dispositivos físicos');
        return;
      }

      // Verificar permisos
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Permiso de notificaciones denegado');
        return;
      }

      // Configurar canales de Android
      if (Platform.OS === 'android') {
        await setupAndroidChannels();
      }

      // Obtener token de Expo Push
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;
      console.log('📱 Expo Push Token:', token);
      
      setExpoPushToken(token);

      // Registrar token en el servidor
      await authService.registerPushToken(token);

    } catch (error) {
      console.log('❌ Error registrando push notifications:', error);
    }
  };

  // ============================================
  // CONFIGURAR CANALES DE ANDROID
  // ============================================
  const setupAndroidChannels = async () => {
    // Canal de alertas críticas
    await Notifications.setNotificationChannelAsync('alerts', {
      name: NOTIFICATION_CHANNELS.alerts.name,
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: NOTIFICATION_CHANNELS.alerts.vibrationPattern,
      lightColor: '#ef4444',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
    });

    // Canal de pedidos
    await Notifications.setNotificationChannelAsync('orders', {
      name: NOTIFICATION_CHANNELS.orders.name,
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: NOTIFICATION_CHANNELS.orders.vibrationPattern,
      lightColor: '#3b82f6',
    });

    // Canal general
    await Notifications.setNotificationChannelAsync('default', {
      name: NOTIFICATION_CHANNELS.default.name,
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  };

  // ============================================
  // MANEJAR NOTIFICACIÓN RECIBIDA
  // ============================================
  const handleNotificationReceived = (notification) => {
    const newNotification = {
      id: notification.request.identifier,
      title: notification.request.content.title,
      body: notification.request.content.body,
      data: notification.request.content.data,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  // ============================================
  // MANEJAR RESPUESTA A NOTIFICACIÓN
  // ============================================
  const handleNotificationResponse = (response) => {
    const data = response.notification.request.content.data;
    
    // Aquí puedes manejar la navegación según el tipo de notificación
    if (data?.type === 'sensor_alert') {
      // Navegar a sensores
    } else if (data?.type === 'new_order') {
      // Navegar a pedidos
    }
  };

  // ============================================
  // ENVIAR NOTIFICACIÓN LOCAL
  // ============================================
  const sendLocalNotification = async (title, body, data = {}, channel = 'default') => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Inmediatamente
    });
  };

  // ============================================
  // MARCAR COMO LEÍDA
  // ============================================
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // ============================================
  // MARCAR TODAS COMO LEÍDAS
  // ============================================
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // ============================================
  // LIMPIAR NOTIFICACIONES
  // ============================================
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // ============================================
  // VALORES DEL CONTEXTO
  // ============================================
  const value = {
    expoPushToken,
    notifications,
    unreadCount,
    sendLocalNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook personalizado
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return context;
};

export default NotificationContext;
