import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";

const PerfilScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que deseas cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          onPress: () => {
            logout();
            navigation.replace("Login"); // Redirige a Login
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil del Productor</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Nombre:</Text>
        <Text style={styles.value}>{user?.nombre || "-"}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Correo:</Text>
        <Text style={styles.value}>{user?.email || "-"}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Rol:</Text>
        <Text style={styles.value}>{user?.rol_id === 2 ? "Productor" : "Consumidor"}</Text>
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#38bdf8" />
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#0f172a" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 12,
  },
  backText: {
    color: "#38bdf8",
    marginLeft: 8,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#38bdf8",
    marginBottom: 30,
  },
  infoBox: {
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    color: "#94a3b8",
    fontWeight: "bold",
    marginBottom: 4,
  },
  value: {
    color: "#fff",
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#38bdf8",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 40,
  },
  logoutText: {
    marginLeft: 8,
    color: "#0f172a",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default PerfilScreen;
