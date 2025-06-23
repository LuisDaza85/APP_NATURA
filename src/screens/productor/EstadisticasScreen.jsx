import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width - 40;

const dataProduccion = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
  datasets: [{ data: [30, 45, 28, 80, 99, 43] }],
};

const dataVentas = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
  datasets: [{ data: [20, 30, 18, 60, 70, 50] }],
};

const chartConfig = {
  backgroundColor: "#1e293b",
  backgroundGradientFrom: "#1e293b",
  backgroundGradientTo: "#0f172a",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(56, 189, 248, ${opacity})`,
  labelColor: () => "#cbd5e1",
  style: {
    borderRadius: 16,
  },
};

const productosMasVendidos = [
  { nombre: "Tilapia", cantidad: 130 },
  { nombre: "Trucha", cantidad: 95 },
  { nombre: "Pacú", cantidad: 72 },
];

const EstadisticasScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📈 Estadísticas de Producción</Text>
      <Text style={styles.subtitle}>Últimos 6 meses</Text>

      <BarChart
        data={dataProduccion}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
        showValuesOnTopOfBars
      />

      <Text style={styles.title}>💰 Ventas Mensuales</Text>
      <LineChart
        data={dataVentas}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Producción Total</Text>
          <Text style={styles.cardValue}>489 kg</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Ingresos</Text>
          <Text style={styles.cardValue}>Bs. 3,200</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Clientes Atendidos</Text>
          <Text style={styles.cardValue}>48</Text>
        </View>
      </View>

      <Text style={styles.title}>🐟 Productos más vendidos</Text>
      {productosMasVendidos.map((producto, index) => (
        <View key={index} style={styles.productoCard}>
          <Ionicons name="fish-outline" size={20} color="#38bdf8" />
          <Text style={styles.productoTexto}>{producto.nombre}</Text>
          <Text style={styles.productoCantidad}>{producto.cantidad} ventas</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0f172a",
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    color: "#38bdf8",
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    color: "#94a3b8",
    marginBottom: 20,
  },
  chart: {
    borderRadius: 16,
    marginBottom: 30,
  },
  summaryContainer: {
    gap: 16,
    marginBottom: 30,
  },
  summaryCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    borderColor: "#334155",
    borderWidth: 1,
  },
  cardTitle: {
    color: "#cbd5e1",
    fontSize: 14,
    marginBottom: 6,
  },
  cardValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  productoCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1e293b",
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
    borderColor: "#334155",
    borderWidth: 1,
  },
  productoTexto: {
    color: "#f8fafc",
    fontSize: 16,
    flex: 1,
    marginLeft: 8,
  },
  productoCantidad: {
    color: "#cbd5e1",
    fontSize: 14,
  },
});

export default EstadisticasScreen;
