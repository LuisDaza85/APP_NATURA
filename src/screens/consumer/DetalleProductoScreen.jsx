// src/screens/consumer/DetalleProductoScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, Alert, ActivityIndicator, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../api/axios.config';

const { width } = Dimensions.get('window');

const DetalleProductoScreen = ({ navigation, route }) => {
  const { id } = route.params;
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [agregando, setAgregando] = useState(false);

  useEffect(() => {
    fetchProducto();
  }, [id]);

  const fetchProducto = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/productos/${id}`);
      setProducto(res.data.data || res.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el producto');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarCarrito = async () => {
    setAgregando(true);
    try {
      await api.post('/carrito', { producto_id: producto.id, cantidad });
      Alert.alert(
        '✅ Agregado al carrito',
        `${cantidad}x ${producto.nombre} agregado correctamente`,
        [
          { text: 'Seguir comprando', style: 'cancel' },
          { text: 'Ver carrito', onPress: () => navigation.navigate('Carrito') },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar al carrito');
    } finally {
      setAgregando(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!producto) return null;

  const precioTotal = (parseFloat(producto.precio || 0) * cantidad).toFixed(2);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Imagen del producto */}
        <View style={styles.imageContainer}>
          {producto.imagen_url ? (
            <Image source={{ uri: producto.imagen_url }} style={styles.productImage} />
          ) : (
            <LinearGradient colors={['#EFF6FF', '#DBEAFE']} style={styles.imagePlaceholder}>
              <Ionicons name="fish-outline" size={80} color="#3B82F6" />
            </LinearGradient>
          )}

          {/* Botón volver */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {/* Info principal */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.productName, { color: colors.text }]}>{producto.nombre}</Text>
              <View style={styles.categoryBadge}>
                <Ionicons name="fish-outline" size={12} color="#3B82F6" />
                <Text style={styles.categoryText}>{producto.categoria || 'Pescado Fresco'}</Text>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Precio</Text>
              <Text style={styles.price}>Bs {parseFloat(producto.precio || 0).toFixed(2)}</Text>
              <Text style={[styles.priceUnit, { color: colors.textSecondary }]}>por kg</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={[styles.statsRow, { backgroundColor: colors.surfaceVariant }]}>
            <View style={styles.statItem}>
              <Ionicons name="cube-outline" size={18} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>{producto.stock || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Stock (kg)</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Ionicons name="star" size={18} color="#F59E0B" />
              <Text style={[styles.statValue, { color: colors.text }]}>{producto.calificacion || '—'}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Calificación</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#22C55E" />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {producto.disponible !== false ? 'Sí' : 'No'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Disponible</Text>
            </View>
          </View>
        </View>

        {/* Descripción */}
        {producto.descripcion && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Descripción</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {producto.descripcion}
            </Text>
          </View>
        )}

        {/* Productor */}
        {(producto.productor_nombre || producto.productor_id) && (
          <TouchableOpacity
            style={[styles.section, styles.productorCard, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('DetalleProductor', { id: producto.productor_id })}
          >
            <View style={[styles.productorAvatar, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="person-outline" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.productorLabel, { color: colors.textSecondary }]}>Productor</Text>
              <Text style={[styles.productorNombre, { color: colors.text }]}>
                {producto.productor_nombre || 'Ver productor'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Selector de cantidad */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Cantidad</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={[styles.quantityBtn, { backgroundColor: colors.surfaceVariant }]}
              onPress={() => setCantidad(prev => Math.max(1, prev - 1))}
            >
              <Ionicons name="remove" size={22} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.quantityValue, { color: colors.text }]}>{cantidad}</Text>
            <TouchableOpacity
              style={[styles.quantityBtn, { backgroundColor: colors.surfaceVariant }]}
              onPress={() => setCantidad(prev => prev + 1)}
            >
              <Ionicons name="add" size={22} color={colors.text} />
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <View style={styles.totalContainer}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total</Text>
              <Text style={styles.totalValue}>Bs {precioTotal}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botón agregar al carrito */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.addToCartBtn, agregando && { opacity: 0.7 }]}
          onPress={handleAgregarCarrito}
          disabled={agregando}
        >
          {agregando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="cart-outline" size={22} color="#fff" />
              <Text style={styles.addToCartText}>Agregar al carrito · Bs {precioTotal}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  imageContainer: { position: 'relative', height: 280 },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  backButton: {
    position: 'absolute', top: 50, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
  },

  infoCard: { margin: 16, borderRadius: 16, padding: 16, marginTop: -24 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  productName: { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  categoryText: { fontSize: 12, color: '#3B82F6', fontWeight: '500' },
  priceContainer: { alignItems: 'flex-end' },
  priceLabel: { fontSize: 12, color: '#6B7280' },
  price: { fontSize: 28, fontWeight: 'bold', color: '#3B82F6' },
  priceUnit: { fontSize: 12 },

  statsRow: { flexDirection: 'row', borderRadius: 12, padding: 14, justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 11 },
  statDivider: { width: 1, height: '100%' },

  section: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  description: { fontSize: 14, lineHeight: 22 },

  productorCard: { flexDirection: 'row', alignItems: 'center' },
  productorAvatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  productorLabel: { fontSize: 12 },
  productorNombre: { fontSize: 15, fontWeight: '600', marginTop: 2 },

  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  quantityBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  quantityValue: { fontSize: 22, fontWeight: '700', minWidth: 32, textAlign: 'center' },
  totalContainer: { alignItems: 'flex-end' },
  totalLabel: { fontSize: 12 },
  totalValue: { fontSize: 22, fontWeight: 'bold', color: '#3B82F6' },

  footer: { padding: 16, borderTopWidth: 1 },
  addToCartBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#3B82F6', paddingVertical: 16, borderRadius: 14, gap: 10,
  },
  addToCartText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});

export default DetalleProductoScreen;