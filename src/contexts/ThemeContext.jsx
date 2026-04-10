// src/contexts/ThemeContext.jsx
// Contexto de tema con soporte para modo claro, oscuro y automático

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);

// ============================================
// ✅ CONSTANTES DE TEMA (exportadas para usar en otros archivos)
// ============================================
export const THEME_MODES = {
  AUTO: 'auto',
  LIGHT: 'light',
  DARK: 'dark',
};

// ============================================
// PALETAS DE COLORES
// ============================================
const lightColors = {
  // Backgrounds
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceVariant: '#F3F4F6',
  
  // Text
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Primary (Verde NaturaPiscis)
  primary: '#22C55E',
  primaryLight: '#86EFAC',
  primaryDark: '#16A34A',
  
  // Secondary (Azul agua)
  secondary: '#3B82F6',
  secondaryLight: '#93C5FD',
  secondaryDark: '#2563EB',
  
  // Status
  success: '#22C55E',
  successBg: '#F0FDF4',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  error: '#EF4444',
  errorBg: '#FEF2F2',
  info: '#3B82F6',
  infoBg: '#EFF6FF',
  
  // Borders & Dividers
  border: '#E5E7EB',
  divider: '#F3F4F6',
  
  // Cards & Containers
  card: '#FFFFFF',
  cardBorder: '#E5E7EB',
  
  // Tab Bar
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  tabActive: '#22C55E',
  tabInactive: '#9CA3AF',
  
  // Inputs
  inputBackground: '#F9FAFB',
  inputBorder: '#D1D5DB',
  inputBorderFocused: '#22C55E',
  placeholder: '#9CA3AF',
  
  // Buttons
  buttonPrimary: '#22C55E',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondary: '#F3F4F6',
  buttonSecondaryText: '#374151',
  buttonDisabled: '#E5E7EB',
  buttonDisabledText: '#9CA3AF',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Shadows
  shadowColor: '#000000',
  
  // Gradients
  gradientPrimary: ['#22C55E', '#16A34A'],
  gradientSecondary: ['#3B82F6', '#2563EB'],
  gradientDark: ['#1F2937', '#111827'],
};

const darkColors = {
  // Backgrounds
  background: '#111827',
  surface: '#1F2937',
  surfaceVariant: '#374151',
  
  // Text
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textMuted: '#9CA3AF',
  textInverse: '#111827',
  
  // Primary (Verde NaturaPiscis)
  primary: '#22C55E',
  primaryLight: '#86EFAC',
  primaryDark: '#16A34A',
  
  // Secondary (Azul agua)
  secondary: '#60A5FA',
  secondaryLight: '#93C5FD',
  secondaryDark: '#3B82F6',
  
  // Status
  success: '#22C55E',
  successBg: '#052e16',
  warning: '#FBBF24',
  warningBg: '#1c1407',
  error: '#F87171',
  errorBg: '#1f0707',
  info: '#60A5FA',
  infoBg: '#0c1a2e',
  
  // Borders & Dividers
  border: '#374151',
  divider: '#374151',
  
  // Cards & Containers
  card: '#1F2937',
  cardBorder: '#374151',
  
  // Tab Bar
  tabBar: '#1F2937',
  tabBarBorder: '#374151',
  tabActive: '#22C55E',
  tabInactive: '#6B7280',
  
  // Inputs
  inputBackground: '#374151',
  inputBorder: '#4B5563',
  inputBorderFocused: '#22C55E',
  placeholder: '#6B7280',
  
  // Buttons
  buttonPrimary: '#22C55E',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondary: '#374151',
  buttonSecondaryText: '#F9FAFB',
  buttonDisabled: '#374151',
  buttonDisabledText: '#6B7280',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Shadows
  shadowColor: '#000000',
  
  // Gradients
  gradientPrimary: ['#22C55E', '#16A34A'],
  gradientSecondary: ['#3B82F6', '#1D4ED8'],
  gradientDark: ['#374151', '#1F2937'],
};

// ============================================
// STORAGE KEY
// ============================================
const THEME_STORAGE_KEY = '@naturapiscis_theme_mode';

// ============================================
// THEME PROVIDER
// ============================================
export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  
  const [themeMode, setThemeMode] = useState(THEME_MODES.AUTO);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && Object.values(THEME_MODES).includes(savedTheme)) {
        setThemeMode(savedTheme);
        if (__DEV__) console.log('🎨 Tema cargado:', savedTheme);
      }
    } catch (error) {
      console.log('Error cargando tema:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (mode) => {
    if (!Object.values(THEME_MODES).includes(mode)) {
      console.warn('Modo de tema inválido:', mode);
      return;
    }
    try {
      setThemeMode(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      if (__DEV__) console.log('🎨 Tema guardado:', mode);
    } catch (error) {
      console.log('Error guardando tema:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = isDarkMode ? THEME_MODES.LIGHT : THEME_MODES.DARK;
    setTheme(newMode);
  };

  // ✅ isAuto: true cuando el tema sigue al sistema
  const isAuto = themeMode === THEME_MODES.AUTO;

  const isDarkMode = isAuto
    ? systemColorScheme === 'dark'
    : themeMode === THEME_MODES.DARK;

  const colors = isDarkMode ? darkColors : lightColors;

  const value = {
    // Estado
    themeMode,
    isDarkMode,
    isLoading,
    isAuto,           // ✅ AGREGADO

    // Colores
    colors,

    // Constantes
    THEME_MODES,      // ✅ AGREGADO

    // Acciones
    setTheme,
    toggleTheme,

    // Info del sistema
    systemColorScheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// ============================================
// HOOK PERSONALIZADO
// ============================================
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};

export default ThemeContext;