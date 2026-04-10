// src/screens/producer/HomeScreen.jsx
// Dashboard principal del productor con monitoreo de lagunas

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLagunas } from '../../hooks/useLagunas';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/Loading';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { colors } = useTheme();
  const {
    lagunasArray,
    isConnected,
    isLoading,
    alerts,
    lastUpdate,
    controlBomba,
    getSummary,
    refresh
  } = useLagunas();

  const [refreshing, setRefreshing] = useState(false);

  const summary = getSummary();

  const onRefresh = async () => {
    setRefreshing(true);
    refresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleBombaToggle = async (lagunaId, currentState) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await controlBomba(lagunaId, !currentState);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return 'Sin datos';
    const now = new Date();
    const diff = Math.floor((now - lastUpdate) / 1000);
    if (diff < 10) return 'Ahora';
    if (diff < 60) return `${diff}s`;
    return `${Math.floor(diff / 60)}m`;
  };

  // Navegar a la pestaña de Monitoreo/Devices para ver alertas
  const handleAlertsPress = () => {
    navigation.navigate('Devices');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()}</Text>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.nombre || 'Productor'}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.connectionDot, { backgroundColor: isConnected ? '#22c55e' : '#ef4444' }]} />
            <TouchableOpacity
              style={[styles.notificationButton, { backgroundColor: colors.surface }]}
              onPress={handleAlertsPress}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              {(unreadCount > 0 || alerts.length > 0) && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {(unreadCount + alerts.length) > 9 ? '9+' : (unreadCount + alerts.length)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Estado de conexión */}
        <View style={[styles.connectionStatus, { borderColor: isConnected ? '#22c55e' : '#ef4444', backgroundColor: colors.surface }]}>
          <View style={styles.connectionInfo}>
            <Ionicons
              name={isConnected ? 'wifi' : 'wifi-outline'}
              size={16}
              color={isConnected ? '#22c55e' : '#ef4444'}
            />
            <Text style={[styles.connectionText, { color: isConnected ? '#22c55e' : '#ef4444' }]}>
              {isConnected ? 'Sensores conectados' : 'Sin conexión'}
            </Text>
          </View>
          <Text style={[styles.lastUpdateText, { color: colors.textHint }]}>Act: {formatLastUpdate()}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="fish"
            label="Lagunas"
            value={summary.totalLagunas}
            color="#3b82f6"
            colors={colors}
          />
          <StatCard
            icon="alert-circle-outline"
            label="Alertas"
            value={summary.criticalAlerts}
            color={summary.criticalAlerts > 0 ? "#ef4444" : "#22c55e"}
            onPress={handleAlertsPress}
            colors={colors}
          />
          <StatCard
            icon="pulse"
            label="Sensores"
            value={summary.sensoresOk}
            color="#22c55e"
            colors={colors}
          />
          <StatCard
            icon="water-outline"
            label="Bombas"
            value={summary.bombasActivas}
            color="#14b8a6"
            colors={colors}
          />
        </View>

        {/* Loading */}
        {isLoading && (
          <Card style={styles.section}>
            <CardBody>
              <View style={styles.loadingContainer}>
                <LoadingSpinner />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Conectando a sensores...</Text>
              </View>
            </CardBody>
          </Card>
        )}

        {/* Lagunas */}
        {!isLoading && lagunasArray.length > 0 && (
          <>
            {lagunasArray.map((laguna) => (
              <LagunaCard
                key={laguna.id}
                laguna={laguna}
                onBombaToggle={() => handleBombaToggle(laguna.id, laguna.bomba)}
                onPress={() => navigation.navigate('Devices')}
                colors={colors}
              />
            ))}
          </>
        )}

        {/* Sin datos */}
        {!isLoading && lagunasArray.length === 0 && (
          <Card style={styles.section}>
            <CardBody>
              <View style={styles.noDataContainer}>
                <Ionicons name="cloud-offline-outline" size={48} color={colors.textHint} />
                <Text style={[styles.noDataText, { color: colors.text }]}>Sin datos de sensores</Text>
                <Text style={[styles.noDataSubtext, { color: colors.textHint }]}>
                  Verifica la conexión del ESP32
                </Text>
              </View>
            </CardBody>
          </Card>
        )}

        {/* Alertas activas */}
        {alerts.length > 0 && (
          <Card style={[styles.section, styles.alertsCard]}>
            <CardHeader title="⚠️ Alertas Activas" />
            <CardBody>
              {alerts.slice(0, 4).map((alert, index) => (
                <View key={index} style={styles.alertItem}>
                  <View style={[styles.alertDot, {
                    backgroundColor: alert.status === 'critical' ? '#ef4444' : '#f59e0b'
                  }]} />
                  <View style={styles.alertContent}>
                    <Text style={[styles.alertLaguna, { color: colors.textSecondary }]}>
                      {alert.lagunaId === 'laguna1' ? 'Laguna 1' : 'Laguna 2'}
                    </Text>
                    <Text style={[styles.alertText, { color: colors.text }]}>{alert.message}</Text>
                  </View>
                </View>
              ))}
            </CardBody>
          </Card>
        )}

        {/* Acciones Rápidas */}
        <Card style={styles.section}>
          <CardHeader title="Acciones Rápidas" />
          <CardBody>
            <View style={styles.actionsGrid}>
              <ActionButton
                icon="hardware-chip-outline"
                label="Control"
                onPress={() => navigation.navigate('Devices')}
                colors={colors}
              />
              <ActionButton
                icon="restaurant-outline"
                label="Alimentar"
                onPress={() => navigation.navigate('Devices')}
                colors={colors}
              />
              <ActionButton
                icon="stats-chart-outline"
                label="Historial"
                onPress={() => {}}
                colors={colors}
              />
              <ActionButton
                icon="settings-outline"
                label="Config"
                onPress={() => navigation.navigate('Profile')}
                colors={colors}
              />
            </View>
          </CardBody>
        </Card>

        {/* Info de automatización */}
        <Card style={styles.section}>
          <CardHeader title="Automatización Activa" />
          <CardBody>
            <View style={styles.automationItem}>
              <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
              <Text style={[styles.automationText, { color: colors.textSecondary }]}>
                Bomba automática si nivel bajo
              </Text>
            </View>
            <View style={styles.automationItem}>
              <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
              <Text style={[styles.automationText, { color: colors.textSecondary }]}>
                Bomba automática si temperatura {'>'} 36°C
              </Text>
            </View>
            <View style={styles.automationItem}>
              <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
              <Text style={[styles.automationText, { color: colors.textSecondary }]}>
                Notificaciones push activadas
              </Text>
            </View>
          </CardBody>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================
// COMPONENTES
// ============================================

const StatCard = ({ icon, label, value, color, onPress, colors }) => (
  <TouchableOpacity
    style={[styles.statCard, { backgroundColor: colors.surface }]}
    onPress={onPress}
    activeOpacity={0.8}
    disabled={!onPress}
  >
    <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
  </TouchableOpacity>
);

const LagunaCard = ({ laguna, onBombaToggle, onPress, colors }) => {
  const hasAlerts = laguna.alerts.length > 0;
  const hasCritical = laguna.alerts.some(a => a.status === 'critical');

  return (
    <Card style={[
      styles.lagunaCard,
      hasCritical && styles.lagunaCardCritical,
      hasAlerts && !hasCritical && styles.lagunaCardWarning
    ]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <CardHeader
          title={`🐟 ${laguna.name}`}
          subtitle={hasCritical ? '⚠️ Atención requerida' : hasAlerts ? '⚡ Alertas' : '✔ Normal'}
        />
      </TouchableOpacity>
      <CardBody>
        {/* Sensores */}
        <View style={styles.sensorsRow}>
          {laguna.sensors.map((sensor) => (
            <View key={sensor.id} style={styles.sensorMini}>
              <Ionicons name={sensor.icon} size={16} color={sensor.color} />
              <Text style={[styles.sensorValue, { color: colors.text }]}>
                {sensor.value}<Text style={[styles.sensorUnit, { color: colors.textSecondary }]}>{sensor.unit}</Text>
              </Text>
              <Text style={[styles.sensorLabel, { color: colors.textSecondary }]}>{sensor.label}</Text>
              <View style={[
                styles.sensorStatus,
                { backgroundColor: sensor.status === 'normal' ? '#22c55e' :
                  sensor.status === 'warning' ? '#f59e0b' : '#ef4444' }
              ]} />
            </View>
          ))}
        </View>

        {/* Control de Bomba */}
        <View style={[styles.bombaRow, { backgroundColor: colors.elevated }]}>
          <View style={styles.bombaInfo}>
            <Ionicons
              name={laguna.bomba ? 'water' : 'water-outline'}
              size={20}
              color={laguna.bomba ? '#3b82f6' : '#64748b'}
            />
            <Text style={[styles.bombaText, { color: colors.text }]}>
              Bomba: {laguna.bomba ? 'ON' : 'OFF'}
            </Text>
          </View>
          <Switch
            value={laguna.bomba}
            onValueChange={onBombaToggle}
            trackColor={{ false: '#334155', true: '#3b82f6' }}
            thumbColor={laguna.bomba ? '#fff' : '#94a3b8'}
          />
        </View>
      </CardBody>
    </Card>
  );
};

const ActionButton = ({ icon, label, onPress, colors }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.actionIcon, { backgroundColor: `${colors.primary}15` }]}>
      <Ionicons name={icon} size={24} color={colors.primary} />
    </View>
    <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>{label}</Text>
  </TouchableOpacity>
);

// ============================================
// ESTILOS
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Connection Status
  connectionStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.lg,
    borderWidth: 1,
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  lastUpdateText: {
    fontSize: 11,
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  // Sections
  section: {
    marginBottom: SPACING.lg,
  },
  // Loading
  loadingContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
  },
  // No Data
  noDataContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  noDataText: {
    marginTop: SPACING.md,
    fontSize: 16,
    fontWeight: '500',
  },
  noDataSubtext: {
    marginTop: 4,
    fontSize: 13,
  },
  // Laguna Card
  lagunaCard: {
    marginBottom: SPACING.lg,
  },
  lagunaCardWarning: {
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  lagunaCardCritical: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  sensorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sensorMini: {
    alignItems: 'center',
    flex: 1,
  },
  sensorValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  sensorUnit: {
    fontSize: 10,
    fontWeight: 'normal',
  },
  sensorLabel: {
    fontSize: 10,
  },
  sensorStatus: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  bombaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  bombaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  bombaText: {
    fontSize: 14,
  },
  // Alerts
  alertsCard: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  alertContent: {
    flex: 1,
  },
  alertLaguna: {
    fontSize: 11,
    fontWeight: '600',
  },
  alertText: {
    fontSize: 13,
  },
  // Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  actionLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  // Automation
  automationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 6,
  },
  automationText: {
    fontSize: 13,
  },
});

export default HomeScreen;