// src/screens/producer/MonitoringScreen.jsx
// Pantalla de monitoreo de 1 laguna en tiempo real

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLagunas } from '../../hooks/useLagunas';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/Loading';
import { SPACING, BORDER_RADIUS } from '../../constants/theme';

// Info del Tambaqui
const TAMBAQUI_INFO = {
  nombre: 'Tambaqui (Colossoma macropomum)',
  caracteristicas: [
    'Temperatura óptima: 25-34°C',
    'pH óptimo: 6.5-8.5',
    'Turbidez máxima: 50 NTU',
    'Alerta crítica: ≥ 36°C',
  ],
};

const MonitoringScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { 
    laguna,  // Acceso directo a la única laguna
    isConnected, 
    isLoading, 
    alerts,
    lastUpdate,
    controlBomba,
    refresh 
  } = useLagunas();
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    refresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return 'Sin datos';
    const now = new Date();
    const diff = Math.floor((now - lastUpdate) / 1000);
    if (diff < 10) return 'Ahora mismo';
    if (diff < 60) return `Hace ${diff}s`;
    return `Hace ${Math.floor(diff / 60)}m`;
  };

  const handleBombaToggle = async () => {
    if (!laguna) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await controlBomba('laguna1', !laguna.bomba);
  };

  // Calcular estado general
  const hasAlerts = alerts.length > 0;
  const hasCritical = alerts.some(a => a.status === 'critical');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Monitoreo</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Laguna en tiempo real
          </Text>
        </View>
        <View style={[styles.connectionBadge, { backgroundColor: colors.surface }]}>
          <View style={[
            styles.connectionDot, 
            { backgroundColor: isConnected ? '#22c55e' : '#ef4444' }
          ]} />
          <Text style={[
            styles.connectionText,
            { color: isConnected ? '#22c55e' : '#ef4444' }
          ]}>
            {isConnected ? 'En línea' : 'Offline'}
          </Text>
        </View>
      </View>

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
        {/* Estado de conexión */}
        <View style={[styles.updateInfo, { backgroundColor: colors.surface }]}>
          <Ionicons name="time-outline" size={14} color={colors.textHint} />
          <Text style={[styles.updateText, { color: colors.textHint }]}>
            Última actualización: {formatLastUpdate()}
          </Text>
          {isConnected && (
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>

        {/* Alertas */}
        {hasAlerts && (
          <AlertBanner alerts={alerts} colors={colors} />
        )}

        {/* Loading */}
        {isLoading && (
          <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
            <LoadingSpinner />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Conectando a sensores...
            </Text>
          </View>
        )}

        {/* Sin datos */}
        {!isLoading && !laguna && (
          <Card>
            <CardBody>
              <View style={styles.emptyContainer}>
                <Ionicons name="cloud-offline-outline" size={64} color={colors.textHint} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Sin datos</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No se encontraron datos en Firebase.
                </Text>
                <Text style={[styles.emptyHint, { color: colors.textHint }]}>
                  Ruta esperada: /laguna1
                </Text>
              </View>
            </CardBody>
          </Card>
        )}

        {/* Sensores */}
        {laguna && (
          <>
            {/* Estado General */}
            <View style={[
              styles.statusBanner,
              { 
                backgroundColor: hasCritical ? 'rgba(239, 68, 68, 0.1)' : 
                                 hasAlerts ? 'rgba(245, 158, 11, 0.1)' : 
                                 'rgba(34, 197, 94, 0.1)',
                borderColor: hasCritical ? '#ef4444' : hasAlerts ? '#f59e0b' : '#22c55e'
              }
            ]}>
              <Ionicons 
                name={hasCritical ? 'warning' : hasAlerts ? 'alert-circle' : 'checkmark-circle'} 
                size={24} 
                color={hasCritical ? '#ef4444' : hasAlerts ? '#f59e0b' : '#22c55e'} 
              />
              <Text style={[
                styles.statusText,
                { color: hasCritical ? '#ef4444' : hasAlerts ? '#f59e0b' : '#22c55e' }
              ]}>
                {hasCritical ? 'Condiciones críticas' : 
                 hasAlerts ? 'Alertas activas' : 
                 'Condiciones óptimas para Tambaqui'}
              </Text>
            </View>

            {/* Tarjetas de Sensores */}
            {laguna.sensors.map((sensor) => (
              <SensorCard 
                key={sensor.id} 
                sensor={sensor} 
                colors={colors}
                isConnected={isConnected}
              />
            ))}

            {/* Control de Bomba */}
            <BombaCard
              isOn={laguna.bomba}
              isConnected={isConnected}
              onToggle={handleBombaToggle}
              colors={colors}
            />

            {/* Estadísticas rápidas */}
            <Card>
              <CardHeader title="📊 Resumen del Sistema" />
              <CardBody>
                <View style={styles.statsGrid}>
                  <StatItem 
                    label="Sensores OK" 
                    value={`${laguna.sensors.filter(s => s.status === 'normal').length}/${laguna.sensors.length}`}
                    color="#22c55e"
                    colors={colors}
                  />
                  <StatItem 
                    label="Alertas" 
                    value={alerts.length}
                    color={hasAlerts ? '#ef4444' : '#22c55e'}
                    colors={colors}
                  />
                  <StatItem 
                    label="Bomba" 
                    value={laguna.bomba ? 'ON' : 'OFF'}
                    color={laguna.bomba ? '#3b82f6' : '#64748b'}
                    colors={colors}
                  />
                  <StatItem 
                    label="Estado" 
                    value={isConnected ? 'Online' : 'Offline'}
                    color={isConnected ? '#22c55e' : '#ef4444'}
                    colors={colors}
                  />
                </View>
              </CardBody>
            </Card>
          </>
        )}

        {/* Información del Sistema */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <View style={styles.infoHeader}>
            <Ionicons name="fish" size={24} color="#3b82f6" />
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Sistema IoT para Tambaqui
            </Text>
          </View>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <InfoItem 
                icon="hardware-chip" 
                text={`ESP32: ${isConnected ? 'Conectado' : 'Desconectado'}`}
                color={isConnected ? '#22c55e' : '#ef4444'}
                colors={colors}
              />
              <InfoItem 
                icon="thermometer" 
                text="Sensor: DS18B20"
                colors={colors}
              />
              <InfoItem 
                icon="flask" 
                text="Sensor: pH analógico"
                colors={colors}
              />
            </View>
            <View style={styles.infoColumn}>
              <InfoItem 
                icon="cloud" 
                text="Firebase Realtime DB"
                colors={colors}
              />
              <InfoItem 
                icon="notifications" 
                text="Notificación: ≥ 36°C"
                color="#ef4444"
                colors={colors}
              />
              <InfoItem 
                icon="time" 
                text="Cooldown: 5 min"
                colors={colors}
              />
            </View>
          </View>

          <View style={[styles.tambaquiInfo, { borderTopColor: colors.border }]}>
            <Text style={[styles.tambaquiTitle, { color: colors.text }]}>
              🐟 {TAMBAQUI_INFO.nombre}
            </Text>
            {TAMBAQUI_INFO.caracteristicas.map((item, index) => (
              <Text key={index} style={[styles.tambaquiItem, { color: colors.textSecondary }]}>
                • {item}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================
// COMPONENTE: Tarjeta de Sensor
// ============================================
const SensorCard = ({ sensor, colors, isConnected }) => {
  const getStatusColor = () => {
    if (!isConnected) return '#9ca3af';
    switch (sensor.status) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#22c55e';
    }
  };

  const isOutOfRange = sensor.status === 'critical' || sensor.status === 'warning';

  const getProgress = () => {
    if (sensor.isBoolean) return sensor.boolValue ? 100 : 0;
    const value = parseFloat(sensor.value);
    const min = sensor.minValue || 0;
    const max = sensor.maxValue || 100;
    return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  };

  return (
    <View style={[
      styles.sensorCard,
      { 
        backgroundColor: colors.surface,
        borderColor: isOutOfRange ? getStatusColor() : colors.border,
        borderWidth: isOutOfRange ? 1 : 0,
      }
    ]}>
      <View style={styles.sensorHeader}>
        <View style={[styles.sensorIcon, { backgroundColor: `${sensor.color}20` }]}>
          <Ionicons name={sensor.icon} size={24} color={sensor.color} />
          {!isConnected && <View style={styles.offlineDot} />}
        </View>
        
        <View style={styles.sensorInfo}>
          <View style={styles.sensorTitleRow}>
            <Text style={[styles.sensorLabel, { color: colors.textSecondary }]}>
              {sensor.label}
            </Text>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          </View>
          
          <View style={styles.sensorValueRow}>
            <Text style={[
              styles.sensorValue,
              { color: isConnected ? (isOutOfRange ? '#ef4444' : colors.text) : colors.textHint }
            ]}>
              {isConnected ? sensor.value : '--'}
            </Text>
            <Text style={[styles.sensorUnit, { color: colors.textSecondary }]}>
              {sensor.unit}
            </Text>
          </View>

          {!sensor.isBoolean && (
            <Text style={[styles.sensorRange, { color: colors.textHint }]}>
              Rango: {sensor.minValue} - {sensor.maxValue} {sensor.unit}
            </Text>
          )}
        </View>
      </View>

      {/* Barra de progreso */}
      {isConnected && !sensor.isBoolean && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${getProgress()}%`,
                  backgroundColor: getStatusColor()
                }
              ]} 
            />
          </View>
        </View>
      )}

      {/* Estado fuera de rango */}
      {isConnected && isOutOfRange && (
        <View style={styles.alertTag}>
          <Ionicons name="warning" size={12} color="#ef4444" />
          <Text style={styles.alertTagText}>Fuera de rango</Text>
        </View>
      )}
    </View>
  );
};

// ============================================
// COMPONENTE: Tarjeta de Bomba
// ============================================
const BombaCard = ({ isOn, isConnected, onToggle, colors }) => (
  <View style={[
    styles.bombaCard,
    { 
      backgroundColor: colors.surface,
      borderColor: isOn ? '#22c55e' : colors.border,
      borderWidth: isOn ? 1 : 0,
    }
  ]}>
    <View style={styles.bombaHeader}>
      <View style={[
        styles.bombaIcon,
        { backgroundColor: isOn ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 116, 139, 0.2)' }
      ]}>
        <Ionicons 
          name="water" 
          size={24} 
          color={isOn ? '#22c55e' : '#64748b'} 
        />
      </View>
      
      <View style={styles.bombaInfo}>
        <Text style={[styles.bombaLabel, { color: colors.textSecondary }]}>
          Bomba de Enfriamiento
        </Text>
        <Text style={[
          styles.bombaStatus,
          { color: isConnected ? (isOn ? '#22c55e' : colors.text) : colors.textHint }
        ]}>
          {isConnected ? (isOn ? 'ENCENDIDA' : 'APAGADA') : 'SIN CONEXIÓN'}
        </Text>
        <Text style={[styles.bombaHint, { color: colors.textHint }]}>
          Auto-activación cuando temp ≥ 36°C
        </Text>
      </View>

      <Switch
        value={isOn}
        onValueChange={onToggle}
        disabled={!isConnected}
        trackColor={{ false: '#334155', true: '#22c55e' }}
        thumbColor={isOn ? '#fff' : '#94a3b8'}
      />
    </View>

    {isOn && isConnected && (
      <View style={styles.bombaActive}>
        <Ionicons name="flash" size={14} color="#22c55e" />
        <Text style={styles.bombaActiveText}>Enfriando agua...</Text>
      </View>
    )}
  </View>
);

// ============================================
// COMPONENTE: Banner de Alertas
// ============================================
const AlertBanner = ({ alerts, colors }) => {
  const criticalAlerts = alerts.filter(a => a.status === 'critical');
  const warningAlerts = alerts.filter(a => a.status === 'warning');

  return (
    <View style={styles.alertBanner}>
      {criticalAlerts.length > 0 && (
        <View style={[styles.alertBox, styles.alertCritical]}>
          <Ionicons name="warning" size={20} color="#ef4444" />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Alertas Críticas</Text>
            {criticalAlerts.map((alert, index) => (
              <Text key={index} style={styles.alertMessage}>• {alert.message}</Text>
            ))}
          </View>
        </View>
      )}
      
      {warningAlerts.length > 0 && (
        <View style={[styles.alertBox, styles.alertWarning]}>
          <Ionicons name="alert-circle" size={20} color="#f59e0b" />
          <View style={styles.alertContent}>
            <Text style={[styles.alertTitle, { color: '#92400e' }]}>Advertencias</Text>
            {warningAlerts.map((alert, index) => (
              <Text key={index} style={[styles.alertMessage, { color: '#92400e' }]}>
                • {alert.message}
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

// ============================================
// COMPONENTES AUXILIARES
// ============================================
const StatItem = ({ label, value, color, colors }) => (
  <View style={styles.statItem}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
  </View>
);

const InfoItem = ({ icon, text, color, colors }) => (
  <View style={styles.infoItem}>
    <Ionicons name={icon} size={14} color={color || colors.primary} />
    <Text style={[styles.infoText, { color: colors.textSecondary }]}>{text}</Text>
  </View>
);

// ============================================
// ESTILOS
// ============================================
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 14, marginTop: 2 },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    gap: 6,
  },
  connectionDot: { width: 8, height: 8, borderRadius: 4 },
  connectionText: { fontSize: 12, fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 100 },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  updateText: { fontSize: 12 },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    marginLeft: SPACING.sm,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ef4444', marginRight: 4 },
  liveText: { fontSize: 10, fontWeight: 'bold', color: '#ef4444' },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  statusText: { fontSize: 14, fontWeight: '600', flex: 1 },
  loadingContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  loadingText: { marginTop: SPACING.md, fontSize: 14 },
  emptyContainer: { alignItems: 'center', padding: SPACING.xl },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: SPACING.md },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: SPACING.sm },
  emptyHint: { fontSize: 12, textAlign: 'center', marginTop: SPACING.md },
  sensorCard: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md },
  sensorHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  sensorIcon: { width: 48, height: 48, borderRadius: BORDER_RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  offlineDot: { position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444' },
  sensorInfo: { flex: 1, marginLeft: SPACING.md },
  sensorTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sensorLabel: { fontSize: 14, fontWeight: '500' },
  statusIndicator: { width: 8, height: 8, borderRadius: 4 },
  sensorValueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  sensorValue: { fontSize: 28, fontWeight: 'bold' },
  sensorUnit: { fontSize: 14, marginLeft: 4 },
  sensorRange: { fontSize: 11, marginTop: 4 },
  progressContainer: { marginTop: SPACING.md },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  alertTag: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: 4 },
  alertTagText: { fontSize: 11, color: '#ef4444', fontWeight: '500' },
  bombaCard: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md },
  bombaHeader: { flexDirection: 'row', alignItems: 'center' },
  bombaIcon: { width: 48, height: 48, borderRadius: BORDER_RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  bombaInfo: { flex: 1, marginLeft: SPACING.md },
  bombaLabel: { fontSize: 14, fontWeight: '500' },
  bombaStatus: { fontSize: 20, fontWeight: 'bold', marginTop: 2 },
  bombaHint: { fontSize: 11, marginTop: 2 },
  bombaActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(34, 197, 94, 0.2)',
    gap: 4,
  },
  bombaActiveText: { fontSize: 12, color: '#22c55e', fontWeight: '500' },
  alertBanner: { marginBottom: SPACING.md, gap: SPACING.sm },
  alertBox: { flexDirection: 'row', padding: SPACING.md, borderRadius: BORDER_RADIUS.md, gap: SPACING.sm },
  alertCritical: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  alertWarning: { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: 13, fontWeight: '600', color: '#991b1b', marginBottom: 4 },
  alertMessage: { fontSize: 12, color: '#991b1b' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 11, marginTop: 2 },
  infoCard: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginTop: SPACING.md },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  infoTitle: { fontSize: 16, fontWeight: '600' },
  infoGrid: { flexDirection: 'row', gap: SPACING.md },
  infoColumn: { flex: 1, gap: SPACING.sm },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 12 },
  tambaquiInfo: { marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1 },
  tambaquiTitle: { fontSize: 14, fontWeight: '600', marginBottom: SPACING.sm },
  tambaquiItem: { fontSize: 12, marginTop: 2 },
});

export default MonitoringScreen;