import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const notificacionesSimuladas = [
  {
    id: 1,
    tipo: "pedido",
    mensaje: "📦 Tu pedido #1234 fue enviado",
    fecha: "13/06/2025",
  },
  {
    id: 2,
    tipo: "promocion",
    mensaje: "🐟 ¡Tilapia con 15% de descuento solo hoy!",
    fecha: "13/06/2025",
  },
  {
    id: 3,
    tipo: "alerta",
    mensaje: "⚠️ El producto Trucha está por agotarse",
    fecha: "12/06/2025",
  },
];

const NotificacionesScreen = () => {
  const [notificaciones, setNotificaciones] = useState(notificacionesSimuladas);

  const borrarNotificacion = (id) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🔔 Notificaciones</Text>

      {notificaciones.length === 0 ? (
        <Text style={styles.empty}>No tienes notificaciones recientes.</Text>
      ) : (
        notificaciones.map((notif) => (
          <View key={notif.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.mensaje}>{notif.mensaje}</Text>
              <Text style={styles.fecha}>{notif.fecha}</Text>
            </View>
            <TouchableOpacity
              onPress={() => borrarNotificacion(notif.id)}
              style={styles.botonBorrar}
            >
              <Ionicons name="trash" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ))
      )}
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
    marginBottom: 20,
  },
  empty: {
    color: "#94a3b8",
    fontSize: 16,
    textAlign: "center",
    marginTop: 80,
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderColor: "#334155",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  mensaje: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 4,
  },
  fecha: {
    color: "#94a3b8",
    fontSize: 12,
  },
  botonBorrar: {
    marginLeft: 10,
    backgroundColor: "#ef4444",
    padding: 8,
    borderRadius: 8,
  },
});

export default NotificacionesScreen;
