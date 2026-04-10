// src/navigation/AppNavigator.jsx
// Navegador principal de la aplicación con soporte para Productor, Consumidor y Repartidor

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePedidosMonitor } from '../hooks';
import { LoadingScreen } from '../components/common/Loading';

// ============================================
// SCREENS - AUTENTICACIÓN
// ============================================
import LoginScreen from '../screens/auth/LoginScreen';

// ============================================
// SCREENS - PRODUCTOR
// ============================================
import HomeScreen from '../screens/producer/HomeScreen';
import DevicesScreen from '../screens/producer/DevicesScreen';
import OrdersScreen from '../screens/producer/OrdersScreen';
import ProfileScreen from '../screens/producer/ProfileScreen';
import InventarioScreen from '../screens/producer/InventarioScreen';
import MonitoringScreen from '../screens/producer/MonitoringScreen';

// ============================================
// SCREENS - CONSUMIDOR
// ============================================
import HomeScreenConsumer from '../screens/consumer/HomeScreenConsumer';
import TiendaScreen from '../screens/consumer/TiendaScreen';
import ProductoresScreen from '../screens/consumer/ProductoresScreen';
import CarritoScreen from '../screens/consumer/CarritoScreen';
import PerfilScreen from '../screens/consumer/PerfilScreen';
import MisPedidosScreen from '../screens/consumer/MisPedidosScreen';
import AyudaScreen from '../screens/consumer/AyudaScreen';
import DetalleProductorScreen from '../screens/consumer/DetalleProductorScreen';
import PagoQRScreen from '../screens/consumer/PagoQRScreen';
import DetalleProductoScreen from '../screens/consumer/DetalleProductoScreen';

// ============================================
// SCREENS - REPARTIDOR
// ============================================
import RepartidorScreen from '../screens/driver/RepartidorScreen';
import TrackingPedidoScreen from '../screens/driver/TrackingPedidoScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ============================================
// TAB NAVIGATOR - PRODUCTOR
// ============================================
const ProducerTabs = () => {
  const { unreadCount } = useNotifications();
  const { colors, isDarkMode } = useTheme();
  const { stats } = usePedidosMonitor(true);
  const pedidosPendientes = stats?.pendientes || 0;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          let badgeCount = 0;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Orders':
              iconName = focused ? 'receipt' : 'receipt-outline';
              badgeCount = pedidosPendientes;
              break;
            case 'Inventario':
              iconName = focused ? 'cube' : 'cube-outline';
              break;
            case 'Devices':
              iconName = focused ? 'hardware-chip' : 'hardware-chip-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return (
            <View>
              <Ionicons name={iconName} size={24} color={color} />
              {badgeCount > 0 && (
                <View style={[styles.tabBadge, styles.tabBadgeOrders]}>
                  <Text style={styles.tabBadgeText}>
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </Text>
                </View>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Inicio' }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ tabBarLabel: 'Pedidos' }} />
      <Tab.Screen name="Inventario" component={InventarioScreen} options={{ tabBarLabel: 'Inventario' }} />
      <Tab.Screen name="Devices" component={DevicesScreen} options={{ tabBarLabel: 'Monitoreo' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
};

// ============================================
// TAB NAVIGATOR - CONSUMIDOR
// ============================================
const ConsumerTabs = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar || '#FFFFFF',
          borderTopColor: colors.tabBarBorder || '#E5E7EB',
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.tabActive || '#3B82F6',
        tabBarInactiveTintColor: colors.tabInactive || '#9CA3AF',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          switch (route.name) {
            case 'Inicio':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Tienda':
              iconName = focused ? 'storefront' : 'storefront-outline';
              break;
            case 'Productores':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Carrito':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Perfil':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreenConsumer} options={{ tabBarLabel: 'Inicio' }} />
      <Tab.Screen name="Tienda" component={TiendaScreen} options={{ tabBarLabel: 'Tienda' }} />
      <Tab.Screen name="Productores" component={ProductoresScreen} options={{ tabBarLabel: 'Productores' }} />
      <Tab.Screen name="Carrito" component={CarritoScreen} options={{ tabBarLabel: 'Carrito' }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ tabBarLabel: 'Perfil' }} />
      
    </Tab.Navigator>
  );
};

// ============================================
// TAB NAVIGATOR - REPARTIDOR
// ============================================
const RepartidorTabs = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar || '#FFFFFF',
          borderTopColor: colors.tabBarBorder || '#E5E7EB',
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.tabActive || '#22C55E',
        tabBarInactiveTintColor: colors.tabInactive || '#9CA3AF',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          switch (route.name) {
            case 'Entregas':
              iconName = focused ? 'bicycle' : 'bicycle-outline';
              break;
            case 'PerfilRepartidor':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Entregas"
        component={RepartidorScreen}
        options={{ tabBarLabel: 'Entregas' }}
      />
      {/* Puedes agregar más tabs del repartidor aquí, ej: ProfileScreen */}
    </Tab.Navigator>
  );
};

// ============================================
// STACK NAVIGATOR - CONSUMIDOR (con pantallas extra)
// ============================================
const ConsumerStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ConsumerTabs" component={ConsumerTabs} />
      <Stack.Screen name="DetalleProductor" component={DetalleProductorScreen} />
      <Stack.Screen name="MisPedidos" component={MisPedidosScreen} />
      <Stack.Screen name="Ayuda" component={AyudaScreen} />
      <Stack.Screen name="TrackingPedido" component={TrackingPedidoScreen} />
      <Stack.Screen name="PagoQR" component={PagoQRScreen} />
      <Stack.Screen name="DetalleProducto" component={DetalleProductoScreen} />
    </Stack.Navigator>
  );
};

// ============================================
// STACK NAVIGATOR - PRODUCTOR (con pantallas extra)
// ============================================
const ProducerStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProducerTabs" component={ProducerTabs} />
      <Stack.Screen name="Monitoring" component={MonitoringScreen} />
    </Stack.Navigator>
  );
};

// ============================================
// STACK NAVIGATOR - REPARTIDOR (con pantallas extra)
// ============================================
const RepartidorStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RepartidorTabs" component={RepartidorTabs} />
      <Stack.Screen name="TrackingPedido" component={TrackingPedidoScreen} />
    </Stack.Navigator>
  );
};

// ============================================
// APP NAVIGATOR PRINCIPAL
// ============================================
const AppNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { colors, isDarkMode } = useTheme();

  // Determinar el rol del usuario
  const userRole = user?.rol || user?.role || 'consumidor';

  // Tema de navegación personalizado
  const navigationTheme = {
    dark: isDarkMode,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.error,
    },
  };

  console.log('📱 Navigator - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'role:', userRole);

  if (isLoading) {
    return <LoadingScreen message="Verificando sesión..." />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          userRole === 'productor' ? (
            <Stack.Screen name="ProducerApp" component={ProducerStack} />
          ) : userRole === 'repartidor' ? (
            <Stack.Screen name="RepartidorApp" component={RepartidorStack} />
          ) : (
            // consumidor + admin + cualquier otro rol
            <Stack.Screen name="ConsumerApp" component={ConsumerStack} />
          )
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeOrders: {
    backgroundColor: '#f59e0b',
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
});

export default AppNavigator;