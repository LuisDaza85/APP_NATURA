import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

const inventarioData = {
  peces: [
    { id: 1, nombre: "Tilapia", cantidad: 150, unidad: "kg", estado: "Disponible" },
    { id: 2, nombre: "Trucha", cantidad: 80, unidad: "kg", estado: "Baja" },
    { id: 3, nombre: "Pacú", cantidad: 0, unidad: "kg", estado: "Agotado" },
  ],
  alimentos: [
    { id: 1, nombre: "Alimento flotante 32%", cantidad: 20, unidad: "sacos", estado: "Disponible" },
    { id: 2, nombre: "Alimento para Trucha", cantidad: 5, unidad: "sacos", estado: "Bajo" },
  ],
  mantenimiento: [
    { id: 1, nombre: "Bomba de agua", cantidad: 2, unidad: "unidades", estado: "Operativas" },
    { id: 2, nombre: "Oxigenador", cantidad: 0, unidad: "unidades", estado: "Requiere reemplazo" },
  ],
};

const InventarioScreen = () => {
  const renderCategoria = (titulo, items) => (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.sectionTitle}>{titulo}</Text>
      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.cantidad}>
            {item.cantidad} {item.unidad}
          </Text>
          <Text style={styles.estado}>Estado: {item.estado}</Text>
          <TouchableOpacity style={styles.boton}>
            <Text style={styles.botonTexto}>Editar</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📦 Inventario General</Text>
      <Text style={styles.subtitle}>Resumen de productos, insumos y equipos</Text>

      {renderCategoria("🐟 Peces en stock", inventarioData.peces)}
      {renderCategoria("🍽️ Alimentos", inventarioData.alimentos)}
      {renderCategoria("🛠️ Equipos de Mantenimiento", inventarioData.mantenimiento)}
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
    fontSize: 24,
    color: "#38bdf8",
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    color: "#94a3b8",
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#e0f2fe",
    fontSize: 18,
    marginBottom: 8,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    borderColor: "#334155",
    borderWidth: 1,
    marginBottom: 12,
  },
  nombre: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  cantidad: {
    fontSize: 16,
    color: "#38bdf8",
    marginVertical: 4,
  },
  estado: {
    fontSize: 14,
    color: "#cbd5e1",
    marginBottom: 8,
  },
  boton: {
    backgroundColor: "#38bdf8",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  botonTexto: {
    color: "#0f172a",
    fontWeight: "bold",
  },
});

export default InventarioScreen;
