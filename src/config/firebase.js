// src/config/firebase.js
// Configuración de Firebase para NaturaPiscis
// Usa XMLHttpRequest para mejor compatibilidad con Expo Go

// ============================================
// CONFIGURACIÓN DE FIREBASE - NATURAPISCIS
// ============================================
const FIREBASE_URL = 'https://naturapiscis-default-rtdb.firebaseio.com';
const REQUEST_TIMEOUT = 15000; // 15 segundos

console.log('🔥 Firebase configurado:', FIREBASE_URL);

// ============================================
// UMBRALES DE SENSORES PARA TAMBAQUI
// ============================================
export const SENSOR_THRESHOLDS = {
  temperatura: {
    min: 25,
    max: 34,
    critical: 36,
    unit: '°C',
    label: 'Temperatura',
    icon: 'thermometer-outline',
    color: '#ef4444',
  },
  ph: {
    min: 6.5,
    max: 8.5,
    critical_min: 5.5,
    critical_max: 9.5,
    unit: '',
    label: 'pH',
    icon: 'flask-outline',
    color: '#8b5cf6',
  },
  turbidez: {
    min: 0,
    max: 50,
    critical: 100,
    unit: 'NTU',
    label: 'Turbidez',
    icon: 'water-outline',
    color: '#14b8a6',
  },
  nivel: {
    label: 'Nivel de Agua',
    icon: 'layers-outline',
    color: '#3b82f6',
  },
};

// ============================================
// REGLAS DE AUTOMATIZACIÓN
// ============================================
export const AUTOMATION_RULES = {
  temperatura_alta: {
    condition: (data) => {
      const temp = parseFloat(data.temperatura);
      return !isNaN(temp) && temp >= 36;
    },
    action: 'ENCENDER_BOMBA',
    notification: {
      title: '🌡️ Temperatura Crítica',
      body: (data) => `¡Alerta! Temperatura a ${data.temperatura}°C. Bomba activada.`,
      priority: 'high',
    },
  },
  ph_critico: {
    condition: (data) => {
      const ph = parseFloat(data.ph);
      return !isNaN(ph) && (ph < 5.5 || ph > 9.5);
    },
    action: null,
    notification: {
      title: '⚗️ pH Crítico',
      body: (data) => `pH fuera de rango: ${data.ph}`,
      priority: 'high',
    },
  },
  turbidez_alta: {
    condition: (data) => {
      const turb = parseFloat(data.turbidez);
      return !isNaN(turb) && turb > 100;
    },
    action: null,
    notification: {
      title: '🌊 Turbidez Alta',
      body: (data) => `Turbidez: ${data.turbidez} NTU`,
      priority: 'medium',
    },
  },
};

// ============================================
// HTTP REQUEST CON XMLHttpRequest
// ============================================
const httpRequest = (method, url, body = null) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.timeout = REQUEST_TIMEOUT;
    
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (e) {
            resolve(xhr.responseText);
          }
        } else if (xhr.status === 0) {
          reject(new Error('Sin conexión de red'));
        } else {
          reject(new Error(`HTTP ${xhr.status}`));
        }
      }
    };
    
    xhr.ontimeout = () => {
      reject(new Error('Timeout'));
    };
    
    xhr.onerror = () => {
      reject(new Error('Error de red'));
    };
    
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    if (body) {
      xhr.send(JSON.stringify(body));
    } else {
      xhr.send();
    }
  });
};

// ============================================
// OBTENER DATOS DE LAGUNA
// ============================================
export const fetchLagunaData = async () => {
  const url = `${FIREBASE_URL}/laguna.json`;
  
  try {
    console.log('📡 GET:', url);
    
    const data = await httpRequest('GET', url);
    
    if (data) {
      console.log('🐟 Datos obtenidos:', JSON.stringify(data));
      return data;
    } else {
      console.log('⚠️ Sin datos en /laguna');
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
};

// ============================================
// SUSCRIPCIÓN CON POLLING
// ============================================
export const subscribeToLaguna = (lagunaId, callback) => {
  console.log('📡 Iniciando polling a /laguna...');
  
  let isActive = true;
  let intervalId = null;
  let consecutiveErrors = 0;
  
  const poll = async () => {
    if (!isActive) return;
    
    try {
      const data = await fetchLagunaData();
      
      if (!isActive) return;
      
      if (data) {
        consecutiveErrors = 0;
        callback(data, null);
      } else {
        consecutiveErrors++;
        if (consecutiveErrors >= 5) {
          callback(null, new Error('Sin conexión'));
        }
      }
    } catch (error) {
      consecutiveErrors++;
      console.error('❌ Polling error:', error.message);
      if (isActive && consecutiveErrors >= 5) {
        callback(null, error);
      }
    }
  };
  
  // Primera lectura inmediata
  poll();
  
  // Polling cada 5 segundos
  intervalId = setInterval(poll, 5000);
  
  return () => {
    console.log('🔌 Deteniendo polling...');
    isActive = false;
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
};

// Alias para compatibilidad
export const subscribeToAllLagunas = (callback) => {
  return subscribeToLaguna('laguna', (data, error) => {
    if (data) {
      callback({ laguna: data }, error);
    } else {
      callback(null, error);
    }
  });
};

// ============================================
// CONTROL DE BOMBA
// ============================================
export const toggleBomba = async (lagunaId, state) => {
  const url = `${FIREBASE_URL}/laguna/bomba.json`;
  
  try {
    console.log(`💧 PUT bomba: ${state}`);
    
    await httpRequest('PUT', url, state);
    
    console.log(`💧 Bomba: ${state ? 'ENCENDIDA' : 'APAGADA'}`);
    return true;
  } catch (error) {
    console.error('❌ Error bomba:', error.message);
    throw error;
  }
};

export const database = null;
export default { FIREBASE_URL };