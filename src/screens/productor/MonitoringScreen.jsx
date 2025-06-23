import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const sensoresSimulados = [
  {
    id: 1,
    tipo: "Temperatura",
    valor: "24.5 °C",
    estado: "Estable",
    especie: "Tilapia",
    hora: "14:32",
    estanque: "Piscina 1",
    valorRecomendado: "22 - 28 °C",
  },
  {
    id: 2,
    tipo: "pH",
    valor: "7.1",
    estado: "Óptimo",
    especie: "Trucha",
    hora: "14:30",
    estanque: "Piscina 2",
    valorRecomendado: "6.5 - 7.5",
  },
  {
    id: 3,
    tipo: "Oxígeno",
    valor: "6.8 mg/L",
    estado: "Adecuado",
    especie: "Pacú",
    hora: "14:29",
    estanque: "Piscina 3",
    valorRecomendado: "> 5.0 mg/L",
  },
  {
    id: 4,
    tipo: "Turbidez",
    valor: "12 NTU",
    estado: "Bajo",
    especie: "Surubí",
    hora: "14:27",
    estanque: "Piscina 4",
    valorRecomendado: "< 15 NTU",
  },
];

const getEstadoColor = (estado) => {
  switch (estado.toLowerCase()) {
    case "óptimo": return "#4ade80";
    case "estable": return "#38bdf8";
    case "adecuado": return "#facc15";
    case "bajo": return "#f87171";
    default: return "#94a3b8";
  }
};

const getEstadoIcon = (estado) => {
  switch (estado.toLowerCase()) {
    case "óptimo": return "checkmark-circle-outline";
    case "estable": return "water-outline";
    case "adecuado": return "alert-circle-outline";
    case "bajo": return "warning-outline";
    default: return "help-outline";
  }
};

const getTipoIcon = (tipo) => {
  switch (tipo.toLowerCase()) {
    case "temperatura": return "thermometer-outline";
    case "ph": return "flask-outline";
    case "oxígeno": return "water-outline";
    case "turbidez": return "eye-outline";
    default: return "analytics-outline";
  }
};

const MonitoringScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🌊 Monitoreo de Piscinas</Text>
      <Text style={styles.subtitle}>Lecturas actuales por especie y estanque</Text>

      <View style={styles.cardsContainer}>
        {sensoresSimulados.map((sensor) => (
          <View
            key={sensor.id}
            style={[styles.card, { borderColor: getEstadoColor(sensor.estado), backgroundColor: sensor.estado.toLowerCase() === "bajo" ? "#7f1d1d" : "#1e293b" }]}
          >
            <View style={styles.rowBetween}>
              <Text style={styles.especie}>🐟 {sensor.especie} | {sensor.estanque}</Text>
              <Text style={styles.hora}>🕒 {sensor.hora}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name={getTipoIcon(sensor.tipo)} size={20} color="#38bdf8" />
              <Text style={styles.tipo}> {sensor.tipo}</Text>
            </View>

            <Text style={styles.valor}>{sensor.valor}</Text>

            <Text style={styles.recomendado}>Ideal: {sensor.valorRecomendado}</Text>

            <View style={styles.estadoRow}>
              <Ionicons name={getEstadoIcon(sensor.estado)} size={16} color={getEstadoColor(sensor.estado)} />
              <Text style={[styles.estadoTexto, { color: getEstadoColor(sensor.estado) }]}>  Estado: {sensor.estado}</Text>
            </View>

            <TouchableOpacity style={styles.historialBtn}>
              <Text style={styles.historialText}>📊 Ver histórico</Text>
            </TouchableOpacity>
          </View>
        ))}
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
    fontSize: 24,
    color: "#38bdf8",
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    color: "#94a3b8",
    marginBottom: 20,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
  },
  especie: {
    color: "#e0f2fe",
    fontSize: 16,
    fontWeight: "bold",
  },
  hora: {
    color: "#94a3b8",
    fontSize: 13,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tipo: {
    color: "#cbd5e1",
    fontSize: 16,
    marginLeft: 4,
  },
  valor: {
    color: "#38bdf8",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 6,
  },
  recomendado: {
    color: "#cbd5e1",
    fontSize: 13,
    marginBottom: 4,
  },
  estadoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  estadoTexto: {
    fontSize: 14,
    fontWeight: "600",
  },
  historialBtn: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#334155",
    borderRadius: 8,
    alignItems: "center",
  },
  historialText: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default MonitoringScreen;
