// src/screens/consumer/ProductoresScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
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

const ProductoresScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productores, setProductores] = useState([]);
  const [stats, setStats] = useState({ total: 0, disponibles: 0, productos: 0, promedio: 0 });

  useEffect(() => {
    fetchProductores();
  }, []);

  const fetchProductores = async () => {
    try {
      setLoading(true);
      const response = await api.get('/productores');
      const raw = response.data;

      // El backend devuelve { success, data: { productores: [...] } }
      const data =
        raw?.data?.productores ??
        raw?.data ??
        raw?.productores ??
        [];

      const safeData = Array.isArray(data) ? data : [];

      setProductores(safeData);
      setStats({
        total: safeData.length,
        disponibles: safeData.filter(p => p.activo !== false).length,
        productos: safeData.reduce((sum, p) => sum + (p.productos_count || 0), 0),
        promedio: safeData.length > 0
          ? (safeData.reduce((sum, p) => sum + (parseFloat(p.calificacion) || 0), 0) / safeData.length).toFixed(1)
          : 0,
      });
    } catch (error) {
      console.log('Error:', error);
      setProductores([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProductores();
    setRefreshing(false);
  }, []);

  const getGradient = (index) => {
    const gradients = [
      ['#3B82F6', '#2563EB'],
      ['#22C55E', '#16A34A'],
      ['#8B5CF6', '#7C3AED'],
      ['#F59E0B', '#D97706'],
      ['#EC4899', '#DB2777'],
      ['#06B6D4', '#0891B2'],
    ];
    return gradients[index % gradients.length];
  };

  const safeProductores = Array.isArray(productores) ? productores : [];

  const filteredProductores = safeProductores.filter(p =>
    p.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.especialidad?.toLowerCase().includes(searchQuery.toLowerCase())
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Productores</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Encuentra productores locales de acuicultura</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.inputBackground }]}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar productores..."
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.inputBackground }]}>
          <Ionicons name="options-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer} contentContainerStyle={styles.statsContent}>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.statIcon, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="people-outline" size={20} color="#3B82F6" />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Productores</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.statIcon, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#22C55E" />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.disponibles}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Disponibles</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="cube-outline" size={20} color="#F59E0B" />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.productos}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Productos</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.statIcon, { backgroundColor: '#FDF2F8' }]}>
            <Ionicons name="star-outline" size={20} color="#EC4899" />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.promedio}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Promedio</Text>
        </View>
      </ScrollView>

      {/* Grid */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
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
                  <Text style={[styles.cardSpecialty, { color: colors.textSecondary }]} numberOfLines={1}>
                    {productor.especialidad || 'Productor acuícola'}
                  </Text>
                  <View style={styles.cardMeta}>
                    <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                    <Text style={[styles.cardLocation, { color: colors.textSecondary }]}>{productor.ubicacion || 'Bolivia'}</Text>
                  </View>
                  <View style={styles.cardFooter}>
                    <View style={styles.cardStat}>
                      <Text style={[styles.cardStatValue, { color: colors.text }]}>{productor.productos_count || 0}</Text>
                      <Text style={[styles.cardStatLabel, { color: colors.textSecondary }]}>Productos</Text>
                    </View>
                    <View style={styles.cardRating}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={[styles.cardRatingText, { color: colors.text }]}>{productor.calificacion || '—'}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => navigation.navigate('DetalleProductor', { id: productor.id })}
                >
                  <Text style={styles.viewButtonText}>Ver perfil</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>
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
  statsContainer: { maxHeight: 100 },
  statsContent: { paddingHorizontal: 16, gap: 10 },
  statCard: { width: 90, padding: 12, borderRadius: 12, alignItems: 'center', marginRight: 10 },
  statIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 10, marginTop: 2 },
  content: { flex: 1, paddingHorizontal: 16, marginTop: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  emptyState: { flex: 1, width: '100%', alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 15 },
  card: { borderRadius: 12, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardGradient: { height: 80, justifyContent: 'center', alignItems: 'center' },
  cardAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },
  cardAvatarText: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
  cardInfo: { padding: 12 },
  cardName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  cardSpecialty: { fontSize: 11, marginBottom: 6 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  cardLocation: { fontSize: 11 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardStat: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  cardStatValue: { fontSize: 14, fontWeight: '600' },
  cardStatLabel: { fontSize: 10 },
  cardRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardRatingText: { fontSize: 13, fontWeight: '500' },
  viewButton: { backgroundColor: '#EFF6FF', paddingVertical: 10, alignItems: 'center', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  viewButtonText: { fontSize: 13, fontWeight: '600', color: '#3B82F6' },
});

export default ProductoresScreen;