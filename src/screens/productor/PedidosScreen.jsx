import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const pedidosSimulados = [
  { id: 1, producto: "Tilapia", cantidad: 10, fecha: "2025-06-10", estado: "Entregado" },
  { id: 2, producto: "Trucha", cantidad: 5, fecha: "2025-06-08", estado: "Pendiente" },
  { id: 3, producto: "Pacú", cantidad: 12, fecha: "2025-06-06", estado: "En camino" },
  { id: 4, producto: "Surubí", cantidad: 4, fecha: "2025-06-05", estado: "Entregado" },
];

const estados = ["Todos", "Pendiente", "En camino", "Entregado"];

const PedidosScreen = () => {
  const [estadoActivo, setEstadoActivo] = useState("Todos");

  const pedidosFiltrados =
    estadoActivo === "Todos"
      ? pedidosSimulados
      : pedidosSimulados.filter((p) => p.estado === estadoActivo);

  const getEstadoIcon = (estado) => {
    switch (estado.toLowerCase()) {
      case "entregado": return "checkmark-circle-outline";
      case "pendiente": return "time-outline";
      case "en camino": return "car-outline";
      default: return "help-circle-outline";
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado.toLowerCase()) {
      case "entregado": return "#4ade80";
      case "pendiente": return "#facc15";
      case "en camino": return "#38bdf8";
      default: return "#f8fafc";
    }
  };

  const renderFiltro = (estado) => (
    <TouchableOpacity
      key={estado}
      style={[
        styles.filtroBtn,
        estadoActivo === estado && styles.filtroBtnActivo,
      ]}
      onPress={() => setEstadoActivo(estado)}
    >
      <Text style={[
        styles.filtroTexto,
        estadoActivo === estado && styles.filtroTextoActivo
      ]}>
        {estado}
      </Text>
    </TouchableOpacity>
  );

  const renderPedido = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons name="fish-outline" size={20} color="#38bdf8" />
        <Text style={styles.producto}> {item.producto}</Text>
      </View>
      <Text style={styles.detalle}>📦 Cantidad: {item.cantidad}</Text>
      <Text style={styles.detalle}>📅 Fecha: {item.fecha}</Text>
      <View style={styles.estadoRow}>
        <Ionicons name={getEstadoIcon(item.estado)} size={16} color={getEstadoColor(item.estado)} />
        <Text style={[styles.estado, { color: getEstadoColor(item.estado) }]}>
          {"  "}{item.estado}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Pedidos del Productor</Text>

      <View style={styles.filtrosContainer}>
        {estados.map(renderFiltro)}
      </View>

      <FlatList
        data={pedidosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPedido}
        contentContainerStyle={{
          paddingBottom: 20,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay pedidos en esta categoría.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#38bdf8",
    marginBottom: 16,
    textAlign: "center",
  },
  filtrosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  filtroBtn: {
    width: "23%",
    height: 38,
    borderRadius: 12,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  filtroBtnActivo: {
    backgroundColor: "#38bdf8",
    borderColor: "#38bdf8",
  },
  filtroTexto: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#94a3b8",
  },
  filtroTextoActivo: {
    color: "#0f172a",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderColor: "#334155",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  producto: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#f8fafc",
  },
  detalle: {
    color: "#cbd5e1",
    fontSize: 14,
    marginBottom: 2,
  },
  estadoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  estado: {
    fontWeight: "bold",
    fontSize: 14,
  },
  empty: {
    color: "#64748b",
    textAlign: "center",
    marginTop: 40,
    fontSize: 14,
  },
});

export default PedidosScreen;
