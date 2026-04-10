// src/screens/producer/ProfileScreen.jsx
// Pantalla de perfil del productor con configuración de tema

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, BORDER_RADIUS } from '../../constants/theme';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { colors, isDarkMode, themeMode, setTheme, THEME_MODES, isAuto } = useTheme();

  // ============================================
  // CAMBIAR TEMA
  // ============================================
  const handleThemeChange = async (mode) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setTheme(mode);
  };

  // ============================================
  // CERRAR SESIÓN
  // ============================================
  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            logout();
          }
        },
      ]
    );
  };

  // Estilos dinámicos
  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    card: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
    },
    text: {
      color: colors.text,
    },
    textSecondary: {
      color: colors.textSecondary,
    },
  };

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, dynamicStyles.text]}>Perfil</Text>
        </View>

        {/* Avatar y Nombre */}
        <View style={[styles.profileCard, dynamicStyles.card]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, dynamicStyles.text]}>
              {user?.nombre || 'Productor'}
            </Text>
            <Text style={[styles.profileEmail, dynamicStyles.textSecondary]}>
              {user?.email || 'productor@naturapiscis.com'}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: colors.primaryLight + '20' }]}>
              <Ionicons name="fish" size={14} color={colors.primary} />
              <Text style={[styles.roleText, { color: colors.primary }]}>
                Productor
              </Text>
            </View>
          </View>
        </View>

        {/* Sección: Apariencia */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.textSecondary]}>
            APARIENCIA
          </Text>
          
          <View style={[styles.card, dynamicStyles.card]}>
            {/* Opción: Automático */}
            <TouchableOpacity 
              style={styles.themeOption}
              onPress={() => handleThemeChange(THEME_MODES.AUTO)}
            >
              <View style={styles.themeOptionLeft}>
                <View style={[styles.themeIconContainer, { backgroundColor: colors.infoBg }]}>
                  <Ionicons name="phone-portrait-outline" size={20} color={colors.info} />
                </View>
                <View>
                  <Text style={[styles.themeOptionTitle, dynamicStyles.text]}>
                    Automático
                  </Text>
                  <Text style={[styles.themeOptionDesc, dynamicStyles.textSecondary]}>
                    Sigue el tema del sistema
                  </Text>
                </View>
              </View>
              <View style={[
                styles.radioOuter, 
                { borderColor: themeMode === THEME_MODES.AUTO ? colors.primary : colors.border }
              ]}>
                {themeMode === THEME_MODES.AUTO && (
                  <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                )}
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Opción: Claro */}
            <TouchableOpacity 
              style={styles.themeOption}
              onPress={() => handleThemeChange(THEME_MODES.LIGHT)}
            >
              <View style={styles.themeOptionLeft}>
                <View style={[styles.themeIconContainer, { backgroundColor: colors.warningBg }]}>
                  <Ionicons name="sunny" size={20} color={colors.warning} />
                </View>
                <View>
                  <Text style={[styles.themeOptionTitle, dynamicStyles.text]}>
                    Modo Claro
                  </Text>
                  <Text style={[styles.themeOptionDesc, dynamicStyles.textSecondary]}>
                    Fondo blanco
                  </Text>
                </View>
              </View>
              <View style={[
                styles.radioOuter, 
                { borderColor: themeMode === THEME_MODES.LIGHT ? colors.primary : colors.border }
              ]}>
                {themeMode === THEME_MODES.LIGHT && (
                  <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                )}
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Opción: Oscuro */}
            <TouchableOpacity 
              style={styles.themeOption}
              onPress={() => handleThemeChange(THEME_MODES.DARK)}
            >
              <View style={styles.themeOptionLeft}>
                <View style={[styles.themeIconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                  <Ionicons name="moon" size={20} color="#6366f1" />
                </View>
                <View>
                  <Text style={[styles.themeOptionTitle, dynamicStyles.text]}>
                    Modo Oscuro
                  </Text>
                  <Text style={[styles.themeOptionDesc, dynamicStyles.textSecondary]}>
                    Fondo oscuro
                  </Text>
                </View>
              </View>
              <View style={[
                styles.radioOuter, 
                { borderColor: themeMode === THEME_MODES.DARK ? colors.primary : colors.border }
              ]}>
                {themeMode === THEME_MODES.DARK && (
                  <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Indicador de tema actual */}
          <View style={[styles.themeIndicator, { backgroundColor: colors.surface }]}>
            <Ionicons 
              name={isDarkMode ? "moon" : "sunny"} 
              size={16} 
              color={colors.textSecondary} 
            />
            <Text style={[styles.themeIndicatorText, dynamicStyles.textSecondary]}>
              Tema actual: {isDarkMode ? 'Oscuro' : 'Claro'}
              {isAuto ? ' (Auto)' : ''}
            </Text>
          </View>
        </View>

        {/* Sección: Cuenta */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.textSecondary]}>
            CUENTA
          </Text>
          
          <View style={[styles.card, dynamicStyles.card]}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="person-outline" size={22} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, dynamicStyles.text]}>
                  Editar Perfil
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, dynamicStyles.text]}>
                  Notificaciones
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="lock-closed-outline" size={22} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, dynamicStyles.text]}>
                  Cambiar Contraseña
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sección: Soporte */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.textSecondary]}>
            SOPORTE
          </Text>
          
          <View style={[styles.card, dynamicStyles.card]}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="help-circle-outline" size={22} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, dynamicStyles.text]}>
                  Ayuda
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="document-text-outline" size={22} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, dynamicStyles.text]}>
                  Términos y Condiciones
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="information-circle-outline" size={22} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, dynamicStyles.text]}>
                  Acerca de
                </Text>
              </View>
              <Text style={[styles.versionText, dynamicStyles.textSecondary]}>v1.0.0</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón Cerrar Sesión */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: colors.errorBg }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>
            Cerrar Sesión
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, dynamicStyles.textSecondary]}>
            NaturaPiscis © 2025
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.sm,
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Sections
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  // Theme Options
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  themeOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  themeOptionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  themeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    gap: 6,
  },
  themeIndicatorText: {
    fontSize: 12,
  },
  // Menu Items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  menuItemText: {
    fontSize: 16,
  },
  versionText: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginHorizontal: SPACING.md,
  },
  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Footer
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});

export default ProfileScreen;
