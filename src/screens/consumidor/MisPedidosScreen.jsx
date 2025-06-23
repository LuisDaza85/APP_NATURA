import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

const pedidos = [
  {
    id: "PED001",
    fecha: "2025-06-10",
    productos: [
      { nombre: "Tilapia", cantidad: 2, subtotal: 50 },
      { nombre: "Trucha", cantidad: 1, subtotal: 30 },
    ],
    total: 80,
    estado: "Entregado",
    metodo: "Tarjeta Débito",
  },
  {
    id: "PED002",
    fecha: "2025-06-12",
    productos: [{ nombre: "Pacú", cantidad: 3, subtotal: 84 }],
    total: 84,
    estado: "Confirmado",
    metodo: "QR",
  },
];

const MisPedidosScreen = () => (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>📋 Historial de Pedidos</Text>

    {pedidos.length === 0 ? (
      <Text style={styles.empty}>No has realizado pedidos aún.</Text>
    ) : (
      pedidos.map((pedido) => (
        <View key={pedido.id} style={styles.card}>
          <Text style={styles.id}>Pedido: {pedido.id}</Text>
          <Text style={styles.fecha}>Fecha: {pedido.fecha}</Text>
          <Text style={styles.estado}>Estado: {pedido.estado}</Text>

          <View style={styles.productos}>
            {pedido.productos.map((prod, index) => (
              <Text key={index} style={styles.producto}>
                • {prod.nombre} x{prod.cantidad} — {prod.subtotal} Bs
              </Text>
            ))}
          </View>

          <Text style={styles.total}>💵 Total: {pedido.total} Bs</Text>
          <Text style={styles.metodo}>Método: {pedido.metodo}</Text>
        </View>
      ))
    )}
  </ScrollView>
);

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
    marginBottom: 20,
  },
  empty: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 60,
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderColor: "#334155",
    borderWidth: 1,
  },
  id: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  fecha: {
    color: "#cbd5e1",
    fontSize: 14,
    marginTop: 4,
  },
  estado: {
    color: "#facc15",
    fontSize: 14,
    marginTop: 2,
    marginBottom: 6,
  },
  productos: {
    marginTop: 4,
    marginBottom: 6,
  },
  producto: {
    color: "#94a3b8",
    fontSize: 14,
  },
  total: {
    color: "#38bdf8",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  metodo: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 2,
  },
});

export default MisPedidosScreen;
