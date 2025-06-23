// src/screens/productor/DashboardScreen.jsx
import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { AuthContext } from "../../context/AuthContext";
const screenWidth = Dimensions.get("window").width;

const DashboardScreen = () => {
  const { user } = useContext(AuthContext);

  const dataProduccion = [
    { dia: "Lun", valor: 20 },
    { dia: "Mar", valor: 35 },
    { dia: "Mié", valor: 25 },
    { dia: "Jue", valor: 40 },
    { dia: "Vie", valor: 30 },
    { dia: "Sáb", valor: 50 },
    { dia: "Dom", valor: 45 },
  ];

  const especies = [
    { nombre: "Trucha", valor: 30, color: "#38bdf8" },
    { nombre: "Tilapia", valor: 20, color: "#6366f1" },
    { nombre: "Pacú", valor: 15, color: "#10b981" },
    { nombre: "Otro", valor: 10, color: "#f59e0b" },
  ];

  const sensores = [
    { tipo: "Temperatura", valor: "24.3 °C" },
    { tipo: "pH del agua", valor: "7.4" },
    { tipo: "Oxígeno disuelto", valor: "6.5 mg/L" },
  ];

  const alertas = [
    "Nivel de pH bajo en estanque 2",
    "Sensor de temperatura desconectado",
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        ¡Hola, <Text style={styles.highlight}>{user?.nombre || "Productor"}</Text>! 👋
      </Text>
      <Text style={styles.subtitle}>Bienvenido a tu panel de control acuícola.</Text>

      {/* Estadísticas rápidas */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>🐟 Productos</Text>
          <Text style={styles.statValue}>12</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>📦 Pedidos</Text>
          <Text style={styles.statValue}>5</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>📈 Rendimiento</Text>
          <Text style={styles.statValue}>87%</Text>
        </View>
      </View>

      {/* Gráfico por especie */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🥧 Producción por especie</Text>
        <PieChart
          data={especies.map((esp) => ({
            name: esp.nombre,
            population: esp.valor,
            color: esp.color,
            legendFontColor: "#f8fafc",
            legendFontSize: 13,
          }))}
          width={screenWidth - 48}
          height={180}
          chartConfig={{
            backgroundColor: "#1e293b",
            backgroundGradientFrom: "#1e293b",
            backgroundGradientTo: "#1e293b",
            color: () => "#f8fafc",
            labelColor: () => "#f8fafc",
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      {/* Producción semanal */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Producción Semanal</Text>
        <View style={styles.graphContainer}>
          {dataProduccion.map((item, i) => (
            <View key={i} style={styles.barGroup}>
              <View style={[styles.bar, { height: item.valor * 2 }]} />
              <Text style={styles.barLabel}>{item.dia}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Sensores */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔬 Sensores Activos</Text>
        {sensores.map((sensor, idx) => (
          <Text key={idx} style={styles.sensorText}>• {sensor.tipo}: {sensor.valor}</Text>
        ))}
      </View>

      {/* Alertas */}
      <View style={[styles.card, { borderColor: "#f87171" }]}>
        <Text style={[styles.cardTitle, { color: "#f87171" }]}>🚨 Alertas</Text>
        {alertas.map((alerta, idx) => (
          <Text key={idx} style={styles.alertText}>• {alerta}</Text>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0f172a",
    padding: 24,
    paddingTop: 60,
    minHeight: "100%",
  },
  title: {
    fontSize: 24,
    color: "#38bdf8",
    fontWeight: "bold",
    marginBottom: 4,
  },
  highlight: {
    color: "#f8fafc",
  },
  subtitle: {
    color: "#94a3b8",
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 12,
    borderColor: "#334155",
    borderWidth: 1,
    width: "30%",
    alignItems: "center",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 6,
  },
  statValue: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    color: "#f8fafc",
    fontWeight: "bold",
    marginBottom: 12,
  },
  graphContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 120,
    marginTop: 8,
  },
  barGroup: {
    alignItems: "center",
  },
  bar: {
    width: 14,
    backgroundColor: "#38bdf8",
    borderRadius: 6,
  },
  barLabel: {
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 4,
  },
  sensorText: {
    color: "#cbd5e1",
    fontSize: 14,
    marginBottom: 6,
  },
  alertText: {
    color: "#f87171",
    fontSize: 14,
    marginTop: 6,
  },
});

export default DashboardScreen;
