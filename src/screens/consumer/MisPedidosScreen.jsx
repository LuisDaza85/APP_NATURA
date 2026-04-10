// src/screens/consumer/MisPedidosScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios.config';

const MisPedidosScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const statusOptions = [
    { value: 'todos', label: 'Todos' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'confirmado', label: 'Confirmado' },
    { value: 'en_camino', label: 'En camino' },
    { value: 'entregado', label: 'Entregado' },
    { value: 'cancelado', label: 'Cancelado' },
  ];

  const fetchPedidos = async () => {
    try {
      const response = await api.get('/pedidos');
      const data = response.data.data || response.data || [];

      const pedidosConItems = data.map((pedido) => ({
        id: `PED-${pedido.id}`,
        rawId: pedido.id,
        date: new Date(pedido.fecha_pedido).toLocaleDateString('es-BO'),
        status: pedido.estado,
        total: parseFloat(pedido.total),
        items: Array.isArray(pedido.items)
          ? pedido.items.map((item) => ({
              id: item.producto_id,
              name: item.nombre || 'Producto',
              quantity: item.cantidad,
              price: parseFloat(item.precio_unitario || 0),
              image: item.imagen || null,
            }))
          : [],
        shipping: {
          method: pedido.metodo_envio || 'Entrega a domicilio',
          address: pedido.direccion || 'Ver detalles',
          cost: parseFloat(pedido.costo_envio || 5.0),
        },
        payment: {
          method: pedido.metodo_pago || 'Tarjeta',
          status: pedido.estado === 'entregado' ? 'Pagado' : 'Pendiente',
        },
      }));

      setOrders(pedidosConItems);
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPedidos();
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'todos' && order.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(query) ||
        order.items.some((item) => item.name.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'entregado':
        return { bg: '#D1FAE5', text: '#065F46', icon: 'checkmark-circle' };
      case 'en_camino':
        return { bg: '#DBEAFE', text: '#1E40AF', icon: 'bicycle' };
      case 'confirmado':
      case 'preparando':
      case 'listo_para_recoger':
        return { bg: '#EDE9FE', text: '#5B21B6', icon: 'cube' };
      case 'pendiente':
        return { bg: '#FEF3C7', text: '#92400E', icon: 'time' };
      case 'cancelado':
        return { bg: '#FEE2E2', text: '#991B1B', icon: 'close-circle' };
      default:
        return { bg: '#F3F4F6', text: '#374151', icon: 'document-text' };
    }
  };

  // ✅ Estados que permiten ver el tracking
  const puedeVerTracking = (status) => {
    return ['pendiente', 'confirmado', 'preparando', 'listo_para_recoger', 'en_camino'].includes(status);
  };

  const renderOrderCard = (order) => {
    const statusStyle = getStatusStyle(order.status);
    const isExpanded = expandedOrder === order.id;

    return (
      <View key={order.id} style={styles.orderCard}>
        {/* Header del pedido */}
        <TouchableOpacity
          style={styles.orderHeader}
          onPress={() => setExpandedOrder(isExpanded ? null : order.id)}
          activeOpacity={0.7}
        >
          <View style={styles.orderHeaderLeft}>
            <View style={[styles.statusIconContainer, { backgroundColor: statusStyle.bg }]}>
              <Ionicons name={statusStyle.icon} size={20} color={statusStyle.text} />
            </View>
            <View>
              <Text style={styles.orderId}>{order.id}</Text>
              <Text style={styles.orderDate}>{order.date}</Text>
            </View>
          </View>
          <View style={styles.orderHeaderRight}>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {order.status.replace(/_/g, ' ')}
              </Text>
            </View>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </View>
        </TouchableOpacity>

        {/* ✅ BOTÓN DE TRACKING — aparece cuando el pedido está activo */}
        {puedeVerTracking(order.status) && (
          <TouchableOpacity
            style={styles.trackingButton}
            onPress={() => navigation.navigate('TrackingPedido', { pedidoId: order.rawId })}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate" size={16} color="#fff" />
            <Text style={styles.trackingButtonText}>
              {order.status === 'en_camino' ? '🚴 Ver en tiempo real' : 'Seguir pedido'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Items preview */}
        <View style={styles.itemsPreview}>
          {order.items.slice(0, 2).map((item, idx) => (
            <View key={idx} style={styles.itemPreviewRow}>
              <Text style={styles.itemPreviewText} numberOfLines={1}>
                {item.quantity}x {item.name}
              </Text>
              <Text style={styles.itemPreviewPrice}>
                Bs {(item.quantity * item.price).toFixed(2)}
              </Text>
            </View>
          ))}
          {order.items.length > 2 && (
            <Text style={styles.moreItems}>+{order.items.length - 2} más</Text>
          )}
        </View>

        {/* Total */}
        <View style={styles.orderFooter}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>Bs {order.total.toFixed(2)}</Text>
        </View>

        {/* Detalles expandidos */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Productos</Text>
            {order.items.map((item, idx) => (
              <View key={idx} style={styles.itemDetailRow}>
                <Image
                  source={{ uri: item.image || 'https://via.placeholder.com/60' }}
                  style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>
                    {item.quantity} x Bs {item.price.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  Bs {(item.quantity * item.price).toFixed(2)}
                </Text>
              </View>
            ))}

            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  Bs {(order.total - order.shipping.cost).toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Envío</Text>
                <Text style={styles.summaryValue}>Bs {order.shipping.cost.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>Bs {order.total.toFixed(2)}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Información de envío</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="car-outline" size={18} color="#6B7280" />
                <Text style={styles.infoText}>{order.shipping.method}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={18} color="#6B7280" />
                <Text style={styles.infoText}>{order.shipping.address}</Text>
              </View>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="document-text-outline" size={18} color="#3B82F6" />
                <Text style={styles.actionButtonText}>Ver factura</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={18} color="#3B82F6" />
                <Text style={styles.actionButtonText}>Soporte</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mis Pedidos</Text>
          <Text style={styles.headerSubtitle}>Historial y seguimiento de tus compras</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar pedidos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {statusFilter !== 'todos' && (
        <View style={styles.activeFilter}>
          <Text style={styles.activeFilterText}>
            Filtro: {statusOptions.find((s) => s.value === statusFilter)?.label}
          </Text>
          <TouchableOpacity onPress={() => setStatusFilter('todos')}>
            <Ionicons name="close" size={18} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.ordersList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />
        }
      >
        {filteredOrders.length > 0 ? (
          filteredOrders.map(renderOrderCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No se encontraron pedidos</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || statusFilter !== 'todos'
                ? 'Intenta con otros filtros'
                : 'Aún no has realizado ningún pedido'}
            </Text>
            {(searchQuery || statusFilter !== 'todos') && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => { setSearchQuery(''); setStatusFilter('todos'); }}
              >
                <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar por estado</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  statusFilter === option.value && styles.filterOptionActive,
                ]}
                onPress={() => { setStatusFilter(option.value); setShowFilterModal(false); }}
              >
                <Text style={[
                  styles.filterOptionText,
                  statusFilter === option.value && styles.filterOptionTextActive,
                ]}>
                  {option.label}
                </Text>
                {statusFilter === option.value && (
                  <Ionicons name="checkmark" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6B7280' },
  header: { padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  searchContainer: { flexDirection: 'row', padding: 16, paddingBottom: 8, gap: 12 },
  searchInputContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: 10, paddingHorizontal: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 15, color: '#1F2937' },
  filterButton: {
    width: 48, height: 48, backgroundColor: '#FFF', borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB',
  },
  activeFilter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#EFF6FF', marginHorizontal: 16, paddingHorizontal: 12,
    paddingVertical: 8, borderRadius: 8, marginBottom: 8,
  },
  activeFilterText: { fontSize: 14, color: '#3B82F6', fontWeight: '500' },
  ordersList: { flex: 1, paddingHorizontal: 16 },
  orderCard: {
    backgroundColor: '#FFF', borderRadius: 12, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 14,
  },
  orderHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  statusIconContainer: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  orderId: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  orderDate: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  orderHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },

  // ✅ Botón de tracking
  trackingButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#3B82F6', marginHorizontal: 14, marginBottom: 10,
    paddingVertical: 10, borderRadius: 10, gap: 6,
  },
  trackingButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  itemsPreview: { paddingHorizontal: 14, paddingBottom: 10 },
  itemPreviewRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemPreviewText: { fontSize: 13, color: '#6B7280', flex: 1, marginRight: 8 },
  itemPreviewPrice: { fontSize: 13, color: '#6B7280' },
  moreItems: { fontSize: 12, color: '#3B82F6', marginTop: 4 },
  orderFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#FAFAFA',
  },
  totalLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  expandedSection: { paddingHorizontal: 14, paddingBottom: 14 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 12, marginTop: 8 },
  itemDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  itemImage: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#F3F4F6' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  itemQuantity: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  itemTotal: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  summarySection: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 14, marginTop: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, color: '#1F2937' },
  summaryTotal: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8, marginTop: 4 },
  summaryTotalLabel: { fontSize: 15, fontWeight: 'bold', color: '#1F2937' },
  summaryTotalValue: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  infoCard: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoText: { fontSize: 14, color: '#374151', marginLeft: 10, flex: 1 },
  actionsContainer: { flexDirection: 'row', gap: 12, marginTop: 16 },
  actionButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#EFF6FF', paddingVertical: 12, borderRadius: 10, gap: 6,
  },
  actionButtonText: { fontSize: 14, fontWeight: '500', color: '#3B82F6' },
  emptyContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, textAlign: 'center' },
  clearFiltersButton: { backgroundColor: '#3B82F6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 16 },
  clearFiltersText: { color: '#FFF', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 32 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  filterOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  filterOptionActive: { backgroundColor: '#EFF6FF' },
  filterOptionText: { fontSize: 15, color: '#374151' },
  filterOptionTextActive: { color: '#3B82F6', fontWeight: '500' },
});

export default MisPedidosScreen;