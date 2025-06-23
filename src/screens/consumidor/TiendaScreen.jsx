import React from "react";
import { useNavigation } from "@react-navigation/native";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";

const productosDisponibles = [
  {
    id: 1,
    nombre: "Tilapia",
    descripcion: "Fresca, cultivada naturalmente en estanques libres de químicos.",
    precio: 25,
    stock: 100,
    estado: "Disponible",
    productor: "Acuícola Los Andes",
    imagen: "https://www.bioaquafloc.com/wp-content/uploads/2018/06/20140620100334.jpg",
  },
  {
    id: 2,
    nombre: "Trucha",
    descripcion: "Rica en proteínas, criada en agua de manantial.",
    precio: 30,
    stock: 60,
    estado: "Disponible",
    productor: "Piscifactoría Truchas del Valle",
    imagen: "https://www.bioaquafloc.com/wp-content/uploads/2018/06/20140620100334.jpg",
  },
  {
    id: 3,
    nombre: "Pacú",
    descripcion: "Ideal para parrilla, sabor suave y textura firme.",
    precio: 28,
    stock: 0,
    estado: "Agotado",
    productor: "Granja El Pacú Dorado",
    imagen: "https://www.bioaquafloc.com/wp-content/uploads/2018/06/20140620100334.jpg",
  },
];

const TiendaScreen = () => {
      const navigation = useNavigation();

  const handleComprar = (producto) => {
    if (producto.stock <= 0) {
      Alert.alert("Producto no disponible", "Este producto está agotado.");
    } else {
      navigation.navigate("Carrito", {
        producto: {
          ...producto,
          cantidad: 1, // Por defecto
        },
      });
    }
  };

  const handleVerDetalles = (producto) => {
    Alert.alert(
      producto.nombre,
      `🌍 Productor: ${producto.productor}
📅 Estado: ${producto.estado}
💵 Precio: ${producto.precio} Bs
📉 Stock disponible: ${producto.stock} unidades
📝 Descripción: ${producto.descripcion}`
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🛍️ Tienda de Productos</Text>
      <Text style={styles.subtitle}>Selecciona productos frescos directamente del productor</Text>

      {productosDisponibles.map((item) => (
        <View key={item.id} style={styles.card}>
          <Image source={{ uri: item.imagen }} style={styles.imagen} />
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.productor}>👤 {item.productor}</Text>
          <Text style={styles.descripcion}>{item.descripcion}</Text>
          <Text style={styles.precio}>💲 {item.precio} Bs</Text>
          <Text style={styles.stock}>📦 Stock: {item.stock}</Text>
          <Text style={styles.estado}>Estado: {item.estado}</Text>

          <View style={styles.botonesRow}>
            <TouchableOpacity
              style={[styles.boton, item.stock <= 0 && styles.botonDeshabilitado]}
              onPress={() => handleComprar(item)}
              disabled={item.stock <= 0}
            >
              <Text style={styles.botonTexto}>
                {item.stock <= 0 ? "No disponible" : "Añadir al carrito"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botonDetalles} onPress={() => handleVerDetalles(item)}>
              <Text style={styles.detallesTexto}>Ver detalles</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
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
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    borderColor: "#334155",
    borderWidth: 1,
    marginBottom: 20,
  },
  imagen: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
  },
  nombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  productor: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 4,
  },
  descripcion: {
    fontSize: 14,
    color: "#cbd5e1",
    marginBottom: 6,
  },
  precio: {
    color: "#38bdf8",
    fontSize: 16,
    marginBottom: 2,
  },
  stock: {
    fontSize: 14,
    color: "#94a3b8",
  },
  estado: {
    fontSize: 14,
    color: "#facc15",
    marginBottom: 10,
  },
  botonesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  boton: {
    backgroundColor: "#38bdf8",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginRight: 8,
  },
  botonDeshabilitado: {
    backgroundColor: "#64748b",
  },
  botonTexto: {
    color: "#0f172a",
    fontWeight: "bold",
  },
  botonDetalles: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#38bdf8",
    alignItems: "center",
  },
  detallesTexto: {
    color: "#38bdf8",
    fontWeight: "bold",
  },
});

export default TiendaScreen;
