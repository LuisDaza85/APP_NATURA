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
import { login } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser, setToken } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Campos vacíos", "Por favor, completa todos los campos.");
      return;
    }

    // Validación de formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Correo inválido", "Por favor, introduce un correo válido.");
      return;
    }

    try {
      const data = await login(email, password);
      const user = data.user || data.usuario;
      const token = data.token;

      if (!user || !token) {
        throw new Error("Respuesta inválida del servidor");
      }

      setUser(user);
      setToken(token);

      const rol = user.rol || (user.rol_id === 2 ? "productor" : "consumidor");
      navigation.replace(rol === "productor" ? "TabsProductor" : "TabsConsumidor");
    } catch (error) {
      if (error.status === 400) {
        if (error.mensaje?.toLowerCase().includes("credenciales")) {
          Alert.alert("Acceso denegado", "Correo o contraseña incorrectos.");
        } else {
          Alert.alert("Error", error.mensaje);
        }
      } else {
        Alert.alert("Error de red", "No se pudo conectar con el servidor.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>NaturaPiscis</Text>
      <Text style={styles.subtitle}>Bienvenido de nuevo a tu ecosistema acuático</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput
          placeholder="correo@ejemplo.com"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          placeholder="Tu contraseña"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar Sesión ⏎</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>o</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.oauthContainer}>
        <TouchableOpacity style={styles.oauthButton}><Text style={styles.oauthText}>Google</Text></TouchableOpacity>
        <TouchableOpacity style={styles.oauthButton}><Text style={styles.oauthText}>Apple</Text></TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.registerContainer} onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerText}>
          ¿No tienes una cuenta? <Text style={styles.linkHighlight}>Regístrate aquí</Text>
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
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    width: "100%",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#334155",
  },
  dividerText: {
    color: "#94a3b8",
    marginHorizontal: 10,
  },
  oauthContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  oauthButton: {
    backgroundColor: "#1e293b",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  oauthText: {
    color: "#fff",
    fontWeight: "bold",
  },
  registerContainer: {
    marginTop: 10,
  },
  registerText: {
    color: "#cbd5e1",
  },
  linkHighlight: {
    color: "#38bdf8",
    fontWeight: "bold",
  },
});

export default LoginScreen;
