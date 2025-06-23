import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const DashboardScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.welcome}>👋 Hola, bienvenido a NaturaPiscis</Text>

      {/* Cards rápidas */}
      <View style={styles.cardsRow}>
        <Card icon="fish" title="Productos frescos" />
        <Card icon="leaf" title="Cultivo sostenible" />
      </View>
      <View style={styles.cardsRow}>
        <Card icon="rocket" title="Entrega rápida" />
        <Card icon="shield-checkmark" title="Calidad garantizada" />
      </View>

      {/* Pedidos recientes */}
      <Text style={styles.sectionTitle}>🧾 Pedidos recientes</Text>
      <Text style={styles.placeholder}>No tienes pedidos aún.</Text>

      {/* Recomendados */}
      <Text style={styles.sectionTitle}>🎯 Recomendados para ti</Text>
      <Text style={styles.placeholder}>Explora productos en la Tienda.</Text>
    </ScrollView>
  );
};

const Card = ({ icon, title }) => (
  <View style={styles.card}>
    <Ionicons name={icon} size={28} color="#38bdf8" />
    <Text style={styles.cardText}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // 👈 Evita el fondo blanco
    padding: 20,
    backgroundColor: "#0f172a",
  },
  welcome: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 20,
    fontWeight: "bold",
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#1e293b",
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  cardText: {
    marginTop: 8,
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    color: "#38bdf8",
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 8,
  },
  placeholder: {
    color: "#94a3b8",
    marginBottom: 12,
  },
});

export default DashboardScreen;
