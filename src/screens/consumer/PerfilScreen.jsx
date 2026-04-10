// src/screens/consumer/PerfilScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../api/axios.config';

const PerfilScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { themeMode, setTheme, isDarkMode, colors } = useTheme();
  
  const [activeSection, setActiveSection] = useState('personal');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    fechaRegistro: '',
  });

  const [preferencias, setPreferencias] = useState({
    notificacionesEmail: true,
    notificacionesPush: true,
    notificacionesSMS: false,
    boletinNoticias: true,
    ofertas: true,
  });

  const sections = [
    { id: 'personal', icon: 'person-outline', label: 'Personal' },
    { id: 'direcciones', icon: 'location-outline', label: 'Direcciones' },
    { id: 'pagos', icon: 'card-outline', label: 'Pagos' },
    { id: 'preferencias', icon: 'settings-outline', label: 'Preferencias' },
    { id: 'seguridad', icon: 'shield-outline', label: 'Seguridad' },
  ];

  useEffect(() => {
    fetchPerfil();
  }, []);

  const fetchPerfil = async () => {
    try {
      setLoading(true);
      const response = await api.get('/usuarios/perfil');
      const data = response.data.data || response.data;
      setFormData({
        nombre: data.nombre || '',
        email: data.email || '',
        telefono: data.telefono || '',
        direccion: data.direccion || '',
        fechaRegistro: data.created_at
          ? new Date(data.created_at).toLocaleDateString('es-BO')
          : '',
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/usuarios/perfil', {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion,
      });
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      setEditMode(false);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
      ]
    );
  };

  const renderPersonal = () => (
    <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Información Personal</Text>

      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {formData.nombre?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'U'}
          </Text>
        </View>
        <TouchableOpacity style={[styles.avatarEditButton, { backgroundColor: colors.surface }]}>
          <Ionicons name="camera-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.fieldHeader}>
          <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Nombre Completo</Text>
        </View>
        {editMode ? (
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
            value={formData.nombre}
            onChangeText={(text) => setFormData(p => ({ ...p, nombre: text }))}
            placeholder="Tu nombre"
            placeholderTextColor={colors.placeholder}
          />
        ) : (
          <Text style={[styles.fieldValue, { color: colors.text }]}>{formData.nombre || '-'}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.fieldHeader}>
          <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Correo Electrónico</Text>
        </View>
        {editMode ? (
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
            value={formData.email}
            onChangeText={(text) => setFormData(p => ({ ...p, email: text }))}
            placeholder="correo@ejemplo.com"
            placeholderTextColor={colors.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        ) : (
          <Text style={[styles.fieldValue, { color: colors.text }]}>{formData.email || '-'}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.fieldHeader}>
          <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Teléfono</Text>
        </View>
        {editMode ? (
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
            value={formData.telefono}
            onChangeText={(text) => setFormData(p => ({ ...p, telefono: text }))}
            placeholder="Tu teléfono"
            placeholderTextColor={colors.placeholder}
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={[styles.fieldValue, { color: colors.text }]}>{formData.telefono || '-'}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.fieldHeader}>
          <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Dirección</Text>
        </View>
        {editMode ? (
          <TextInput
            style={[styles.input, styles.inputMultiline, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
            value={formData.direccion}
            onChangeText={(text) => setFormData(p => ({ ...p, direccion: text }))}
            placeholder="Tu dirección"
            placeholderTextColor={colors.placeholder}
            multiline
            numberOfLines={2}
          />
        ) : (
          <Text style={[styles.fieldValue, { color: colors.text }]}>{formData.direccion || '-'}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.fieldHeader}>
          <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Miembro desde</Text>
        </View>
        <Text style={[styles.fieldValue, { color: colors.text }]}>{formData.fechaRegistro || '-'}</Text>
      </View>
    </View>
  );

  const renderDirecciones = () => (
    <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Mis Direcciones</Text>

      <View style={[styles.addressCard, { backgroundColor: colors.surfaceVariant }]}>
        <View style={styles.addressHeader}>
          <View style={styles.addressIconContainer}>
            <Ionicons name="home-outline" size={20} color="#3B82F6" />
          </View>
          <View style={styles.addressInfo}>
            <Text style={[styles.addressName, { color: colors.text }]}>Casa</Text>
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Predeterminada</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.addressText, { color: colors.text }]}>Av. Principal 123</Text>
        <Text style={[styles.addressCity, { color: colors.textSecondary }]}>Ciudad del Lago, 12345</Text>
      </View>

      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add-circle-outline" size={20} color="#3B82F6" />
        <Text style={styles.addButtonText}>Añadir nueva dirección</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPagos = () => (
    <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Métodos de Pago</Text>

      <View style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <View style={styles.paymentIconContainer}>
            <Ionicons name="card-outline" size={22} color="#FFF" />
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentType}>Tarjeta de crédito</Text>
            <Text style={styles.paymentNumber}>•••• •••• •••• 4567</Text>
          </View>
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Principal</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add-circle-outline" size={20} color="#3B82F6" />
        <Text style={styles.addButtonText}>Añadir método de pago</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPreferencias = () => (
    <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
      {/* ===== SECCIÓN: APARIENCIA ===== */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Apariencia</Text>
      
      <View style={styles.themeContainer}>
        <TouchableOpacity
          style={[
            styles.themeOption,
            { backgroundColor: colors.surfaceVariant },
            themeMode === 'light' && styles.themeOptionActive,
          ]}
          onPress={() => setTheme('light')}
        >
          <View style={[
            styles.themeIconContainer,
            { backgroundColor: isDarkMode ? '#4B5563' : '#E5E7EB' },
            themeMode === 'light' && styles.themeIconActive,
          ]}>
            <Ionicons name="sunny" size={24} color={themeMode === 'light' ? '#FFFFFF' : colors.textSecondary} />
          </View>
          <Text style={[styles.themeLabel, { color: colors.textSecondary }, themeMode === 'light' && styles.themeLabelActive]}>
            Claro
          </Text>
          {themeMode === 'light' && <Ionicons name="checkmark-circle" size={20} color="#22C55E" style={styles.themeCheck} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.themeOption,
            { backgroundColor: colors.surfaceVariant },
            themeMode === 'dark' && styles.themeOptionActive,
          ]}
          onPress={() => setTheme('dark')}
        >
          <View style={[
            styles.themeIconContainer,
            { backgroundColor: isDarkMode ? '#4B5563' : '#E5E7EB' },
            themeMode === 'dark' && styles.themeIconActive,
          ]}>
            <Ionicons name="moon" size={24} color={themeMode === 'dark' ? '#FFFFFF' : colors.textSecondary} />
          </View>
          <Text style={[styles.themeLabel, { color: colors.textSecondary }, themeMode === 'dark' && styles.themeLabelActive]}>
            Oscuro
          </Text>
          {themeMode === 'dark' && <Ionicons name="checkmark-circle" size={20} color="#22C55E" style={styles.themeCheck} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.themeOption,
            { backgroundColor: colors.surfaceVariant },
            themeMode === 'auto' && styles.themeOptionActive,
          ]}
          onPress={() => setTheme('auto')}
        >
          <View style={[
            styles.themeIconContainer,
            { backgroundColor: isDarkMode ? '#4B5563' : '#E5E7EB' },
            themeMode === 'auto' && styles.themeIconActive,
          ]}>
            <Ionicons name="phone-portrait-outline" size={24} color={themeMode === 'auto' ? '#FFFFFF' : colors.textSecondary} />
          </View>
          <Text style={[styles.themeLabel, { color: colors.textSecondary }, themeMode === 'auto' && styles.themeLabelActive]}>
            Auto
          </Text>
          {themeMode === 'auto' && <Ionicons name="checkmark-circle" size={20} color="#22C55E" style={styles.themeCheck} />}
        </TouchableOpacity>
      </View>

      <Text style={[styles.themeHint, { color: colors.textMuted }]}>
        {themeMode === 'auto' 
          ? `Siguiendo el sistema (actualmente: ${isDarkMode ? 'oscuro' : 'claro'})`
          : themeMode === 'dark' ? 'Modo oscuro activado' : 'Modo claro activado'}
      </Text>

      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      {/* ===== NOTIFICACIONES ===== */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Notificaciones</Text>

      <View style={[styles.preferenceItem, { borderBottomColor: colors.divider }]}>
        <View style={styles.preferenceInfo}>
          <Ionicons name="mail-outline" size={22} color={colors.textSecondary} />
          <View style={styles.preferenceText}>
            <Text style={[styles.preferenceName, { color: colors.text }]}>Email</Text>
            <Text style={[styles.preferenceDesc, { color: colors.textSecondary }]}>Notificaciones por correo</Text>
          </View>
        </View>
        <Switch
          value={preferencias.notificacionesEmail}
          onValueChange={(value) => setPreferencias(p => ({ ...p, notificacionesEmail: value }))}
          trackColor={{ false: colors.border, true: '#86EFAC' }}
          thumbColor={preferencias.notificacionesEmail ? '#22C55E' : '#9CA3AF'}
        />
      </View>

      <View style={[styles.preferenceItem, { borderBottomColor: colors.divider }]}>
        <View style={styles.preferenceInfo}>
          <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
          <View style={styles.preferenceText}>
            <Text style={[styles.preferenceName, { color: colors.text }]}>Push</Text>
            <Text style={[styles.preferenceDesc, { color: colors.textSecondary }]}>Notificaciones en dispositivo</Text>
          </View>
        </View>
        <Switch
          value={preferencias.notificacionesPush}
          onValueChange={(value) => setPreferencias(p => ({ ...p, notificacionesPush: value }))}
          trackColor={{ false: colors.border, true: '#86EFAC' }}
          thumbColor={preferencias.notificacionesPush ? '#22C55E' : '#9CA3AF'}
        />
      </View>
    </View>
  );

  const renderSeguridad = () => (
    <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Seguridad</Text>

      <TouchableOpacity style={[styles.securityItem, { borderBottomColor: colors.divider }]}>
        <View style={styles.securityIconContainer}>
          <Ionicons name="key-outline" size={22} color="#3B82F6" />
        </View>
        <View style={styles.securityInfo}>
          <Text style={[styles.securityName, { color: colors.text }]}>Cambiar contraseña</Text>
          <Text style={[styles.securityDesc, { color: colors.textSecondary }]}>Actualiza tu contraseña</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.securityItem, { borderBottomColor: colors.divider }]}>
        <View style={styles.securityIconContainer}>
          <Ionicons name="finger-print-outline" size={22} color="#3B82F6" />
        </View>
        <View style={styles.securityInfo}>
          <Text style={[styles.securityName, { color: colors.text }]}>Biometría</Text>
          <Text style={[styles.securityDesc, { color: colors.textSecondary }]}>Huella o Face ID</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'personal': return renderPersonal();
      case 'direcciones': return renderDirecciones();
      case 'pagos': return renderPagos();
      case 'preferencias': return renderPreferencias();
      case 'seguridad': return renderSeguridad();
      default: return renderPersonal();
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Mi Perfil</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Gestiona tu información</Text>
        </View>
        {activeSection === 'personal' && (
          <TouchableOpacity style={styles.editButton} onPress={() => editMode ? handleSave() : setEditMode(true)} disabled={saving}>
            {saving ? <ActivityIndicator size="small" color="#FFF" /> : (
              <>
                <Ionicons name={editMode ? 'checkmark' : 'create-outline'} size={18} color="#FFF" />
                <Text style={styles.editButtonText}>{editMode ? 'Guardar' : 'Editar'}</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.tabsContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]} contentContainerStyle={styles.tabsContent}>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[styles.tab, { backgroundColor: colors.surfaceVariant }, activeSection === section.id && styles.tabActive]}
            onPress={() => { setActiveSection(section.id); setEditMode(false); }}
          >
            <Ionicons name={section.icon} size={18} color={activeSection === section.id ? '#3B82F6' : colors.textSecondary} />
            <Text style={[styles.tabText, { color: colors.textSecondary }, activeSection === section.id && styles.tabTextActive]}>{section.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 14, marginTop: 2 },
  editButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, gap: 6 },
  editButtonText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  tabsContainer: { borderBottomWidth: 1 },
  tabsContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, gap: 6 },
  tabActive: { backgroundColor: '#EFF6FF' },
  tabText: { fontSize: 13, fontWeight: '500' },
  tabTextActive: { color: '#3B82F6' },
  content: { flex: 1, padding: 16 },
  sectionContent: { borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  avatarContainer: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  avatarEditButton: { position: 'absolute', right: '35%', bottom: 0, padding: 8, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  fieldContainer: { marginBottom: 16 },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '500' },
  fieldValue: { fontSize: 15, paddingVertical: 4 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 15 },
  inputMultiline: { minHeight: 60, textAlignVertical: 'top' },
  divider: { height: 1, marginVertical: 16 },
  addressCard: { borderRadius: 10, padding: 14, marginBottom: 12 },
  addressHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  addressIconContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  addressInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  addressName: { fontSize: 15, fontWeight: '600' },
  addressText: { fontSize: 14, marginLeft: 46 },
  addressCity: { fontSize: 13, marginLeft: 46, marginTop: 2 },
  defaultBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  defaultBadgeText: { fontSize: 11, fontWeight: '500', color: '#065F46' },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderWidth: 1, borderColor: '#3B82F6', borderStyle: 'dashed', borderRadius: 10, gap: 8, marginTop: 8 },
  addButtonText: { fontSize: 14, fontWeight: '500', color: '#3B82F6' },
  paymentCard: { backgroundColor: '#1F2937', borderRadius: 12, padding: 16, marginBottom: 12 },
  paymentHeader: { flexDirection: 'row', alignItems: 'center' },
  paymentIconContainer: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#374151', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  paymentInfo: { flex: 1 },
  paymentType: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  paymentNumber: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  themeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, gap: 12 },
  themeOption: { flex: 1, alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
  themeOptionActive: { backgroundColor: '#F0FDF4', borderColor: '#22C55E' },
  themeIconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  themeIconActive: { backgroundColor: '#22C55E' },
  themeLabel: { fontSize: 14, fontWeight: '500' },
  themeLabelActive: { color: '#22C55E', fontWeight: '600' },
  themeCheck: { position: 'absolute', top: 8, right: 8 },
  themeHint: { fontSize: 12, textAlign: 'center', marginBottom: 16 },
  preferenceItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  preferenceInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  preferenceText: { marginLeft: 12, flex: 1 },
  preferenceName: { fontSize: 15, fontWeight: '500' },
  preferenceDesc: { fontSize: 12, marginTop: 2 },
  securityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  securityIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  securityInfo: { flex: 1 },
  securityName: { fontSize: 15, fontWeight: '500' },
  securityDesc: { fontSize: 12, marginTop: 2 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2', padding: 14, borderRadius: 12, marginTop: 16, gap: 8 },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },
});

export default PerfilScreen;