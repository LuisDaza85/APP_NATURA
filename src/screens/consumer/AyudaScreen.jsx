// src/screens/consumer/AyudaScreen.jsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AyudaScreen = ({ navigation }) => {
  const faqs = [
    {
      icon: 'cart-outline',
      question: '¿Cómo realizar un pedido?',
      answer: 'Navega a la tienda, selecciona productos y añádelos al carrito.',
    },
    {
      icon: 'person-outline',
      question: '¿Cómo contactar a un productor?',
      answer: 'Visita el perfil del productor y usa el botón de contacto.',
    },
    {
      icon: 'list-outline',
      question: '¿Cómo gestionar tus pedidos y favoritos?',
      answer: 'Ve a "Mis Pedidos" o "Favoritos" en el menú principal.',
    },
    {
      icon: 'settings-outline',
      question: '¿Cómo actualizar tu información de perfil?',
      answer: 'Accede a tu perfil y presiona "Editar".',
    },
    {
      icon: 'fish-outline',
      question: '¿Cómo sé si el pescado es fresco?',
      answer: 'Todos nuestros productores están verificados y monitoreamos la calidad.',
    },
    {
      icon: 'location-outline',
      question: '¿Hacen envíos a mi zona?',
      answer: 'Consulta la cobertura de envío en el perfil de cada productor.',
    },
  ];

  const handleEmail = () => {
    Linking.openURL('mailto:soporte@naturapiscis.com');
  };

  const handleCall = () => {
    Linking.openURL('tel:+59112345678');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="help-circle" size={48} color="#3B82F6" />
        </View>
        <Text style={styles.title}>Centro de Ayuda</Text>
        <Text style={styles.subtitle}>
          Bienvenido al Centro de Ayuda de NaturaPiscis.{'\n'}
          Aquí encontrarás respuestas a tus preguntas.
        </Text>
      </View>

      {/* FAQs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preguntas Frecuentes</Text>
        
        {faqs.map((faq, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.faqItem}
            activeOpacity={0.7}
          >
            <View style={styles.faqIcon}>
              <Ionicons name={faq.icon} size={24} color="#3B82F6" />
            </View>
            <View style={styles.faqContent}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Contacto */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>¿Necesitas más ayuda?</Text>
        <Text style={styles.contactText}>
          Nuestro equipo está disponible de Lunes a Viernes, 9:00 - 18:00
        </Text>
        
        <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
          <Ionicons name="mail-outline" size={20} color="#FFF" />
          <Text style={styles.contactButtonText}>Enviar correo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.contactButton, styles.contactButtonOutline]} 
          onPress={handleCall}
        >
          <Ionicons name="call-outline" size={20} color="#3B82F6" />
          <Text style={styles.contactButtonTextOutline}>Llamar soporte</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.contactButton, styles.contactButtonWhatsApp]}
          onPress={() => Linking.openURL('https://wa.me/59112345678')}
        >
          <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
          <Text style={styles.contactButtonText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>

      {/* Versión */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>NaturaPiscis v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  faqIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  faqContent: {
    flex: 1,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  contactButtonOutline: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  contactButtonTextOutline: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  contactButtonWhatsApp: {
    backgroundColor: '#25D366',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default AyudaScreen;