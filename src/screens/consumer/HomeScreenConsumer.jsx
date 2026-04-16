// src/screens/consumer/HomeScreenConsumer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../api/axios.config';

const { width } = Dimensions.get('window');

const HomeScreenConsumer = ({ navigation }) => {
  const { user } = useAuth();
  const handleBuscar = () => navigation.navigate('Busqueda');
  const { colors } = useTheme();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, pedRes] = await Promise.all([
        api.get('/productos?limit=6').catch(() => ({ data: { data: [] } })),
        api.get('/pedidos/recientes').catch(() => ({ data: [] })), // ✅ endpoint correcto
      ]);
      setProductos(prodRes.data.data || prodRes.data || []);
      setPedidos(pedRes.data.data || pedRes.data || []);
    } catch (error) {
      // silenciar errores
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  // Pedido en_camino o activo (para el banner)
  const pedidoActivo = pedidos.find(p =>
    ['en_camino', 'listo_para_recoger', 'preparando', 'confirmado'].includes(p.estado || p.status)
  );
  const pedidoEnCamino = pedidos.find(p => (p.estado || p.status) === 'en_camino');

  const getStatusColor = (estado) => {
    const map = {
      pendiente: '#F59E0B',
      confirmado: '#3B82F6',
      preparando: '#8B5CF6',
      listo_para_recoger: '#10B981',
      en_camino: '#06B6D4',
      entregado: '#22C55E',
      cancelado: '#EF4444',
    };
    return map[estado] || '#6B7280';
  };

  const getStatusLabel = (estado) => {
    const map = {
      pendiente: 'Pendiente',
      confirmado: 'Confirmado',
      preparando: 'Preparando',
      listo_para_recoger: 'Listo',
      en_camino: 'En camino',
      entregado: 'Entregado',
      cancelado: 'Cancelado',
    };
    return map[estado] || estado;
  };

  // ✅ Estados activos que permiten ver el tracking
  const puedeVerTracking = (estado) =>
    ['pendiente', 'confirmado', 'preparando', 'listo_para_recoger', 'en_camino'].includes(estado);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Banner de bienvenida */}
      <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.welcomeBanner}>
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeTitle}>Bienvenido, {user?.nombre?.split(' ')[0] || 'Usuario'}</Text>
          <Text style={styles.welcomeSubtitle}>Descubre los mejores productos acuícolas frescos</Text>
          <TouchableOpacity style={styles.exploreButton} onPress={() => navigation.navigate('Tienda')}>
            <Ionicons name="bag-outline" size={18} color="#3B82F6" />
            <Text style={styles.exploreButtonText}>Explorar Productos</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.welcomeImage}>
          <Ionicons name="fish-outline" size={80} color="rgba(255,255,255,0.3)" />
        </View>
      </LinearGradient>

      {/* ── Banner pedido activo ── */}
      {pedidoEnCamino && (
        <TouchableOpacity
          style={styles.activeBanner}
          onPress={() => navigation.navigate('TrackingPedido', { pedidoId: pedidoEnCamino.rawId || pedidoEnCamino.id })}
          activeOpacity={0.9}
        >
          <View style={styles.activeBannerLeft}>
            <View style={styles.activePulse}>
              <Ionicons name="bicycle" size={22} color="#fff" />
            </View>
            <View>
              <Text style={styles.activeBannerTitle}>Tu pedido está en camino</Text>
              <Text style={styles.activeBannerSub}>Toca para ver el mapa en tiempo real</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      )}

      {/* Banner pedido pendiente/preparando */}
      {!pedidoEnCamino && pedidoActivo && (
        <TouchableOpacity
          style={[styles.activeBanner, { backgroundColor: '#3b82f6' }]}
          onPress={() => navigation.navigate('MisPedidos')}
          activeOpacity={0.9}
        >
          <View style={styles.activeBannerLeft}>
            <View style={[styles.activePulse, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
              <Ionicons name="time-outline" size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.activeBannerTitle}>Pedido en proceso</Text>
              <Text style={styles.activeBannerSub}>{getStatusLabel(pedidoActivo.estado || pedidoActivo.status)}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      )}

      {/* Features */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuresContainer}>
        {[
          { icon: 'fish-outline', color: '#3B82F6', bg: '#EFF6FF', title: 'Productos Frescos', desc: 'De productores locales' },
          { icon: 'leaf-outline', color: '#22C55E', bg: '#F0FDF4', title: 'Sostenible', desc: 'Cultivo responsable' },
          { icon: 'time-outline', color: '#F59E0B', bg: '#FEF3C7', title: 'Entrega Rápida', desc: '24-48 horas' },
        ].map((f, i) => (
          <View key={i} style={[styles.featureCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.featureIcon, { backgroundColor: f.bg }]}>
              <Ionicons name={f.icon} size={24} color={f.color} />
            </View>
            <Text style={[styles.featureTitle, { color: colors.text }]}>{f.title}</Text>
            <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{f.desc}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Productos destacados */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Productos Destacados</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Tienda')}>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {productos.length > 0 ? productos.slice(0, 6).map((producto) => (
            <TouchableOpacity
              key={producto.id}
              style={[styles.productCard, { backgroundColor: colors.surface }]}
              onPress={() => navigation.navigate('DetalleProducto', { id: producto.id })}
            >
              <View style={styles.productImageContainer}>
                {producto.imagen_url ? (
                  <Image source={{ uri: producto.imagen_url }} style={styles.productImage} />
                ) : (
                  <View style={[styles.productImagePlaceholder, { backgroundColor: colors.surfaceVariant }]}>
                    <Ionicons name="fish-outline" size={40} color={colors.textMuted} />
                  </View>
                )}
                <TouchableOpacity style={styles.favoriteButton}>
                  <Ionicons name="heart-outline" size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>{producto.nombre}</Text>
                <Text style={[styles.productCategory, { color: colors.textSecondary }]}>{producto.categoria || 'Pescado Fresco'}</Text>
                <View style={styles.productFooter}>
                  <Text style={styles.productPrice}>Bs {parseFloat(producto.precio || 0).toFixed(2)}</Text>
                  <TouchableOpacity style={styles.addToCartButton}>
                    <Ionicons name="add" size={18} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )) : (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <Ionicons name="fish-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay productos disponibles</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Pedidos recientes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Pedidos Recientes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MisPedidos')}>
            <Text style={styles.seeAll}>Ver historial</Text>
          </TouchableOpacity>
        </View>

        {pedidos.length > 0 ? pedidos.slice(0, 3).map((pedido) => (
          <View key={pedido.id} style={[styles.orderCard, { backgroundColor: colors.surface }]}>
            <View style={styles.orderCardTop}>
              <View style={[styles.orderIcon, { backgroundColor: colors.surfaceVariant }]}>
                <Ionicons name="bag-outline" size={20} color={colors.textSecondary} />
              </View>
              <View style={styles.orderInfo}>
                <Text style={[styles.orderNumber, { color: colors.text }]}>Pedido #{pedido.id}</Text>
                <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
                  {new Date(pedido.date || pedido.fecha_pedido).toLocaleDateString('es-BO')}
                </Text>
              </View>
              <View style={styles.orderRight}>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(pedido.status || pedido.estado)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(pedido.status || pedido.estado) }]}>
                    {getStatusLabel(pedido.status || pedido.estado)}
                  </Text>
                </View>
                <Text style={[styles.orderTotal, { color: colors.text }]}>
                  Bs {parseFloat(pedido.total || 0).toFixed(2)}
                </Text>
              </View>
            </View>

            {/* ✅ Botón tracking si el pedido está activo */}
            {puedeVerTracking(pedido.status || pedido.estado) && (
              <TouchableOpacity
                style={styles.trackingBtn}
                onPress={() => navigation.navigate('TrackingPedido', { pedidoId: pedido.id })}
              >
                <Ionicons name="navigate" size={14} color="#fff" />
                <Text style={styles.trackingBtnText}>
                  {(pedido.status || pedido.estado) === 'en_camino' ? '🚴 Ver en tiempo real' : 'Seguir pedido'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )) : (
          <View style={[styles.emptyOrderState, { backgroundColor: colors.surface }]}>
            <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No tienes pedidos recientes</Text>
          </View>
        )}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcomeBanner: { margin: 16, borderRadius: 16, padding: 20, flexDirection: 'row', overflow: 'hidden' },
  welcomeContent: { flex: 1 },
  welcomeTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 6 },
  welcomeSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  exploreButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignSelf: 'flex-start', gap: 6 },
  exploreButtonText: { fontSize: 14, fontWeight: '600', color: '#3B82F6' },
  welcomeImage: { position: 'absolute', right: -10, bottom: -10, opacity: 0.5 },
  featuresContainer: { paddingHorizontal: 16, marginBottom: 8 },
  featureCard: { width: 130, padding: 14, borderRadius: 12, marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  featureIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  featureTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  featureDesc: { fontSize: 11 },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  seeAll: { fontSize: 14, color: '#3B82F6', fontWeight: '500' },
  productCard: { width: 160, borderRadius: 12, marginRight: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  productImageContainer: { height: 120, position: 'relative' },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  productImagePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  favoriteButton: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  productInfo: { padding: 12 },
  productName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  productCategory: { fontSize: 12, marginBottom: 8 },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#3B82F6' },
  addToCartButton: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
  emptyState: { width: width - 64, padding: 32, borderRadius: 12, alignItems: 'center' },
  emptyText: { marginTop: 8, fontSize: 14 },
  orderCard: { borderRadius: 12, marginBottom: 10, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  orderCardTop: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  orderIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  orderInfo: { flex: 1 },
  orderNumber: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  orderDate: { fontSize: 13 },
  orderRight: { alignItems: 'flex-end' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 4 },
  statusText: { fontSize: 11, fontWeight: '600' },
  orderTotal: { fontSize: 14, fontWeight: '600' },
  // ✅ Botón tracking
  activeBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#0d9488', marginHorizontal: 16, marginBottom: 12,
    borderRadius: 16, padding: 14, elevation: 4,
    shadowColor: '#0d9488', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
  activeBannerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  activePulse:       { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  activeBannerTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  activeBannerSub:   { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 1 },
  trackingBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3B82F6', paddingVertical: 10, gap: 6 },
  trackingBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptyOrderState: { padding: 32, borderRadius: 12, alignItems: 'center' },
});

export default HomeScreenConsumer;