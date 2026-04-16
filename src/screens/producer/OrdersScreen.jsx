// src/screens/producer/OrdersScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, TextInput, Alert, Modal, Animated, Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePedidosMonitor } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';
import { orderService } from '../../api/services';
import { Card, CardBody } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/Loading';
import { SPACING, BORDER_RADIUS } from '../../constants/theme';

const ORDER_STATES = {
  pendiente:          { label: 'Pendiente',          color: '#f59e0b', icon: 'time-outline',            bgColor: 'rgba(245,158,11,0.1)'  },
  confirmado:         { label: 'Confirmado',          color: '#3b82f6', icon: 'checkmark-circle-outline', bgColor: 'rgba(59,130,246,0.1)'  },
  preparando:         { label: 'En Preparación',      color: '#8b5cf6', icon: 'construct-outline',        bgColor: 'rgba(139,92,246,0.1)'  },
  listo_para_recoger: { label: 'Listo para recoger',  color: '#f97316', icon: 'bag-check-outline',        bgColor: 'rgba(249,115,22,0.1)'  },
  en_camino:          { label: 'En Camino',            color: '#14b8a6', icon: 'bicycle-outline',          bgColor: 'rgba(20,184,166,0.1)'  },
  entregado:          { label: 'Entregado',            color: '#22c55e', icon: 'checkmark-done-outline',   bgColor: 'rgba(34,197,94,0.1)'   },
  cancelado:          { label: 'Cancelado',            color: '#ef4444', icon: 'close-circle-outline',     bgColor: 'rgba(239,68,68,0.1)'   },
};

const FILTER_OPTIONS = [
  { value: 'todos',             label: 'Todos'             },
  { value: 'pendiente',         label: 'Pendientes'        },
  { value: 'confirmado',        label: 'Confirmados'       },
  { value: 'preparando',        label: 'En Preparación'    },
  { value: 'listo_para_recoger',label: 'Listos para recoger'},
  { value: 'en_camino',         label: 'En Camino'         },
  { value: 'entregado',         label: 'Entregados'        },
];

const OrdersScreen = () => {
  const { colors } = useTheme();
  const { pedidos: pedidosMonitor, nuevoPedido, loading, stats, refresh, lastUpdate } = usePedidosMonitor(true);

  const [pedidos, setPedidos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNewOrderBanner, setShowNewOrderBanner] = useState(false);
  const bannerAnim = useState(new Animated.Value(-100))[0];

  useEffect(() => {
    setPedidos(pedidosMonitor);
    // ✅ Actualizar selectedPedido si está abierto
    if (selectedPedido) {
      const actualizado = pedidosMonitor.find(p => p.id === selectedPedido.id);
      if (actualizado) setSelectedPedido(actualizado);
    }
  }, [pedidosMonitor]);

  useEffect(() => {
    if (nuevoPedido) {
      setShowNewOrderBanner(true);
      Vibration.vibrate([0, 250, 100, 250]);
      Animated.spring(bannerAnim, { toValue: 0, useNativeDriver: true, tension: 50, friction: 7 }).start();
      const timer = setTimeout(() => hideBanner(), 5000);
      return () => clearTimeout(timer);
    }
  }, [nuevoPedido]);

  const hideBanner = () => {
    Animated.timing(bannerAnim, { toValue: -100, duration: 300, useNativeDriver: true })
      .start(() => setShowNewOrderBanner(false));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleCambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await orderService.cambiarEstado(pedidoId, nuevoEstado);

      // ✅ Actualizar state local y selectedPedido
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, estado: nuevoEstado } : p));
      setSelectedPedido(prev => prev?.id === pedidoId ? { ...prev, estado: nuevoEstado } : prev);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('✅ Estado Actualizado', `El pedido ahora está: ${ORDER_STATES[nuevoEstado]?.label || nuevoEstado}`);
      setShowDetailModal(false);

      // Refrescar para obtener codigo_retiro actualizado
      setTimeout(() => refresh(), 1000);
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'No se pudo actualizar el estado del pedido');
    }
  };

  const filteredPedidos = pedidos.filter((pedido) => {
    if (statusFilter !== 'todos' && pedido.estado !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return pedido.numero.toLowerCase().includes(query) || pedido.cliente.nombre.toLowerCase().includes(query);
    }
    return true;
  });

  const countByStatus = {
    pendiente:         stats.pendientes,
    confirmado:        stats.confirmados,
    preparando:        stats.preparando,
    listo_para_recoger:stats.listoParaRecoger,
    en_camino:         stats.enCamino,
    entregado:         stats.entregados,
  };

  // ✅ Siempre usar el pedido más actualizado del state
  const openDetail = (pedido) => {
    const pedidoActualizado = pedidos.find(p => p.id === pedido.id) || pedido;
    setSelectedPedido(pedidoActualizado);
    setShowDetailModal(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {showNewOrderBanner && nuevoPedido && (
        <Animated.View style={[styles.newOrderBanner, { transform: [{ translateY: bannerAnim }] }]}>
          <TouchableOpacity style={styles.newOrderBannerContent} onPress={() => { hideBanner(); setStatusFilter('pendiente'); }} activeOpacity={0.9}>
            <View style={styles.newOrderIcon}><Ionicons name="cart" size={24} color="#fff" /></View>
            <View style={styles.newOrderInfo}>
              <Text style={styles.newOrderTitle}>🎉 ¡Nuevo Pedido!</Text>
              <Text style={styles.newOrderText}>{nuevoPedido.cliente?.nombre} - Bs. {nuevoPedido.total?.toFixed(2)}</Text>
            </View>
            <TouchableOpacity onPress={hideBanner} style={styles.closeBannerBtn}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Pedidos</Text>
          <View style={styles.headerSubtitleRow}>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {countByStatus.pendiente} pendiente{countByStatus.pendiente !== 1 ? 's' : ''}
            </Text>
            {lastUpdate && (
              <Text style={[styles.lastUpdateText, { color: colors.textSecondary }]}>
                • Actualizado {lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity style={[styles.refreshButton, { backgroundColor: colors.surface }, refreshing && styles.refreshButtonActive]} onPress={onRefresh}>
          <Ionicons name={refreshing ? "sync" : "refresh-outline"} size={24} color={refreshing ? colors.primary : colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryScroll} contentContainerStyle={styles.summaryContent}>
        {[
          { icon: 'time',             label: 'Pendientes',  value: countByStatus.pendiente,          color: '#f59e0b', filter: 'pendiente'          },
          { icon: 'checkmark-circle', label: 'Confirmados', value: countByStatus.confirmado,         color: '#3b82f6', filter: 'confirmado'         },
          { icon: 'construct',        label: 'Preparando',  value: countByStatus.preparando,         color: '#8b5cf6', filter: 'preparando'         },
          { icon: 'bag-check',        label: 'Para recoger',value: countByStatus.listo_para_recoger, color: '#f97316', filter: 'listo_para_recoger' },
          { icon: 'bicycle',          label: 'En Camino',   value: countByStatus.en_camino,          color: '#14b8a6', filter: 'en_camino'          },
          { icon: 'checkmark-done',   label: 'Entregados',  value: countByStatus.entregado,          color: '#22c55e', filter: 'entregado'          },
        ].map((item) => (
          <SummaryCard key={item.filter} {...item} active={statusFilter === item.filter}
            onPress={() => setStatusFilter(statusFilter === item.filter ? 'todos' : item.filter)} colors={colors} />
        ))}
      </ScrollView>

      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput style={[styles.searchInput, { color: colors.text }]} placeholder="Buscar pedido o cliente..."
            placeholderTextColor={colors.textSecondary} value={searchQuery} onChangeText={setSearchQuery} />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.surface }]} onPress={() => setShowFilterModal(true)}>
          <Ionicons name="filter-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando pedidos...</Text>
          </View>
        ) : filteredPedidos.length > 0 ? (
          filteredPedidos.map((pedido) => (
            <OrderCard key={pedido.id} pedido={pedido} onPress={() => openDetail(pedido)} onConfirmar={handleCambiarEstado} colors={colors} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No hay pedidos</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {statusFilter !== 'todos' ? `No hay pedidos con estado "${ORDER_STATES[statusFilter]?.label || statusFilter}"` : 'Aún no tienes pedidos recibidos'}
            </Text>
            {statusFilter !== 'todos' && (
              <TouchableOpacity style={[styles.clearFilterButton, { backgroundColor: colors.primary }]} onPress={() => setStatusFilter('todos')}>
                <Text style={styles.clearFilterText}>Ver todos</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal Filtros */}
      <Modal visible={showFilterModal} transparent animationType="slide" onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filtrar por Estado</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
            </View>
            {FILTER_OPTIONS.map((option) => (
              <TouchableOpacity key={option.value}
                style={[styles.filterOption, { borderBottomColor: colors.border }, statusFilter === option.value && styles.filterOptionActive]}
                onPress={() => { setStatusFilter(option.value); setShowFilterModal(false); }}>
                <Text style={[styles.filterOptionText, { color: colors.text }, statusFilter === option.value && { color: colors.primary, fontWeight: '500' }]}>
                  {option.label}
                </Text>
                {statusFilter === option.value && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Modal Detalle */}
      <Modal visible={showDetailModal} transparent animationType="slide" onRequestClose={() => setShowDetailModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.detailModalContent, { backgroundColor: colors.surface }]}>
            {selectedPedido && (
              <OrderDetail pedido={selectedPedido} onClose={() => setShowDetailModal(false)} onCambiarEstado={handleCambiarEstado} colors={colors} />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const SummaryCard = ({ icon, label, value, color, active, onPress, colors }) => (
  <TouchableOpacity style={[styles.summaryCard, { backgroundColor: colors.surface }, active && { borderColor: color, borderWidth: 2 }]} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.summaryIcon, { backgroundColor: `${color}20` }]}><Ionicons name={icon} size={18} color={color} /></View>
    <Text style={[styles.summaryValue, { color: colors.text }]}>{value}</Text>
    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{label}</Text>
  </TouchableOpacity>
);

const OrderCard = ({ pedido, onPress, onConfirmar, colors }) => {
  const estadoInfo = ORDER_STATES[pedido.estado] || ORDER_STATES.pendiente;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Card style={styles.orderCard}>
        <CardBody>
          <View style={styles.orderHeader}>
            <View>
              <Text style={[styles.orderNumber, { color: colors.text }]}>{pedido.numero}</Text>
              <Text style={[styles.orderDate, { color: colors.textSecondary }]}>{pedido.fecha}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: estadoInfo.bgColor }]}>
              <Ionicons name={estadoInfo.icon} size={14} color={estadoInfo.color} />
              <Text style={[styles.statusText, { color: estadoInfo.color }]}>{estadoInfo.label}</Text>
            </View>
          </View>
          <View style={styles.orderBody}>
            <View style={styles.clientInfo}>
              <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.clientName, { color: colors.textSecondary }]}>{pedido.cliente.nombre}</Text>
            </View>
            <Text style={[styles.orderTotal, { color: colors.primary }]}>Bs. {pedido.total.toFixed(2)}</Text>
          </View>
          {pedido.estado === 'pendiente' && (
            <View style={styles.quickActions}>
              <TouchableOpacity style={[styles.actionButton, styles.confirmButton]} onPress={() => onConfirmar(pedido.id, 'confirmado')}>
                <Ionicons name="checkmark" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => onConfirmar(pedido.id, 'cancelado')}>
                <Ionicons name="close" size={18} color="#ef4444" />
                <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}
          {pedido.estado === 'confirmado' && (
            <TouchableOpacity style={[styles.actionButton, styles.prepareButton]} onPress={() => onConfirmar(pedido.id, 'preparando')}>
              <Ionicons name="construct-outline" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Iniciar Preparación</Text>
            </TouchableOpacity>
          )}
          {pedido.estado === 'preparando' && (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#f97316' }]} onPress={() => onConfirmar(pedido.id, 'listo_para_recoger')}>
              <Ionicons name="bag-check-outline" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Listo para recoger</Text>
            </TouchableOpacity>
          )}
          {pedido.estado === 'en_camino' && (
            <TouchableOpacity style={[styles.actionButton, styles.deliverButton]} onPress={() => onConfirmar(pedido.id, 'entregado')}>
              <Ionicons name="checkmark-done-outline" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Marcar Entregado</Text>
            </TouchableOpacity>
          )}
        </CardBody>
      </Card>
    </TouchableOpacity>
  );
};

const OrderDetail = ({ pedido, onClose, onCambiarEstado, colors }) => {
  const estadoInfo = ORDER_STATES[pedido.estado] || ORDER_STATES.pendiente;
  const getNextState = () => {
    switch (pedido.estado) {
      case 'pendiente':          return 'confirmado';
      case 'confirmado':         return 'preparando';
      case 'preparando':         return 'listo_para_recoger';
      case 'listo_para_recoger': return 'en_camino';
      case 'en_camino':          return 'entregado';
      default:                   return null;
    }
  };
  const nextState = getNextState();

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.detailHeader}>
        <View>
          <Text style={[styles.detailNumber, { color: colors.text }]}>{pedido.numero}</Text>
          <Text style={[styles.detailDate, { color: colors.textSecondary }]}>{pedido.fecha}</Text>
        </View>
        <TouchableOpacity onPress={onClose}><Ionicons name="close" size={28} color={colors.text} /></TouchableOpacity>
      </View>

      <View style={[styles.currentStatus, { backgroundColor: estadoInfo.bgColor }]}>
        <Ionicons name={estadoInfo.icon} size={24} color={estadoInfo.color} />
        <Text style={[styles.currentStatusText, { color: estadoInfo.color }]}>{estadoInfo.label}</Text>
      </View>

      {/* ✅ Código de retiro destacado */}
      {pedido.codigo_retiro && (
        <View style={[styles.codigoRetiroBox, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
          <Ionicons name="key-outline" size={22} color="#3B82F6" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ fontSize: 11, color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' }}>
              Código para el conductor:
            </Text>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#3B82F6', letterSpacing: 4, marginTop: 2 }}>
              {pedido.codigo_retiro}
            </Text>
            <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
              Pega este código en el paquete
            </Text>
          </View>
        </View>
      )}

      <View style={styles.detailSection}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Cliente</Text>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.text }]}>{pedido.cliente.nombre}</Text>
        </View>
        {pedido.cliente.telefono && (
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.text }]}>{pedido.cliente.telefono}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.text }]}>{pedido.cliente.direccion}</Text>
        </View>
      </View>

      <View style={styles.detailSection}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Envío</Text>
        <View style={styles.infoRow}>
          <Ionicons name="car-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.text }]}>{pedido.metodoEnvio}</Text>
        </View>
      </View>

      <View style={[styles.totalSection, { backgroundColor: colors.background }]}>
        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total</Text>
        <Text style={[styles.totalValue, { color: colors.primary }]}>Bs. {pedido.total.toFixed(2)}</Text>
      </View>

      {pedido.notas && (
        <View style={styles.detailSection}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Notas</Text>
          <Text style={[styles.notesText, { color: colors.textSecondary }]}>{pedido.notas}</Text>
        </View>
      )}

      {nextState && (
        <TouchableOpacity style={[styles.mainActionButton, { backgroundColor: ORDER_STATES[nextState]?.color }]} onPress={() => onCambiarEstado(pedido.id, nextState)}>
          <Ionicons name={ORDER_STATES[nextState]?.icon} size={22} color="#fff" />
          <Text style={styles.mainActionText}>Cambiar a: {ORDER_STATES[nextState]?.label}</Text>
        </TouchableOpacity>
      )}

      {pedido.estado !== 'entregado' && pedido.estado !== 'cancelado' && (
        <TouchableOpacity style={styles.cancelOrderButton} onPress={() => onCambiarEstado(pedido.id, 'cancelado')}>
          <Ionicons name="close-circle-outline" size={20} color="#ef4444" />
          <Text style={styles.cancelOrderText}>Cancelar Pedido</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 14 },
  headerSubtitleRow: { flexDirection: 'row', alignItems: 'center' },
  lastUpdateText: { fontSize: 12, marginLeft: 4 },
  refreshButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  refreshButtonActive: { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
  newOrderBanner: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, paddingHorizontal: SPACING.md, paddingTop: SPACING.md },
  newOrderBannerContent: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#22c55e', borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, elevation: 8 },
  newOrderIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  newOrderInfo: { flex: 1, marginLeft: SPACING.md },
  newOrderTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  newOrderText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 2 },
  closeBannerBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  summaryScroll: { maxHeight: 100 },
  summaryContent: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  summaryCard: { borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, alignItems: 'center', minWidth: 80, borderWidth: 1, borderColor: 'transparent' },
  summaryIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: 'bold' },
  summaryLabel: { fontSize: 10 },
  searchContainer: { flexDirection: 'row', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, gap: SPACING.sm },
  searchInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, gap: SPACING.sm },
  searchInput: { flex: 1, height: 44, fontSize: 14 },
  filterButton: { width: 44, height: 44, borderRadius: BORDER_RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 100 },
  loadingContainer: { alignItems: 'center', padding: SPACING.xl },
  loadingText: { marginTop: SPACING.md },
  emptyContainer: { alignItems: 'center', padding: SPACING.xl },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: SPACING.md },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: SPACING.sm },
  clearFilterButton: { marginTop: SPACING.md, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.md },
  clearFilterText: { color: '#fff', fontWeight: '500' },
  orderCard: { marginBottom: SPACING.md },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  orderNumber: { fontSize: 16, fontWeight: '600' },
  orderDate: { fontSize: 12, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '500' },
  orderBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  clientInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clientName: { fontSize: 14 },
  orderTotal: { fontSize: 18, fontWeight: 'bold' },
  quickActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.md },
  actionButtonText: { color: '#fff', fontWeight: '500', fontSize: 13 },
  confirmButton: { backgroundColor: '#22c55e' },
  cancelButton: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  prepareButton: { backgroundColor: '#8b5cf6' },
  shipButton: { backgroundColor: '#14b8a6' },
  deliverButton: { backgroundColor: '#22c55e' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.lg, maxHeight: '70%' },
  detailModalContent: { maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  filterOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1 },
  filterOptionActive: { backgroundColor: 'rgba(59,130,246,0.1)', marginHorizontal: -SPACING.lg, paddingHorizontal: SPACING.lg },
  filterOptionText: { fontSize: 16 },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  detailNumber: { fontSize: 24, fontWeight: 'bold' },
  detailDate: { fontSize: 14 },
  currentStatus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.md },
  currentStatusText: { fontSize: 16, fontWeight: '600' },
  // ✅ Estilo para el código de retiro
  codigoRetiroBox: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: SPACING.lg },
  detailSection: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 12, fontWeight: '600', marginBottom: SPACING.sm, textTransform: 'uppercase' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: 6 },
  infoText: { fontSize: 14, flex: 1 },
  totalSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.lg },
  totalLabel: { fontSize: 16, fontWeight: '500' },
  totalValue: { fontSize: 24, fontWeight: 'bold' },
  notesText: { fontSize: 14, fontStyle: 'italic' },
  mainActionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.md },
  mainActionText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelOrderButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md },
  cancelOrderText: { color: '#ef4444', fontSize: 14 },
});

export default OrdersScreen;