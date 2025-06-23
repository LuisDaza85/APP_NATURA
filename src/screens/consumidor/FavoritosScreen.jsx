import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";

const productosFavoritosSimulados = [
  {
    id: 1,
    nombre: "Tilapia",
    descripcion: "Fresca y saludable",
    precio: 25,
    imagen: "https://www.bioaquafloc.com/wp-content/uploads/2018/06/20140620100334.jpg",
  },
  {
    id: 2,
    nombre: "Trucha arcoíris",
    descripcion: "Ideal para parrillas",
    precio: 30,
    imagen: "https://www.bioaquafloc.com/wp-content/uploads/2018/06/20140620100334.jpg",
  },
];

const FavoritosScreen = () => {
  const [favoritos, setFavoritos] = useState(productosFavoritosSimulados);

  const quitarFavorito = (id) => {
    setFavoritos((prev) => prev.filter((p) => p.id !== id));
  };

  const agregarAlCarrito = (producto) => {
    Alert.alert("Añadido", `${producto.nombre} añadido al carrito`);
    // Aquí podrías navegar a CarritoScreen o guardar en AsyncStorage/global state
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>❤️ Productos Favoritos</Text>

      {favoritos.length === 0 ? (
        <Text style={styles.empty}>No tienes productos favoritos aún.</Text>
      ) : (
        favoritos.map((prod) => (
          <View key={prod.id} style={styles.card}>
            <Image source={{ uri: prod.imagen }} style={styles.imagen} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.nombre}>{prod.nombre}</Text>
              <Text style={styles.descripcion}>{prod.descripcion}</Text>
              <Text style={styles.precio}>💲 {prod.precio} Bs</Text>

              <View style={styles.botonesRow}>
                <TouchableOpacity
                  onPress={() => quitarFavorito(prod.id)}
                  style={styles.botonEliminar}
                >
                  <Text style={styles.botonTexto}>Quitar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => agregarAlCarrito(prod)}
                  style={styles.botonAgregar}
                >
                  <Text style={styles.botonTexto}>Añadir al carrito</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  descripcion: {
    fontSize: 14,
    color: "#cbd5e1",
    marginVertical: 4,
  },
  precio: {
    color: "#38bdf8",
    fontSize: 16,
    marginBottom: 8,
  },
  botonesRow: {
    flexDirection: "row",
    gap: 10,
  },
  botonEliminar: {
    backgroundColor: "#ef4444",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  botonAgregar: {
    backgroundColor: "#38bdf8",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  botonTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
});

export default FavoritosScreen;
