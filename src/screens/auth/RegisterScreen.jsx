import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { register } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

const RegisterScreen = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("consumidor");

  const { setUser, setToken } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleRegister = async () => {
  if (!nombre.trim() || !email.trim() || !password.trim() || !rol) {
    Alert.alert("Campos incompletos", "Por favor llena todos los campos antes de continuar.");
    return;
  }

  try {
    const data = await register(nombre, email, password, rol);
    const user = data.user || data.usuario;
    const token = data.token;

    if (!user || !token) {
      throw new Error("Respuesta inválida del servidor");
    }

    // Omitimos guardar user/token hasta que inicie sesión realmente
    Alert.alert("Registro exitoso", "Ahora inicia sesión con tus credenciales.");
    navigation.replace("Login");

  } catch (error) {
    console.error("❌ Error en registro:", error);
    Alert.alert("Error", "No se pudo registrar. Verifica los datos o conexión.");
  }
};



  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/logo.png")} // asegúrate de tener el logo
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>NaturaPiscis</Text>
      <Text style={styles.subtitle}>Crea tu cuenta y únete al ecosistema</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          placeholder="Ej. Juan Pérez"
          placeholderTextColor="#94a3b8"
          value={nombre}
          onChangeText={setNombre}
          style={styles.input}
        />

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          placeholder="correo@ejemplo.com"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.input}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          placeholder="Tu contraseña"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <Text style={styles.label}>Selecciona tu rol</Text>
        <View style={styles.roleSelector}>
          <TouchableOpacity
            style={[styles.roleOption, rol === "consumidor" && styles.selectedRole]}
            onPress={() => setRol("consumidor")}
          >
            <Text style={styles.roleText}>Consumidor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleOption, rol === "productor" && styles.selectedRole]}
            onPress={() => setRol("productor")}
          >
            <Text style={styles.roleText}>Productor</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse ⏎</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerContainer}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.registerText}>
          ¿Ya tienes una cuenta?{" "}
          <Text style={styles.linkHighlight}>Inicia sesión</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    color: "#38bdf8",
    fontSize: 26,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#cbd5e1",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    color: "#cbd5e1",
    marginBottom: 6,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    marginBottom: 16,
  },
  roleSelector: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  roleOption: {
    flex: 1,
    backgroundColor: "#1e293b",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
  },
  selectedRole: {
    backgroundColor: "#38bdf8",
  },
  roleText: {
    color: "#fff",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#38bdf8",
    paddingVertical: 14,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#0f172a",
    fontWeight: "bold",
    fontSize: 16,
  },
  registerContainer: {
    marginTop: 20,
  },
  registerText: {
    color: "#cbd5e1",
  },
  linkHighlight: {
    color: "#38bdf8",
    fontWeight: "bold",
  },
});

export default RegisterScreen;
