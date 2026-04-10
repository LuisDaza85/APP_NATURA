// src/constants/colors.js
// Paleta de colores de la aplicación (igual que la web)

export const COLORS = {
  // Colores principales
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Color principal
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Slate (fondos oscuros)
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',  // Fondo principal
    950: '#020617',
  },

  // Estados
  success: {
    light: '#dcfce7',
    main: '#22c55e',
    dark: '#15803d',
  },
  warning: {
    light: '#fef3c7',
    main: '#f59e0b',
    dark: '#b45309',
  },
  error: {
    light: '#fee2e2',
    main: '#ef4444',
    dark: '#b91c1c',
  },
  info: {
    light: '#dbeafe',
    main: '#3b82f6',
    dark: '#1d4ed8',
  },

  // Texto
  text: {
    primary: '#ffffff',
    secondary: '#94a3b8',
    disabled: '#64748b',
    hint: '#475569',
  },

  // Fondos
  background: {
    default: '#0f172a',
    paper: '#1e293b',
    elevated: '#334155',
  },

  // Bordes
  border: {
    light: '#334155',
    main: '#475569',
    dark: '#64748b',
  },
};

// Colores para sensores
export const SENSOR_COLORS = {
  temperatura: {
    primary: '#ef4444',
    background: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.3)',
  },
  ph: {
    primary: '#8b5cf6',
    background: 'rgba(139, 92, 246, 0.1)',
    border: 'rgba(139, 92, 246, 0.3)',
  },
  oxigeno: {
    primary: '#3b82f6',
    background: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.3)',
  },
  turbidez: {
    primary: '#14b8a6',
    background: 'rgba(20, 184, 166, 0.1)',
    border: 'rgba(20, 184, 166, 0.3)',
  },
};

// Colores para dispositivos
export const DEVICE_COLORS = {
  bomba: '#3b82f6',
  aireador: '#06b6d4',
  alimentador: '#f59e0b',
  calentador: '#ef4444',
  iluminacion: '#eab308',
};

// Colores para estados de pedidos
export const ORDER_STATUS_COLORS = {
  pendiente: '#f59e0b',
  confirmado: '#3b82f6',
  preparando: '#8b5cf6',
  listo: '#06b6d4',
  en_camino: '#14b8a6',
  entregado: '#22c55e',
  cancelado: '#ef4444',
};

export default COLORS;
