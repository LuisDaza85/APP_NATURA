import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión al iniciar la app
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedToken = await AsyncStorage.getItem("token");

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch (error) {
        console.error("❌ Error al cargar sesión:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  // Guardar sesión cuando cambia
  useEffect(() => {
    const saveSession = async () => {
      try {
        if (user && token) {
          await AsyncStorage.setItem("user", JSON.stringify(user));
          await AsyncStorage.setItem("token", token);
        }
      } catch (error) {
        console.error("❌ Error al guardar sesión:", error);
      }
    };

    saveSession();
  }, [user, token]);

  // Cerrar sesión
  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(["user", "token"]);
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
