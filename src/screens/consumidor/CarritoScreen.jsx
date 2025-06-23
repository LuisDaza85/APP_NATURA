import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";

const CarritoScreen = () => {
  const route = useRoute();
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState("debito");

  useEffect(() => {
    if (route.params?.producto) {
      const nuevo = route.params.producto;
      setCarrito((prev) => {
        const yaExiste = prev.find((p) => p.id === nuevo.id);
        if (yaExiste) return prev;
        return [...prev, { ...nuevo, cantidad: 1 }];
      });
    }
  }, [route.params?.producto]);

  const actualizarCantidad = (id, tipo) => {
    setCarrito((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          let nuevaCantidad = tipo === "sumar" ? item.cantidad + 1 : item.cantidad - 1;
          if (nuevaCantidad < 1) nuevaCantidad = 1;
          if (nuevaCantidad > item.stock) nuevaCantidad = item.stock;
          return { ...item, cantidad: nuevaCantidad };
        }
        return item;
      })
    );
  };

  const calcularTotal = () => {
    return carrito.reduce(
      (total, prod) => total + prod.precio * prod.cantidad,
      0
    ).toFixed(2);
  };

  const handleCompra = () => {
    Alert.alert(
      "✅ Compra realizada",
      `Método: ${metodoPago === "debito" ? "Tarjeta de Débito" : "QR"}\nTotal pagado: ${calcularTotal()} Bs`
    );
    setCarrito([]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🛒 Carrito de Compras</Text>

      {carrito.length === 0 ? (
        <Text style={styles.empty}>Tu carrito está vacío por ahora.</Text>
      ) : (
        carrito.map((item) => (
          <View key={item.id} style={styles.card}>
            <Image
              source={{ uri: item.imagen }}
              style={styles.imagen}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.detalle}>Precio: {item.precio} Bs</Text>
              <View style={styles.cantidadBox}>
                <TouchableOpacity
                  onPress={() => actualizarCantidad(item.id, "restar")}
                  style={styles.botonCantidad}
                >
                  <Text style={styles.botonCantidadTexto}>-</Text>
                </TouchableOpacity>
                <Text style={styles.cantidadTexto}>{item.cantidad}</Text>
                <TouchableOpacity
                  onPress={() => actualizarCantidad(item.id, "sumar")}
                  style={styles.botonCantidad}
                >
                  <Text style={styles.botonCantidadTexto}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.detalle}>
                Total: {(item.precio * item.cantidad).toFixed(2)} Bs
              </Text>
            </View>
          </View>
        ))
      )}

      {carrito.length > 0 && (
        <>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total estimado:</Text>
            <Text style={styles.totalValue}>{calcularTotal()} Bs</Text>
          </View>

          <View style={styles.pagoBox}>
            <Text style={styles.pagoTitulo}>💳 Método de Pago</Text>
            <View style={styles.pagoOpciones}>
              <TouchableOpacity
                style={[
                  styles.pagoBoton,
                  metodoPago === "debito" && styles.pagoBotonActivo,
                ]}
                onPress={() => setMetodoPago("debito")}
              >
                <Text style={styles.pagoTexto}>Tarjeta Débito</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.pagoBoton,
                  metodoPago === "qr" && styles.pagoBotonActivo,
                ]}
                onPress={() => setMetodoPago("qr")}
              >
                <Text style={styles.pagoTexto}>Pagar con QR</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.botonComprar} onPress={handleCompra}>
            <Text style={styles.botonTexto}>Confirmar Compra</Text>
          </TouchableOpacity>
        </>
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
    marginBottom: 16,
    borderColor: "#334155",
    borderWidth: 1,
    flexDirection: "row",
  },
  imagen: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  nombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  detalle: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 4,
  },
  cantidadBox: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  botonCantidad: {
    backgroundColor: "#38bdf8",
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  botonCantidadTexto: {
    color: "#0f172a",
    fontWeight: "bold",
    fontSize: 18,
  },
  cantidadTexto: {
    marginHorizontal: 12,
    color: "#fff",
    fontSize: 16,
  },
  totalBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    borderColor: "#334155",
    borderWidth: 1,
  },
  totalLabel: {
    color: "#cbd5e1",
    fontSize: 16,
  },
  totalValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  pagoBox: {
    marginTop: 24,
    marginBottom: 12,
  },
  pagoTitulo: {
    color: "#38bdf8",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  pagoOpciones: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pagoBoton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#334155",
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
  },
  pagoBotonActivo: {
    backgroundColor: "#38bdf8",
  },
  pagoTexto: {
    color: "#fff",
    fontWeight: "bold",
  },
  botonComprar: {
    marginTop: 16,
    backgroundColor: "#16a34a",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  botonTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default CarritoScreen;
