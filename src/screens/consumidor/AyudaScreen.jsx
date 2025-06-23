import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const AyudaScreen = () => {
  const llamar = () => {
    Linking.openURL("tel:+59171234567");
  };

  const enviarCorreo = () => {
    Linking.openURL("mailto:soporte@naturapiscis.com?subject=Necesito ayuda");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🆘 Centro de Ayuda</Text>
      <Text style={styles.subtitle}>¿Tienes alguna duda o problema?</Text>

      <TouchableOpacity style={styles.card} onPress={llamar}>
        <Ionicons name="call" size={24} color="#38bdf8" />
        <Text style={styles.cardText}>Llamar al soporte: +591 71234567</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={enviarCorreo}>
        <Ionicons name="mail" size={24} color="#38bdf8" />
        <Text style={styles.cardText}>Enviar correo a soporte@naturapiscis.com</Text>
      </TouchableOpacity>

      <View style={styles.faqBox}>
        <Text style={styles.faqTitle}>❓ Preguntas Frecuentes</Text>
        <Text style={styles.faqItem}>• ¿Cómo realizo una compra?</Text>
        <Text style={styles.faqItem}>• ¿Cómo puedo contactar a un productor?</Text>
        <Text style={styles.faqItem}>• ¿Qué métodos de pago están disponibles?</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0f172a",
    padding: 20,
    minHeight: "100%",
  },
  title: {
    fontSize: 22,
    color: "#38bdf8",
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 16,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#1e293b",
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    borderColor: "#334155",
    borderWidth: 1,
    marginBottom: 12,
  },
  cardText: {
    color: "#fff",
    marginLeft: 12,
    fontSize: 16,
  },
  faqBox: {
    marginTop: 20,
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 10,
    borderColor: "#334155",
    borderWidth: 1,
  },
  faqTitle: {
    color: "#38bdf8",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  faqItem: {
    color: "#cbd5e1",
    fontSize: 14,
    marginBottom: 4,
  },
});

export default AyudaScreen;
