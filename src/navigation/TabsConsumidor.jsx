import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import DashboardScreen from "../screens/consumidor/DashboardScreen";
import TiendaScreen from "../screens/consumidor/TiendaScreen";
import CarritoScreen from "../screens/consumidor/CarritoScreen";
import PerfilScreen from "../screens/consumidor/PerfilScreen";
import MisPedidosScreen from "../screens/consumidor/MisPedidosScreen";
import FavoritosScreen from "../screens/consumidor/FavoritosScreen";
import NotificacionesScreen from "../screens/consumidor/NotificacionesScreen";
import AyudaScreen from "../screens/consumidor/AyudaScreen";
import { ScrollView, TouchableOpacity, Text } from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Pantalla "Más"
const MasStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MasOpciones" component={MasScreen} />
    <Stack.Screen name="MisPedidos" component={MisPedidosScreen} />
    <Stack.Screen name="Favoritos" component={FavoritosScreen} />
    <Stack.Screen name="Notificaciones" component={NotificacionesScreen} />
    <Stack.Screen name="Ayuda" component={AyudaScreen} />
  </Stack.Navigator>
);

const MasScreen = ({ navigation }) => (
  <ScrollView style={{ backgroundColor: "#0f172a", padding: 20, flex: 1 }}>
    <Text style={{ color: "#38bdf8", fontSize: 20, marginBottom: 20 }}>Más opciones</Text>
    {[
      { nombre: "MisPedidos", icon: "clipboard" },
      { nombre: "Favoritos", icon: "heart" },
      { nombre: "Notificaciones", icon: "notifications" },
      { nombre: "Ayuda", icon: "help-circle" },
    ].map((item) => (
      <TouchableOpacity
        key={item.nombre}
        style={{
          backgroundColor: "#1e293b",
          padding: 16,
          borderRadius: 10,
          marginBottom: 12,
          flexDirection: "row",
          alignItems: "center",
        }}
        onPress={() => navigation.navigate(item.nombre)}
      >
        <Ionicons name={item.icon} size={20} color="#38bdf8" style={{ marginRight: 12 }} />
        <Text style={{ color: "#fff", fontSize: 16 }}>{item.nombre}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const TabsConsumidor = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: "#0f172a" },
      tabBarActiveTintColor: "#38bdf8",
      tabBarInactiveTintColor: "#94a3b8",
      tabBarIcon: ({ color, size }) => {
        const icons = {
          Inicio: "home",
          Tienda: "storefront",
          Carrito: "cart",
          Mas: "ellipsis-horizontal",
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Inicio" component={DashboardScreen} />
    <Tab.Screen name="Tienda" component={TiendaScreen} />
    <Tab.Screen name="Carrito" component={CarritoScreen} />
    <Tab.Screen name="Mas" component={MasStack} />
  </Tab.Navigator>
);

export default TabsConsumidor;
