
// src/services/authService.js
import axios from "../api/axiosConfig";

export const login = async (email, password) => {
  try {
    const response = await axios.post("/auth/login", { email, password }, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });

    return response.data;
  } catch (error) {
    const mensaje = error?.response?.data?.message || error?.response?.data?.error || "Credenciales inválidas.";
    const status = error?.response?.status || 500;
    throw { mensaje, status };
  }
};

export const register = async (nombre, email, password, rol) => {
  const rol_id = rol === "productor" ? 2 : 3;

  const response = await axios.post("/auth/registro", {
    nombre,
    email,
    password,
    rol_id,
    telefono: null, // puedes extenderlo si agregas un campo más
  }, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });

  return response.data; // debe contener { token, usuario }
};