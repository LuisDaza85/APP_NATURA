// src/screens/consumer/TrackingPedidoScreen.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Animated, Dimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/config';

const POLLING_INTERVAL = 5000;

const ESTADOS = [
  { key: 'pendiente',          label: 'Pedido recibido',    icono: 'receipt-outline' },
  { key: 'confirmado',         label: 'Confirmado',         icono: 'checkmark-circle-outline' },
  { key: 'preparando',         label: 'En preparación',     icono: 'construct-outline' },
  { key: 'listo_para_recoger', label: 'Listo para recoger', icono: 'bag-check-outline' },
  { key: 'en_camino',          label: 'En camino',          icono: 'bicycle-outline' },
  { key: 'entregado',          label: 'Entregado',          icono: 'home-outline' },
];
const ESTADO_INDEX = Object.fromEntries(ESTADOS.map((e, i) => [e.key, i]));

const TrackingPedidoScreen = ({ route, navigation }) => {
  const { pedidoId } = route.params;
  const { colors } = useTheme();
  const { token } = useAuth();

  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState('detalles'); // 'mapa' | 'detalles'

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pollingRef = useRef(null);
  const mapRef = useRef(null);

  const fetchTracking = useCallback(async (silencioso = false) => {
    if (!silencioso) setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/pedidos/${pedidoId}/tracking`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPedido(res.data);

      // Centrar mapa en el conductor si se mueve
      if (res.data.conductor_lat && res.data.conductor_lng && mapRef.current && vistaActual === 'mapa') {
        mapRef.current.animateToRegion({
          latitude: parseFloat(res.data.conductor_lat),
          longitude: parseFloat(res.data.conductor_lng),
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 800);
      }
    } catch (err) {
      console.error('Tracking error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [pedidoId, token, vistaActual]);

  useEffect(() => {
    fetchTracking();
    pollingRef.current = setInterval(() => fetchTracking(true), POLLING_INTERVAL);
    return () => clearInterval(pollingRef.current);
  }, [fetchTracking]);

  useEffect(() => {
    if (pedido?.estado === 'entregado' || pedido?.estado === 'cancelado') {
      clearInterval(pollingRef.current);
    }
  }, [pedido?.estado]);

  useEffect(() => {
    if (pedido?.estado === 'en_camino') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.4, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [pedido?.estado]);

  // Cuando entra a vista mapa, ir donde está el conductor
  useEffect(() => {
    if (vistaActual === 'mapa' && pedido?.conductor_lat && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(
          getMapPoints(),
          { edgePadding: { top: 80, right: 60, bottom: 200, left: 60 }, animated: true }
        );
      }, 500);
    }
  }, [vistaActual]);

  const getMapPoints = () => {
    const pts = [];
    if (pedido?.productor_lat && pedido?.productor_lng)
      pts.push({ latitude: parseFloat(pedido.productor_lat), longitude: parseFloat(pedido.productor_lng) });
    if (pedido?.conductor_lat && pedido?.conductor_lng)
      pts.push({ latitude: parseFloat(pedido.conductor_lat), longitude: parseFloat(pedido.conductor_lng) });
    if (pedido?.consumidor_lat && pedido?.consumidor_lng)
      pts.push({ latitude: parseFloat(pedido.consumidor_lat), longitude: parseFloat(pedido.consumidor_lng) });
    return pts;
  };

  const estadoIndex = pedido ? (ESTADO_INDEX[pedido.estado] ?? -1) : -1;
  const esCancelado = pedido?.estado === 'cancelado';
  const enCamino = pedido?.estado === 'en_camino';
  const tieneGPS = pedido?.conductor_lat && pedido?.conductor_lng;

  const getColorEstado = (estado) => {
    if (estado === 'cancelado') return '#EF4444';
    if (estado === 'entregado') return '#22C55E';
    if (estado === 'en_camino') return '#3B82F6';
    return colors.primary;
  };

  const formatFecha = (fecha) => {
    if (!fecha) return null;
    return new Date(fecha).toLocaleString('es-BO', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading && !pedido) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[{ color: colors.textSecondary, marginTop: 12 }]}>Cargando tu pedido...</Text>
      </SafeAreaView>
    );
  }

  const estadoColor = getColorEstado(pedido?.estado);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>

      {/* ══════════ VISTA MAPA ══════════ */}
      {vistaActual === 'mapa' && (
        <View style={{ flex: 1 }}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_GOOGLE}
            initialRegion={
              tieneGPS ? {
                latitude: parseFloat(pedido.conductor_lat),
                longitude: parseFloat(pedido.conductor_lng),
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              } : {
                latitude: -17.3895, longitude: -66.1568, // Cochabamba por defecto
                latitudeDelta: 0.05, longitudeDelta: 0.05,
              }
            }
          >
            {/* 📍 Productor (origen) */}
            {pedido?.productor_lat && pedido?.productor_lng && (
              <Marker
                coordinate={{
                  latitude: parseFloat(pedido.productor_lat),
                  longitude: parseFloat(pedido.productor_lng),
                }}
                title={pedido.productor_nombre || 'Productor'}
                description="Punto de origen"
              >
                <View style={styles.markerProductor}>
                  <Ionicons name="storefront" size={18} color="#fff" />
                </View>
              </Marker>
            )}

            {/* 🚴 Conductor (en movimiento) */}
            {tieneGPS && (
              <Marker
                coordinate={{
                  latitude: parseFloat(pedido.conductor_lat),
                  longitude: parseFloat(pedido.conductor_lng),
                }}
                title={pedido.repartidor_nombre || 'Conductor'}
                description="Tu pedido está en camino"
              >
                <Animated.View style={[styles.markerConductor, { transform: [{ scale: pulseAnim }] }]}>
                  <Ionicons name="bicycle" size={20} color="#fff" />
                </Animated.View>
              </Marker>
            )}

            {/* 🏠 Consumidor (destino) */}
            {pedido?.consumidor_lat && pedido?.consumidor_lng && (
              <Marker
                coordinate={{
                  latitude: parseFloat(pedido.consumidor_lat),
                  longitude: parseFloat(pedido.consumidor_lng),
                }}
                title="Tu dirección"
                description={pedido.consumidor_direccion || 'Destino'}
              >
                <View style={styles.markerConsumidor}>
                  <Ionicons name="home" size={18} color="#fff" />
                </View>
              </Marker>
            )}

            {/* Línea de ruta */}
            {getMapPoints().length >= 2 && (
              <Polyline
                coordinates={getMapPoints()}
                strokeColor="#3B82F6"
                strokeWidth={3}
                lineDashPattern={[8, 4]}
              />
            )}
          </MapView>

          {/* Header sobre el mapa */}
          <SafeAreaView style={styles.mapTopBar} edges={['top']}>
            <TouchableOpacity style={styles.mapBackBtn} onPress={() => setVistaActual('detalles')}>
              <Ionicons name="arrow-back" size={22} color="#1F2937" />
            </TouchableOpacity>
            <View style={styles.liveChip}>
              <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.liveChipText}>En vivo</Text>
            </View>
            <TouchableOpacity style={styles.mapCenterBtn} onPress={() => {
              if (mapRef.current && getMapPoints().length > 0) {
                mapRef.current.fitToCoordinates(getMapPoints(), {
                  edgePadding: { top: 80, right: 60, bottom: 200, left: 60 },
                  animated: true,
                });
              }
            }}>
              <Ionicons name="locate" size={22} color="#1F2937" />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Leyenda del mapa */}
          <View style={styles.mapLeyenda}>
            <View style={styles.leyendaItem}>
              <View style={[styles.leyendaDot, { backgroundColor: '#22C55E' }]} />
              <Text style={styles.leyendaText}>Productor</Text>
            </View>
            <View style={styles.leyendaItem}>
              <View style={[styles.leyendaDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.leyendaText}>Conductor</Text>
            </View>
            <View style={styles.leyendaItem}>
              <View style={[styles.leyendaDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.leyendaText}>Tu dirección</Text>
            </View>
          </View>

          {/* Card inferior */}
          <View style={[styles.mapBottomCard, { backgroundColor: colors.card }]}>
            <View style={styles.conductorRow}>
              <View style={[styles.conductorAvatar, { backgroundColor: '#3B82F6' + '20' }]}>
                <Ionicons name="bicycle" size={24} color="#3B82F6" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.conductorNombre, { color: colors.text }]}>
                  {pedido?.repartidor_nombre || 'Tu conductor'}
                </Text>
                <Text style={[styles.conductorSub, { color: colors.textSecondary }]}>
                  Pedido #{pedidoId} · {pedido?.codigo_retiro}
                </Text>
              </View>
            </View>
            <View style={[styles.actualizandoRow, { backgroundColor: colors.surface }]}>
              <Ionicons name="refresh-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.actualizandoText, { color: colors.textSecondary }]}>
                Ubicación en tiempo real · cada 5 seg
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* ══════════ VISTA DETALLES ══════════ */}
      {vistaActual === 'detalles' && (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Seguimiento del pedido</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {/* Botón mapa — solo cuando está en camino y tiene GPS */}
              {enCamino && tieneGPS && (
                <TouchableOpacity
                  style={styles.mapChip}
                  onPress={() => setVistaActual('mapa')}
                >
                  <Ionicons name="map" size={14} color="#fff" />
                  <Text style={styles.mapChipText}>Ver mapa</Text>
                </TouchableOpacity>
              )}
              {!esCancelado && pedido?.estado !== 'entregado' && (
                <View style={styles.liveBadge}>
                  <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
                  <Text style={styles.liveText}>En vivo</Text>
                </View>
              )}
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* Código */}
            <View style={[styles.codigoCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
                <Text style={[{ fontSize: 13, color: colors.textSecondary }]}>Código de tu pedido</Text>
              </View>
              <Text style={[styles.codigoCodigo, { color: colors.primary }]}>
                {pedido?.codigo_retiro || '---'}
              </Text>
              <Text style={[{ fontSize: 12, color: colors.textSecondary, textAlign: 'center' }]}>
                El productor usa este código para entregar al conductor
              </Text>
            </View>

            {/* Estado actual */}
            {esCancelado ? (
              <View style={[styles.estadoCard, { backgroundColor: '#FEF2F2', borderColor: '#EF4444' }]}>
                <Ionicons name="close-circle" size={32} color="#EF4444" />
                <Text style={[styles.estadoCardTitle, { color: '#EF4444' }]}>Pedido cancelado</Text>
              </View>
            ) : (
              <View style={[styles.estadoCard, { backgroundColor: colors.card, borderColor: estadoColor }]}>
                <Animated.View style={{ transform: [{ scale: enCamino ? pulseAnim : 1 }] }}>
                  <Ionicons name={ESTADOS[estadoIndex]?.icono || 'time-outline'} size={36} color={estadoColor} />
                </Animated.View>
                <Text style={[styles.estadoCardTitle, { color: estadoColor }]}>
                  {ESTADOS[estadoIndex]?.label || pedido?.estado}
                </Text>
                {pedido?.fecha_recogida && (
                  <Text style={[{ fontSize: 12, color: colors.textSecondary }]}>
                    Recogido: {formatFecha(pedido.fecha_recogida)}
                  </Text>
                )}
                {/* Mini mapa preview cuando está en camino */}
                {enCamino && tieneGPS && (
                  <TouchableOpacity
                    style={styles.miniMapBtn}
                    onPress={() => setVistaActual('mapa')}
                  >
                    <Ionicons name="map-outline" size={16} color="#3B82F6" />
                    <Text style={styles.miniMapText}>Ver conductor en el mapa →</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Timeline */}
            {!esCancelado && (
              <View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Progreso del pedido</Text>
                {ESTADOS.map((estado, index) => {
                  const completado = index <= estadoIndex;
                  const esActual = index === estadoIndex;
                  const esUltimo = index === ESTADOS.length - 1;
                  return (
                    <View key={estado.key} style={styles.timelineItem}>
                      {!esUltimo && (
                        <View style={[styles.timelineLine, {
                          backgroundColor: completado && !esActual ? colors.primary : colors.border,
                        }]} />
                      )}
                      <View style={[styles.timelineCircle, {
                        backgroundColor: completado ? colors.primary : colors.card,
                        borderColor: completado ? colors.primary : colors.border,
                        borderWidth: 2,
                      }]}>
                        {completado && <Ionicons name={esActual ? estado.icono : 'checkmark'} size={13} color="#fff" />}
                      </View>
                      <View style={{ flex: 1, paddingBottom: 8 }}>
                        <Text style={[{
                          fontSize: 14,
                          color: completado ? colors.text : colors.textSecondary,
                          fontWeight: esActual ? '600' : '400',
                        }]}>{estado.label}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Conductor */}
            {pedido?.repartidor_nombre && (
              <View style={[styles.conductorCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Tu conductor</Text>
                <View style={styles.conductorRow}>
                  <View style={[styles.conductorAvatar, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="bicycle" size={24} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.conductorNombre, { color: colors.text }]}>{pedido.repartidor_nombre}</Text>
                    {pedido.repartidor_telefono && (
                      <Text style={[styles.conductorSub, { color: colors.textSecondary }]}>{pedido.repartidor_telefono}</Text>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Entregado */}
            {pedido?.estado === 'entregado' && (
              <View style={[styles.entregadoBanner, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={[{ fontSize: 14, fontWeight: '500', color: '#16A34A' }]}>
                  ¡Entregado el {formatFecha(pedido.fecha_entrega_real)}!
                </Text>
              </View>
            )}

            {!esCancelado && pedido?.estado !== 'entregado' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <Ionicons name="refresh-outline" size={13} color={colors.textSecondary} />
                <Text style={[{ fontSize: 12, color: colors.textSecondary }]}>
                  Se actualiza automáticamente cada 5 segundos
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Mapa
  mapTopBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 8,
  },
  mapBackBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
  },
  mapCenterBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
  },
  liveChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  liveChipText: { fontSize: 13, color: '#22C55E', fontWeight: '600' },
  mapLeyenda: {
    position: 'absolute', top: 100, right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 10, padding: 10, gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3,
  },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leyendaDot: { width: 10, height: 10, borderRadius: 5 },
  leyendaText: { fontSize: 11, color: '#374151', fontWeight: '500' },
  mapBottomCard: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10,
  },
  actualizandoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    padding: 8, borderRadius: 8, marginTop: 12,
  },
  actualizandoText: { fontSize: 12 },

  // Marcadores
  markerProductor: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#22C55E',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6,
  },
  markerConductor: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: '#3B82F6',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6,
  },
  markerConsumidor: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#EF4444',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6,
  },

  // Detalles
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '600' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  liveText: { fontSize: 12, color: '#22C55E', fontWeight: '600' },
  mapChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#3B82F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
  },
  mapChipText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  scrollContent: { padding: 16, gap: 14, paddingBottom: 40 },

  codigoCard: { borderRadius: 14, borderWidth: 1, padding: 16, alignItems: 'center', gap: 6 },
  codigoCodigo: { fontSize: 28, fontWeight: '700', letterSpacing: 3 },

  estadoCard: { borderRadius: 14, borderWidth: 2, padding: 20, alignItems: 'center', gap: 8 },
  estadoCardTitle: { fontSize: 20, fontWeight: '700' },
  miniMapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 4, padding: 8, borderRadius: 8, backgroundColor: '#EFF6FF',
  },
  miniMapText: { fontSize: 14, color: '#3B82F6', fontWeight: '500' },

  timelineCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  timelineItem: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingLeft: 8, minHeight: 44, position: 'relative',
  },
  timelineLine: { position: 'absolute', left: 19, top: 28, width: 2, height: 32 },
  timelineCircle: {
    width: 26, height: 26, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14, marginTop: 2,
  },

  conductorCard: { borderRadius: 14, borderWidth: 1, padding: 16 },
  conductorRow: { flexDirection: 'row', alignItems: 'center' },
  conductorAvatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  conductorNombre: { fontSize: 16, fontWeight: '600' },
  conductorSub: { fontSize: 13, marginTop: 2 },

  entregadoBanner: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, padding: 12, borderRadius: 10,
  },
});

export default TrackingPedidoScreen;