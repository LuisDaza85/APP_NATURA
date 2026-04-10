// src/hooks/useLagunas.js
// Hook para monitoreo de laguna con polling HTTP

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  subscribeToLaguna,
  toggleBomba,
  SENSOR_THRESHOLDS,
  AUTOMATION_RULES
} from '../config/firebase';
import { useNotifications } from '../contexts/NotificationContext';

// ============================================
// CONFIGURACIÓN
// ============================================
const LAGUNA_ID = 'laguna';
const NOTIFICATION_COOLDOWN = 5 * 60 * 1000; // 5 minutos

// ============================================
// HOOK PRINCIPAL
// ============================================
export const useLagunas = () => {
  const [laguna, setLaguna] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  const { sendLocalNotification } = useNotifications();
  
  const notificationCooldownRef = useRef(new Map());
  const sendNotificationRef = useRef(sendLocalNotification);
  const mountedRef = useRef(true);

  useEffect(() => {
    sendNotificationRef.current = sendLocalNotification;
  }, [sendLocalNotification]);

  // ============================================
  // VERIFICAR COOLDOWN
  // ============================================
  const canSendNotification = useCallback((alertKey) => {
    const lastSent = notificationCooldownRef.current.get(alertKey);
    const now = Date.now();
    
    if (!lastSent || (now - lastSent) > NOTIFICATION_COOLDOWN) {
      notificationCooldownRef.current.set(alertKey, now);
      return true;
    }
    return false;
  }, []);

  // ============================================
  // PROCESAR DATOS DE LA LAGUNA
  // ============================================
  const processLagunaData = useCallback((data) => {
    if (!data) return null;

    const sensors = [];
    const lagunaAlerts = [];

    // TEMPERATURA
    if (data.temperatura !== undefined) {
      const temp = parseFloat(data.temperatura);
      const threshold = SENSOR_THRESHOLDS.temperatura;
      
      let status = 'normal';
      let alertMessage = null;

      if (temp >= 36) {
        status = 'critical';
        alertMessage = `¡Temperatura crítica! ${temp.toFixed(1)}°C`;
      } else if (temp > threshold.max) {
        status = 'warning';
        alertMessage = `Temperatura alta: ${temp.toFixed(1)}°C`;
      } else if (temp < threshold.min) {
        status = 'warning';
        alertMessage = `Temperatura baja: ${temp.toFixed(1)}°C`;
      }

      if (alertMessage) {
        lagunaAlerts.push({
          id: `${LAGUNA_ID}-temperatura-${status}`,
          lagunaId: LAGUNA_ID,
          type: 'temperatura',
          status,
          message: alertMessage,
          value: temp,
        });
      }

      sensors.push({
        id: 'temperatura',
        type: 'temperatura',
        label: threshold.label,
        value: temp.toFixed(1),
        unit: threshold.unit,
        icon: threshold.icon,
        color: threshold.color,
        status,
        minValue: threshold.min,
        maxValue: threshold.max,
      });
    }

    // pH
    if (data.ph !== undefined) {
      const ph = parseFloat(data.ph);
      const threshold = SENSOR_THRESHOLDS.ph;
      
      let status = 'normal';
      let alertMessage = null;

      if (ph < threshold.critical_min || ph > threshold.critical_max) {
        status = 'critical';
        alertMessage = `pH crítico: ${ph.toFixed(2)}`;
      } else if (ph < threshold.min || ph > threshold.max) {
        status = 'warning';
        alertMessage = `pH fuera de rango: ${ph.toFixed(2)}`;
      }

      if (alertMessage) {
        lagunaAlerts.push({
          id: `${LAGUNA_ID}-ph-${status}`,
          lagunaId: LAGUNA_ID,
          type: 'ph',
          status,
          message: alertMessage,
          value: ph,
        });
      }

      sensors.push({
        id: 'ph',
        type: 'ph',
        label: threshold.label,
        value: ph.toFixed(2),
        unit: threshold.unit,
        icon: threshold.icon,
        color: threshold.color,
        status,
        minValue: threshold.min,
        maxValue: threshold.max,
      });
    }

    // TURBIDEZ
    if (data.turbidez !== undefined) {
      const turb = parseFloat(data.turbidez);
      const threshold = SENSOR_THRESHOLDS.turbidez;
      
      let status = 'normal';
      let alertMessage = null;

      if (turb > threshold.critical) {
        status = 'critical';
        alertMessage = `Turbidez muy alta: ${turb.toFixed(0)} NTU`;
      } else if (turb > threshold.max) {
        status = 'warning';
        alertMessage = `Turbidez alta: ${turb.toFixed(0)} NTU`;
      }

      if (alertMessage) {
        lagunaAlerts.push({
          id: `${LAGUNA_ID}-turbidez-${status}`,
          lagunaId: LAGUNA_ID,
          type: 'turbidez',
          status,
          message: alertMessage,
          value: turb,
        });
      }

      sensors.push({
        id: 'turbidez',
        type: 'turbidez',
        label: threshold.label,
        value: turb.toFixed(0),
        unit: threshold.unit,
        icon: threshold.icon,
        color: threshold.color,
        status,
        minValue: threshold.min,
        maxValue: threshold.max,
      });
    }

    // NIVEL DE AGUA
    if (data.nivel !== undefined) {
      const nivelOk = data.nivel === true || data.nivel === 1;
      sensors.push({
        id: 'nivel',
        type: 'nivel',
        label: SENSOR_THRESHOLDS.nivel.label,
        value: nivelOk ? 'OK' : 'BAJO',
        unit: '',
        icon: SENSOR_THRESHOLDS.nivel.icon,
        color: SENSOR_THRESHOLDS.nivel.color,
        status: nivelOk ? 'normal' : 'critical',
        isBoolean: true,
        boolValue: nivelOk,
      });

      if (!nivelOk) {
        lagunaAlerts.push({
          id: `${LAGUNA_ID}-nivel-critical`,
          lagunaId: LAGUNA_ID,
          type: 'nivel',
          status: 'critical',
          message: '¡Nivel de agua bajo!',
        });
      }
    }

    return {
      id: LAGUNA_ID,
      name: 'Laguna Principal',
      sensors,
      alerts: lagunaAlerts,
      bomba: data.bomba === true,
      rawData: data,
    };
  }, []);

  // ============================================
  // EJECUTAR AUTOMATIZACIÓN
  // ============================================
  const executeAutomation = useCallback(async (data) => {
    if (!data) return;

    for (const [ruleId, rule] of Object.entries(AUTOMATION_RULES)) {
      try {
        if (rule.condition(data)) {
          const alertKey = `${LAGUNA_ID}-${ruleId}`;
          
          if (canSendNotification(alertKey)) {
            console.log(`🔔 Regla activada: ${ruleId}`);
            
            if (rule.action === 'ENCENDER_BOMBA' && !data.bomba) {
              console.log(`🤖 Encendiendo bomba automáticamente`);
              await toggleBomba(LAGUNA_ID, true);
            }

            if (rule.notification && sendNotificationRef.current) {
              const body = typeof rule.notification.body === 'function'
                ? rule.notification.body(data)
                : rule.notification.body;

              console.log(`📱 Enviando notificación: ${rule.notification.title}`);
              
              sendNotificationRef.current(
                rule.notification.title,
                body,
                { type: 'automation', rule: ruleId, lagunaId: LAGUNA_ID, priority: rule.notification.priority }
              );
            }
          }
        }
      } catch (error) {
        console.error(`Error en automatización ${ruleId}:`, error);
      }
    }
  }, [canSendNotification]);

  // ============================================
  // SUSCRIPCIÓN A FIREBASE
  // ============================================
  useEffect(() => {
    mountedRef.current = true;
    console.log('🔌 Conectando a Firebase: /laguna...');
    setIsLoading(true);

    const unsubscribe = subscribeToLaguna(LAGUNA_ID, (data, error) => {
      if (!mountedRef.current) return;
      
      setIsLoading(false);

      if (error) {
        console.error('❌ Error de conexión:', error);
        setIsConnected(false);
        return;
      }

      if (data) {
        setIsConnected(true);
        setLastUpdate(new Date());

        const processed = processLagunaData(data);
        if (processed) {
          setLaguna(processed);
          setAlerts(processed.alerts);
          executeAutomation(data);
        }
      } else {
        setIsConnected(false);
        setLaguna(null);
      }
    });

    return () => {
      console.log('🔌 Desconectando de Firebase...');
      mountedRef.current = false;
      unsubscribe();
    };
  }, [processLagunaData, executeAutomation]);

  // ============================================
  // CONTROL DE BOMBA
  // ============================================
  const controlBomba = async (lagunaId, state) => {
    try {
      await toggleBomba(LAGUNA_ID, state);
      return true;
    } catch (error) {
      console.error('Error controlando bomba:', error);
      return false;
    }
  };

  const refresh = useCallback(() => {
    console.log('🔄 Los datos se actualizan cada 3 segundos');
  }, []);

  const getSummary = useCallback(() => {
    if (!laguna) {
      return {
        totalLagunas: 0,
        totalAlerts: 0,
        criticalAlerts: 0,
        bombasActivas: 0,
        sensoresOk: 0,
        sensoresTotal: 0,
      };
    }

    return {
      totalLagunas: 1,
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.status === 'critical').length,
      bombasActivas: laguna.bomba ? 1 : 0,
      sensoresOk: laguna.sensors.filter(s => s.status === 'normal').length,
      sensoresTotal: laguna.sensors.length,
    };
  }, [laguna, alerts]);

  return {
    lagunas: laguna ? { [LAGUNA_ID]: laguna } : {},
    lagunasArray: laguna ? [laguna] : [],
    laguna,
    isConnected,
    isLoading,
    alerts,
    lastUpdate,
    controlBomba,
    refresh,
    getSummary,
    SENSOR_THRESHOLDS,
  };
};

export const useSensors = () => {
  const { laguna, isConnected, isLoading, alerts, controlBomba, lastUpdate, refresh } = useLagunas();

  return {
    sensors: laguna?.sensors || [],
    rawData: laguna?.rawData || null,
    isConnected,
    isLoading,
    alerts,
    bombaStatus: laguna?.bomba || false,
    lastUpdate,
    controlBomba: (state) => controlBomba('laguna', state),
    refresh,
  };
};

export default useLagunas;