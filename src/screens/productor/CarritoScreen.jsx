import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRoute } from "@react-navigation/native";

const CarritoScreen = () => {
  const route = useRoute();
  const productosIniciales = route.params?.producto
    ? [
        {
          ...route.params.producto,
          cantidad: 1,
          precioUnitario: parseFloat(route.params.producto.precio),
        },
      ]
    : [];

  const [productosEnCarrito, setProductosEnCarrito] = useState(productosIniciales);

  useEffect(() => {
    if (route.params?.producto) {
      const nuevo = route.params.producto;
      setProductosEnCarrito((prev) => {
        const yaExiste = prev.find((item) => item.id === nuevo.id);
        if (yaExiste) return prev;
        return [...prev, { ...nuevo, cantidad: 1, precioUnitario: parseFloat(nuevo.precio) }];
      });
    }
  }, [route.params?.producto]);

  const total = productosEnCarrito.reduce(
    (sum, item) => sum + item.cantidad * item.precioUnitario,
    0
  );

  const handleCheckout = () => {
    console.log("🧾 Checkout realizado.");
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>🧺 Catálogo del Productor</Text>

      {productosEnCarrito.map((item) => (
        <View key={item.id} style={styles.item}>
          <Image source={{ uri: item.imagen }} style={styles.imagen} />
          <View style={{ flex: 1, paddingLeft: 10 }}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.detalle}>{item.descripcion}</Text>
            <Text style={styles.detalle}>📦 Stock: {item.stock}</Text>
            <Text style={styles.detalle}>💲 Precio: {item.precioUnitario} Bs</Text>
            <Text style={styles.detalle}>⭐ Calidad: {item.calidad}</Text>
            <Text style={styles.detalle}>📍 Origen: {item.origen}</Text>
          </View>
        </View>
      ))}

      <View style={styles.totalContainer}>
        <Text style={styles.totalTexto}>Valor Total Estimado:</Text>
        <Text style={styles.totalValor}>{total.toFixed(2)} Bs</Text>
      </View>

      <TouchableOpacity style={styles.boton} onPress={handleCheckout}>
        <Text style={styles.botonTexto}>Confirmar Productos</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0f172a",
    padding: 20,
    minHeight: "100%",
  },
  title: {
    fontSize: 24,
    color: "#38bdf8",
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  item: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderColor: "#334155",
    borderWidth: 1,
    flexDirection: "row",
  },
  imagen: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  nombre: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  detalle: {
    color: "#94a3b8",
    fontSize: 14,
  },
  totalContainer: {
    marginTop: 10,
    padding: 16,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    borderColor: "#334155",
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalTexto: {
    color: "#cbd5e1",
    fontSize: 18,
  },
  totalValor: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  boton: {
    backgroundColor: "#38bdf8",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 24,
    alignItems: "center",
  },
  botonTexto: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CarritoScreen;
