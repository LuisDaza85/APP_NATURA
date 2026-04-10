// src/screens/consumer/DetalleProductorScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../api/axios.config';

const { width } = Dimensions.get('window');

const DetalleProductorScreen = ({ navigation, route }) => {
  const { id } = route.params;
  const { colors, isDarkMode } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [productor, setProductor] = useState(null);
  const [productos, setProductos] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchProductor();
  }, [id]);

  const fetchProductor = async () => {
    try {
      setLoading(true);
      const [prodRes, prodsRes] = await Promise.all([
        api.get(`/productores/${id}`),
        api.get(`/productores/${id}/productos`).catch(() => ({ data: { data: [] } })),
      ]);
      setProductor(prodRes.data.data || prodRes.data);
      setProductos(prodsRes.data.data || prodsRes.data || []);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el productor');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (productor?.telefono) {
      Linking.openURL(`tel:${productor.telefono}`);
    }
  };

  const handleWhatsApp = () => {
    if (productor?.telefono) {
      const phone = productor.telefono.replace(/\D/g, '');
      Linking.openURL(`whatsapp://send?phone=591${phone}`);
    }
  };

  const handleEmail = () => {
    if (productor?.email) {
      Linking.openURL(`mailto:${productor.email}`);
    }
  };

  const addToCart = async (producto) => {
    try {
      await api.post('/carrito', { producto_id: producto.id, cantidad: 1 });
      setCartCount(prev => prev + 1);
      Alert.alert('Agregado', `${producto.nombre} agregado al carrito`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar al carrito');
    }
  };

  const diasSemana = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!productor) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header con gradiente */}
        <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {productor.nombre?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.producerName}>{productor.nombre}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.locationText}>{productor.ubicacion || 'Bolivia'}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#FCD34D" />
              <Text style={styles.statValue}>{productor.calificacion || '—'}</Text>
              <Text style={styles.statLabel}>({productor.reseñas_count || 0})</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="cube-outline" size={16} color="#FFF" />
              <Text style={styles.statValue}>{productos.length}</Text>
              <Text style={styles.statLabel}>Productos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#FFF" />
              <Text style={styles.statValue}>{productor.años_experiencia || 0}</Text>
              <Text style={styles.statLabel}>Años</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Contenido */}
        <View style={styles.content}>
          {/* Acerca de */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Acerca del productor</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {productor.descripcion || 'Productor acuícola especializado en productos frescos y de calidad.'}
            </Text>
          </View>

          {/* Días de atención */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Días de atención</Text>
            <View style={styles.daysRow}>
              {diasSemana.map((dia, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.dayBadge, 
                    { backgroundColor: colors.surfaceVariant },
                    index < 5 && styles.dayBadgeActive
                  ]}
                >
                  <Text style={[styles.dayText, { color: index < 5 ? '#FFF' : colors.textSecondary }]}>{dia}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Contacto */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Contacto</Text>
            <View style={styles.contactButtons}>
              <TouchableOpacity style={[styles.contactButton, { borderColor: colors.border }]} onPress={handleCall}>
                <Ionicons name="call-outline" size={20} color="#3B82F6" />
                <Text style={styles.contactButtonText}>Llamar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.contactButton, styles.whatsappButton]} onPress={handleWhatsApp}>
                <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
                <Text style={styles.whatsappButtonText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.contactButton, { borderColor: colors.border }]} onPress={handleEmail}>
                <Ionicons name="mail-outline" size={20} color="#3B82F6" />
                <Text style={styles.contactButtonText}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Productos */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Productos ({productos.length})</Text>
            <View style={styles.productsGrid}>
              {productos.map((producto) => (
                <TouchableOpacity 
                  key={producto.id} 
                  style={[styles.productCard, { backgroundColor: colors.surfaceVariant }]}
                  onPress={() => navigation.navigate('DetalleProducto', { id: producto.id })}
                >
                  <View style={styles.productImage}>
                    {producto.imagen_url ? (
                      <Image source={{ uri: producto.imagen_url }} style={styles.productImg} />
                    ) : (
                      <Ionicons name="fish-outline" size={30} color={colors.textMuted} />
                    )}
                    <TouchableOpacity style={styles.favoriteBtn}>
                      <Ionicons name="heart-outline" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>{producto.nombre}</Text>
                    <Text style={styles.productPrice}>Bs {parseFloat(producto.precio || 0).toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => addToCart(producto)}
                  >
                    <Ionicons name="add" size={20} color="#FFF" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Carrito flotante */}
      {cartCount > 0 && (
        <TouchableOpacity 
          style={styles.floatingCart}
          onPress={() => navigation.navigate('Carrito')}
        >
          <Ionicons name="cart" size={24} color="#FFF" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartCount}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 16 },
  backButton: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  profileSection: { alignItems: 'center', marginTop: 20 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  producerName: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  statsBar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statValue: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  statDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 16 },
  content: { padding: 16, marginTop: -20 },
  section: { borderRadius: 12, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  description: { fontSize: 14, lineHeight: 22 },
  daysRow: { flexDirection: 'row', gap: 8 },
  dayBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  dayBadgeActive: { backgroundColor: '#3B82F6' },
  dayText: { fontSize: 13, fontWeight: '600' },
  contactButtons: { flexDirection: 'row', gap: 10 },
  contactButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, borderWidth: 1, gap: 6 },
  contactButtonText: { fontSize: 13, fontWeight: '500', color: '#3B82F6' },
  whatsappButton: { backgroundColor: '#25D366', borderColor: '#25D366' },
  whatsappButtonText: { fontSize: 13, fontWeight: '500', color: '#FFF' },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  productCard: { width: (width - 64) / 2, borderRadius: 12, overflow: 'hidden' },
  productImage: { height: 100, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  productImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  favoriteBtn: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },
  productInfo: { padding: 10 },
  productName: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  productPrice: { fontSize: 15, fontWeight: 'bold', color: '#3B82F6' },
  addButton: { position: 'absolute', bottom: 10, right: 10, width: 32, height: 32, borderRadius: 8, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
  floatingCart: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8 },
  cartBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
});

export default DetalleProductorScreen;