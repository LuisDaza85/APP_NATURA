// src/screens/producer/InventarioScreen.jsx
// Gestión de productos del productor

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../contexts/ThemeContext';
import { productService } from '../../api/services';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const InventarioScreen = () => {
  const { colors } = useTheme();
  
  // Estados
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroStock, setFiltroStock] = useState('todos');
  
  // Modales
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria_id: '1',
    imagen: '',
  });

  // Categorías disponibles
  const categorias = [
    { id: '1', nombre: 'Pescados' },
    { id: '2', nombre: 'Mariscos' },
  ];

  // ============================================
  // CARGAR PRODUCTOS
  // ============================================
  const fetchProductos = useCallback(async () => {
    try {
      const result = await productService.getMisProductos();
      if (result.success) {
        setProductos(result.data || []);
      } else {
        console.log('⚠️ Error cargando productos:', result.error);
      }
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProductos();
  };

  // ============================================
  // FILTRAR PRODUCTOS
  // ============================================
  const productosFiltrados = productos.filter(producto => {
    // Filtro por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!producto.nombre?.toLowerCase().includes(query) &&
          !producto.descripcion?.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    // Filtro por categoría
    if (filtroCategoria !== 'todos' && producto.categoria !== filtroCategoria) {
      return false;
    }
    
    // Filtro por stock
    if (filtroStock === 'disponible' && producto.stock <= 0) return false;
    if (filtroStock === 'bajo' && (producto.stock <= 0 || producto.stock >= 10)) return false;
    if (filtroStock === 'agotado' && producto.stock > 0) return false;
    
    return true;
  });

  // ============================================
  // ESTADÍSTICAS
  // ============================================
  const stats = {
    total: productos.length,
    disponibles: productos.filter(p => p.stock > 0).length,
    stockBajo: productos.filter(p => p.stock > 0 && p.stock < 10).length,
    agotados: productos.filter(p => p.stock <= 0).length,
    valorTotal: productos.reduce((sum, p) => sum + (parseFloat(p.precio) * p.stock), 0),
  };

  // ============================================
  // ACCIONES CRUD
  // ============================================
  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentProduct(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      categoria_id: '1',
      imagen: '',
    });
    setModalVisible(true);
  };

  const openEditModal = (producto) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEditing(true);
    setCurrentProduct(producto);
    setFormData({
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      precio: producto.precio?.toString() || '',
      stock: producto.stock?.toString() || '',
      categoria_id: producto.categoria_id?.toString() || '1',
      imagen: producto.imagen || '',
    });
    setModalVisible(true);
  };

  const openDeleteModal = (producto) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentProduct(producto);
    setDeleteModalVisible(true);
  };

  const handleSave = async () => {
    // Validaciones
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }
    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      Alert.alert('Error', 'Ingrese un precio válido');
      return;
    }

    setSaving(true);
    try {
      const dataToSend = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock) || 0,
        categoria_id: parseInt(formData.categoria_id),
        imagen: formData.imagen.trim(),
      };

      let result;
      if (isEditing) {
        result = await productService.actualizarProducto(currentProduct.id, dataToSend);
        if (result.success) {
          setProductos(prev => 
            prev.map(p => p.id === currentProduct.id ? { ...p, ...dataToSend } : p)
          );
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        result = await productService.crearProducto(dataToSend);
        if (result.success) {
          setProductos(prev => [...prev, result.data.producto || result.data]);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }

      if (result.success) {
        setModalVisible(false);
      } else {
        Alert.alert('Error', result.error || 'No se pudo guardar');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentProduct) return;
    
    setSaving(true);
    try {
      const result = await productService.eliminarProducto(currentProduct.id);
      if (result.success) {
        setProductos(prev => prev.filter(p => p.id !== currentProduct.id));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setDeleteModalVisible(false);
        Alert.alert('✅ Éxito', 'Producto eliminado correctamente');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setDeleteModalVisible(false);
        
        // Mensaje específico si tiene pedidos activos
        if (result.code === 'PEDIDOS_ACTIVOS') {
          Alert.alert(
            '⚠️ No se puede eliminar',
            'Este producto tiene pedidos activos pendientes. Espera a que se completen o cancelen antes de eliminarlo.',
            [{ text: 'Entendido', style: 'default' }]
          );
        } else {
          Alert.alert('Error', result.error || 'No se pudo eliminar el producto');
        }
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setDeleteModalVisible(false);
      Alert.alert('Error', 'Ocurrió un error de conexión al eliminar');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando productos...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Inventario</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {productos.length} productos
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={openCreateModal}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.statsScroll}
          contentContainerStyle={styles.statsContainer}
        >
          <StatCard
            icon="cube-outline"
            label="Total"
            value={stats.total}
            color="#3b82f6"
            colors={colors}
          />
          <StatCard
            icon="checkmark-circle-outline"
            label="Disponibles"
            value={stats.disponibles}
            color="#22c55e"
            colors={colors}
          />
          <StatCard
            icon="alert-circle-outline"
            label="Stock Bajo"
            value={stats.stockBajo}
            color="#f59e0b"
            colors={colors}
          />
          <StatCard
            icon="close-circle-outline"
            label="Agotados"
            value={stats.agotados}
            color="#ef4444"
            colors={colors}
          />
        </ScrollView>

        {/* Buscador */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar productos..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContainer}
        >
          <FilterChip 
            label="Todos" 
            active={filtroStock === 'todos'} 
            onPress={() => setFiltroStock('todos')}
            colors={colors}
          />
          <FilterChip 
            label="Disponible" 
            active={filtroStock === 'disponible'} 
            onPress={() => setFiltroStock('disponible')}
            colors={colors}
          />
          <FilterChip 
            label="Stock bajo" 
            active={filtroStock === 'bajo'} 
            onPress={() => setFiltroStock('bajo')}
            colors={colors}
          />
          <FilterChip 
            label="Agotados" 
            active={filtroStock === 'agotado'} 
            onPress={() => setFiltroStock('agotado')}
            colors={colors}
          />
        </ScrollView>

        {/* Lista de productos */}
        {productosFiltrados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={colors.textHint} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {searchQuery || filtroStock !== 'todos' 
                ? 'Sin resultados' 
                : 'Sin productos'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {searchQuery || filtroStock !== 'todos'
                ? 'Intenta con otros filtros'
                : 'Agrega tu primer producto'}
            </Text>
            {!searchQuery && filtroStock === 'todos' && (
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                onPress={openCreateModal}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.emptyButtonText}>Agregar Producto</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          productosFiltrados.map((producto) => (
            <ProductoCard
              key={producto.id}
              producto={producto}
              onEdit={() => openEditModal(producto)}
              onDelete={() => openDeleteModal(producto)}
              colors={colors}
            />
          ))
        )}
      </ScrollView>

      {/* Modal Crear/Editar */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Nombre *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                placeholder="Nombre del producto"
                placeholderTextColor={colors.textHint}
                value={formData.nombre}
                onChangeText={(text) => setFormData({...formData, nombre: text})}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                placeholder="Descripción del producto"
                placeholderTextColor={colors.textHint}
                value={formData.descripcion}
                onChangeText={(text) => setFormData({...formData, descripcion: text})}
                multiline
                numberOfLines={3}
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Precio (Bs) *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                    placeholder="0.00"
                    placeholderTextColor={colors.textHint}
                    value={formData.precio}
                    onChangeText={(text) => setFormData({...formData, precio: text})}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Stock (kg)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                    placeholder="0"
                    placeholderTextColor={colors.textHint}
                    value={formData.stock}
                    onChangeText={(text) => setFormData({...formData, stock: text})}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Categoría</Text>
              <View style={styles.categoriaContainer}>
                {categorias.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoriaChip,
                      { borderColor: colors.border },
                      formData.categoria_id === cat.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setFormData({...formData, categoria_id: cat.id})}
                  >
                    <Text style={[
                      styles.categoriaText,
                      { color: formData.categoria_id === cat.id ? '#fff' : colors.text }
                    ]}>
                      {cat.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.textSecondary }]}>URL de imagen</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                placeholder="https://ejemplo.com/imagen.jpg"
                placeholderTextColor={colors.textHint}
                value={formData.imagen}
                onChangeText={(text) => setFormData({...formData, imagen: text})}
                autoCapitalize="none"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {isEditing ? 'Guardar' : 'Crear'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Eliminar */}
      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.deleteModalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.deleteIconContainer}>
              <Ionicons name="trash-outline" size={32} color="#ef4444" />
            </View>
            <Text style={[styles.deleteTitle, { color: colors.text }]}>
              ¿Eliminar producto?
            </Text>
            <Text style={[styles.deleteSubtitle, { color: colors.textSecondary }]}>
              "{currentProduct?.nombre}" será eliminado permanentemente.
            </Text>
            <View style={styles.deleteButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border, flex: 1 }]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteButton, { flex: 1 }]}
                onPress={handleDelete}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ============================================
// COMPONENTES AUXILIARES
// ============================================

const StatCard = ({ icon, label, value, color, colors }) => (
  <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
    <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
  </View>
);

const FilterChip = ({ label, active, onPress, colors }) => (
  <TouchableOpacity
    style={[
      styles.filterChip,
      { backgroundColor: active ? colors.primary : colors.surface, borderColor: colors.border }
    ]}
    onPress={onPress}
  >
    <Text style={[styles.filterChipText, { color: active ? '#fff' : colors.text }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const ProductoCard = ({ producto, onEdit, onDelete, colors }) => {
  const getStockStatus = () => {
    if (producto.stock <= 0) return { label: 'Agotado', color: '#ef4444' };
    if (producto.stock < 10) return { label: 'Stock bajo', color: '#f59e0b' };
    return { label: 'Disponible', color: '#22c55e' };
  };

  const status = getStockStatus();

  return (
    <View style={[styles.productoCard, { backgroundColor: colors.surface }]}>
      <View style={styles.productoContent}>
        {/* Imagen */}
        <View style={[styles.productoImage, { backgroundColor: colors.background }]}>
          {producto.imagen ? (
            <Image 
              source={{ uri: producto.imagen }} 
              style={styles.productoImageImg}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="fish-outline" size={32} color={colors.textHint} />
          )}
        </View>

        {/* Info */}
        <View style={styles.productoInfo}>
          <Text style={[styles.productoNombre, { color: colors.text }]} numberOfLines={1}>
            {producto.nombre}
          </Text>
          <Text style={[styles.productoCategoria, { color: colors.textSecondary }]}>
            {producto.categoria || 'Sin categoría'}
          </Text>
          <View style={styles.productoMeta}>
            <Text style={[styles.productoPrecio, { color: colors.primary }]}>
              Bs {parseFloat(producto.precio).toFixed(2)}
            </Text>
            <View style={[styles.stockBadge, { backgroundColor: `${status.color}20` }]}>
              <View style={[styles.stockDot, { backgroundColor: status.color }]} />
              <Text style={[styles.stockText, { color: status.color }]}>
                {producto.stock} kg
              </Text>
            </View>
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.productoActions}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.background }]}
            onPress={onEdit}
          >
            <Ionicons name="pencil-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
            onPress={onDelete}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ============================================
// ESTILOS
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  // Stats
  statsScroll: {
    marginBottom: SPACING.md,
    marginHorizontal: -SPACING.lg,
  },
  statsContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    flexDirection: 'row',
  },
  statCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    minWidth: 90,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 15,
  },
  // Filters
  filtersScroll: {
    marginBottom: SPACING.lg,
    marginHorizontal: -SPACING.lg,
  },
  filtersContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.lg,
    gap: SPACING.xs,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Producto Card
  productoCard: {
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  productoContent: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'center',
  },
  productoImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productoImageImg: {
    width: '100%',
    height: '100%',
  },
  productoInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  productoNombre: {
    fontSize: 16,
    fontWeight: '600',
  },
  productoCategoria: {
    fontSize: 12,
    marginTop: 2,
  },
  productoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  productoPrecio: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '500',
  },
  productoActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: SPACING.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfInput: {
    flex: 1,
  },
  categoriaContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  categoriaChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  categoriaText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  // Delete Modal
  deleteModalContent: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
  },
  deleteIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  deleteSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  deleteButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default InventarioScreen;