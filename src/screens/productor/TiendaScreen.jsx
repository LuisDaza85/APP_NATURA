import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const TiendaScreen = () => {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [detalleVisible, setDetalleVisible] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [productos, setProductos] = useState([
    {
      id: 1,
      nombre: "Tilapia",
      descripcion: "Fresca y saludable",
      precio: 15,
      calidad: "Premium",
      origen: "Piscina A",
      imagen: "https://i.blogs.es/1bc9aa/tilapia-5108235_1280/1366_2000.jpg",
      stock: 10,
    },
    {
      id: 2,
      nombre: "Trucha",
      descripcion: "Alta calidad del lago",
      precio: 25,
      calidad: "Orgánica",
      origen: "Lago Titicaca",
      imagen: "https://i.blogs.es/1bc9aa/tilapia-5108235_1280/1366_2000.jpg",
      stock: 8,
    },
  ]);

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: "",
    tamano: "",
    origen: "",
    imagen: "",
    stock: "",
  });

  const handleChange = (key, value) => {
    setNuevoProducto({ ...nuevoProducto, [key]: value });
  };

  const handleEditarProducto = (key, value) => {
    setProductoSeleccionado({ ...productoSeleccionado, [key]: value });
  };

  const handlePublicar = () => {
    const { nombre, precio, imagen, stock } = nuevoProducto;
    if (!nombre || !precio || !imagen || !stock) {
      alert("Por favor completa nombre, precio, imagen y stock.");
      return;
    }

    const producto = {
      ...nuevoProducto,
      id: Date.now(),
      descripcion: `${nuevoProducto.tamano} - ${nuevoProducto.origen}`,
      calidad: "Alta",
      precio: parseFloat(precio),
      stock: parseInt(stock),
    };

    setProductos([producto, ...productos]);
    setNuevoProducto({
      nombre: "",
      precio: "",
      tamano: "",
      origen: "",
      imagen: "",
      stock: "",
    });
    setMenuVisible(false);
  };

 const handleAgregarAlCarrito = (producto) => {
  const actualizado = productos.find((p) => p.id === producto.id);
  console.log("✅ Producto actualizado al carrito:", actualizado.nombre);
  navigation.navigate("Carrito", { producto: actualizado,desdeTienda: true,  });
};

  const handleVerDetalles = (producto) => {
    setProductoSeleccionado(producto);
    setDetalleVisible(true);
  };

  const guardarCambiosProducto = () => {
    setProductos((prev) =>
      prev.map((p) => (p.id === productoSeleccionado.id ? productoSeleccionado : p))
    );
    setDetalleVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Tienda del Productor</Text>

        {productos.map((producto) => (
          <View key={producto.id} style={styles.card}>
            <Image source={{ uri: producto.imagen }} style={styles.image} />
            <View style={styles.cardInfo}>
              <Text style={styles.productName}>{producto.nombre}</Text>
              <Text style={styles.description}>{producto.descripcion}</Text>
              <Text style={styles.price}>💲 {producto.precio} Bs</Text>
              <Text style={styles.stock}>📦 Stock: {producto.stock}</Text>

              <View style={styles.tags}>
                <Text style={styles.tag}>⭐ {producto.calidad}</Text>
                <Text style={styles.tag}>📍 {producto.origen}</Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleAgregarAlCarrito(producto)}
                >
                  <Text style={styles.buttonText}>Añadir para la venta</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() => handleVerDetalles(producto)}
                >
                  <Text style={styles.detailText}>Ver Detalles</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal para publicar nuevo producto */}
      <Modal transparent={true} visible={menuVisible} animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.menu}>
            <Text style={styles.menuTitle}>📤 Publicar Nuevo Producto</Text>
            {["nombre", "precio", "tamano", "origen", "imagen", "stock"].map((key) => (
              <View key={key} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Ingrese ${key}`}
                  placeholderTextColor="#94a3b8"
                  value={nuevoProducto[key]}
                  onChangeText={(text) => handleChange(key, text)}
                  keyboardType={key === "precio" || key === "stock" ? "numeric" : "default"}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.publishButton} onPress={handlePublicar}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#0f172a" />
              <Text style={styles.publishButtonText}>Publicar producto</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setMenuVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para ver/editar producto */}
      <Modal transparent={true} visible={detalleVisible} animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.menu}>
            <Text style={styles.menuTitle}>🔍 Detalles y Edición</Text>
            {productoSeleccionado &&
              ["nombre", "precio", "descripcion", "origen", "imagen", "stock"].map((key) => (
                <View key={key} style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={String(productoSeleccionado[key])}
                    onChangeText={(text) => handleEditarProducto(key, text)}
                    keyboardType={key === "precio" || key === "stock" ? "numeric" : "default"}
                  />
                </View>
              ))}

            <TouchableOpacity style={styles.publishButton} onPress={guardarCambiosProducto}>
              <Ionicons name="save-outline" size={20} color="#0f172a" />
              <Text style={styles.publishButtonText}>Guardar Cambios</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setDetalleVisible(false)}>
              <Text style={styles.cancelButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.floatingButton} onPress={() => setMenuVisible(true)}>
        <Ionicons name="add-circle" size={58} color="#38bdf8" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  scrollContent: { padding: 20, paddingBottom: 100 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#38bdf8",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    borderColor: "#334155",
    borderWidth: 1,
  },
  image: { width: 120, height: 120 },
  cardInfo: { flex: 1, padding: 12, justifyContent: "space-between" },
  productName: { fontSize: 18, fontWeight: "bold", color: "#f8fafc" },
  description: { color: "#94a3b8" },
  price: { color: "#cbd5e1", fontWeight: "bold", marginTop: 6 },
  stock: { color: "#facc15", fontWeight: "bold" },
  tags: { flexDirection: "row", gap: 8, marginVertical: 8 },
  tag: {
    backgroundColor: "#334155",
    color: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  button: {
    backgroundColor: "#38bdf8",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buttonText: { color: "#0f172a", fontWeight: "bold", fontSize: 12 },
  detailButton: { paddingHorizontal: 10, paddingVertical: 6 },
  detailText: { color: "#94a3b8", fontSize: 12 },
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 30,
    zIndex: 999,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  menu: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#38bdf8",
    marginBottom: 16,
    textAlign: "center",
  },
  inputGroup: { marginBottom: 12 },
  inputLabel: { color: "#f1f5f9", marginBottom: 4 },
  input: {
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    padding: 10,
    borderRadius: 8,
    borderColor: "#334155",
    borderWidth: 1,
  },
  publishButton: {
    flexDirection: "row",
    backgroundColor: "#38bdf8",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  publishButtonText: {
    marginLeft: 8,
    color: "#0f172a",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#94a3b8",
    fontSize: 14,
  },
});

export default TiendaScreen;
