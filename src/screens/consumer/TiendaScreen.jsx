// src/screens/consumer/TiendaScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../api/axios.config';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const TiendaScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  
  const [activeTab, setActiveTab] = useState('productores');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productores, setProductores] = useState([]);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, prodtRes] = await Promise.all([
        api.get('/productores').catch(() => ({ data: {} })),
        api.get('/productos').catch(() => ({ data: {} })),
      ]);

      // Cubrir todas las estructuras posibles que devuelve el backend
      const rawProductores = prodRes.data;
      const extractedProductores =
        rawProductores?.data?.productores ??
        rawProductores?.data ??
        rawProductores?.productores ??
        rawProductores ?? [];

      const rawProductos = prodtRes.data;
      const extractedProductos =
        rawProductos?.data?.productos ??
        rawProductos?.data ??
        rawProductos?.productos ??
        rawProductos ?? [];


      setProductores(Array.isArray(extractedProductores) ? extractedProductores : []);
      setProductos(Array.isArray(extractedProductos) ? extractedProductos : []);
    } catch (error) {
      setProductores([]);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const getGradient = (index) => {
    const gradients = [
      ['#3B82F6', '#2563EB'],
      ['#22C55E', '#16A34A'],
      ['#8B5CF6', '#7C3AED'],
      ['#F59E0B', '#D97706'],
    ];
    return gradients[index % gradients.length];
  };

  // Siempre arrays seguros antes de llamar .filter()
  const safeProductores = Array.isArray(productores) ? productores : [];
  const safeProductos = Array.isArray(productos) ? productos : [];

  const filteredProductores = safeProductores.filter(p =>
    p.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProductos = safeProductos.filter(p =>
    p.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tienda</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Descubre productos frescos y productores locales</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.inputBackground }]}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar..."
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.inputBackground }]}>
          <Ionicons name="options-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'productores' && styles.tabActive]}
          onPress={() => setActiveTab('productores')}
        >
          <Ionicons name="people-outline" size={18} color={activeTab === 'productores' ? '#3B82F6' : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'productores' && styles.tabTextActive, { color: activeTab === 'productores' ? '#3B82F6' : colors.textSecondary }]}>
            Productores
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'productos' && styles.tabActive]}
          onPress={() => setActiveTab('productos')}
        >
          <Ionicons name="fish-outline" size={18} color={activeTab === 'productos' ? '#3B82F6' : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'productos' && styles.tabTextActive, { color: activeTab === 'productos' ? '#3B82F6' : colors.textSecondary }]}>
            Productos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'productores' ? (
          <View style={styles.grid}>
            {filteredProductores.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay productores disponibles</Text>
              </View>
            ) : (
              filteredProductores.map((productor, index) => (
                <TouchableOpacity 
                  key={productor.id} 
                  style={[styles.card, { width: cardWidth, backgroundColor: colors.surface }]}
                  onPress={() => navigation.navigate('DetalleProductor', { id: productor.id })}
                >
                  <LinearGradient colors={getGradient(index)} style={styles.cardGradient}>
                    <View style={styles.cardAvatar}>
                      <Text style={styles.cardAvatarText}>
                        {productor.nombre?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                  </LinearGradient>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>{productor.nombre}</Text>
                    <Text style={[styles.cardLocation, { color: colors.textSecondary }]}>
                      <Ionicons name="location-outline" size={12} /> {productor.ubicacion || 'Bolivia'}
                    </Text>
                    <View style={styles.cardStats}>
                      <Text style={[styles.cardStat, { color: colors.textSecondary }]}>⭐ {productor.calificacion || '0.0'}</Text>
                      <Text style={[styles.cardStat, { color: colors.textSecondary }]}>📦 {productor.productos_count || 0}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredProductos.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="fish-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay productos disponibles</Text>
              </View>
            ) : (
              filteredProductos.map((producto) => (
                <TouchableOpacity 
                  key={producto.id} 
                  style={[styles.productCard, { width: cardWidth, backgroundColor: colors.surface }]}
                  onPress={() => navigation.navigate('DetalleProducto', { id: producto.id })}
                >
                  <View style={[styles.productImage, { backgroundColor: colors.surfaceVariant }]}>
                    {producto.imagen_url ? (
                      <Image source={{ uri: producto.imagen_url }} style={styles.productImg} />
                    ) : (
                      <Ionicons name="fish-outline" size={40} color={colors.textMuted} />
                    )}
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>{producto.nombre}</Text>
                    <Text style={[styles.productCategory, { color: colors.textSecondary }]}>{producto.categoria || 'Pescado'}</Text>
                    <Text style={styles.productPrice}>Bs {parseFloat(producto.precio || 0).toFixed(2)}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, paddingTop: 8 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 14, marginTop: 4 },
  searchContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderRadius: 10, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15 },
  filterButton: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: 'transparent', gap: 6 },
  tabActive: { backgroundColor: '#EFF6FF' },
  tabText: { fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: '#3B82F6' },
  content: { flex: 1, paddingHorizontal: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  emptyState: { flex: 1, width: '100%', alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 15 },
  card: { borderRadius: 12, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardGradient: { height: 100, justifyContent: 'center', alignItems: 'center' },
  cardAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },
  cardAvatarText: { fontSize: 20, fontWeight: 'bold', color: '#374151' },
  cardInfo: { padding: 12 },
  cardName: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  cardLocation: { fontSize: 12, marginBottom: 8 },
  cardStats: { flexDirection: 'row', gap: 12 },
  cardStat: { fontSize: 11 },
  productCard: { borderRadius: 12, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  productImage: { height: 120, justifyContent: 'center', alignItems: 'center' },
  productImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  productInfo: { padding: 12 },
  productName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  productCategory: { fontSize: 12, marginBottom: 6 },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#3B82F6' },
});

export default TiendaScreen;