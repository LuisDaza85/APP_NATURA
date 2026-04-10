// src/components/common/Card.jsx
// Componente de tarjeta reutilizable

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, BORDER_RADIUS } from '../../constants/theme';

export const Card = ({
  children,
  variant = 'default', // default, elevated, outlined
  onPress,
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const Component = onPress ? TouchableOpacity : View;

  const dynamicStyles = {
    backgroundColor: variant === 'outlined' ? 'transparent' : colors.card,
    borderColor: colors.cardBorder,
  };

  return (
    <Component
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.card,
        dynamicStyles,
        variant === 'elevated' && styles.elevated,
        variant === 'outlined' && styles.outlined,
        style,
      ]}
      {...props}
    >
      {children}
    </Component>
  );
};

export const CardHeader = ({ children, title, subtitle, action, style }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerContent}>
        {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
        {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
        {children}
      </View>
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
};

export const CardBody = ({ children, style }) => (
  <View style={[styles.body, style]}>{children}</View>
);

export const CardFooter = ({ children, style }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.footer, { borderTopColor: colors.border }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 0,
  },
  outlined: {
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
  },
  action: {
    marginLeft: SPACING.sm,
  },
  body: {
    marginVertical: SPACING.xs,
  },
  footer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
  },
});

export default Card;
