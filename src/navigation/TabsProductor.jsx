import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import DashboardScreen from "../screens/productor/DashboardScreen";
import TiendaScreen from "../screens/productor/TiendaScreen";
import CarritoScreen from "../screens/productor/CarritoScreen";
import PerfilScreen from "../screens/productor/PerfilScreen";
import PedidosScreen from "../screens/productor/PedidosScreen";
import EstadisticasScreen from "../screens/productor/EstadisticasScreen";
import MonitoringScreen from "../screens/productor/MonitoringScreen";
import InventarioScreen from "../screens/productor/InventarioScreen";
import { ScrollView, TouchableOpacity, Text } from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 📦 Pantalla "Más"
const MasStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MásOpciones" component={MasScreen} />
    <Stack.Screen name="Pedidos" component={PedidosScreen} />
    <Stack.Screen name="Estadísticas" component={EstadisticasScreen} />
    <Stack.Screen name="Monitoreo" component={MonitoringScreen} />
    <Stack.Screen name="Inventario General" component={InventarioScreen} />
  </Stack.Navigator>
);

const MasScreen = ({ navigation }) => (
  <ScrollView style={{ backgroundColor: "#0f172a", padding: 20, flex: 1 }}>
    <Text style={{ color: "#38bdf8", fontSize: 20, marginBottom: 20 }}>Más opciones</Text>
    {[
      { nombre: "Pedidos", icon: "cube" },
      { nombre: "Estadísticas", icon: "bar-chart" },
      { nombre: "Monitoreo", icon: "analytics" },
      { nombre: "Inventario General", icon: "list" },
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

const TabsProductor = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: "#0f172a" },
      tabBarActiveTintColor: "#38bdf8",
      tabBarInactiveTintColor: "#94a3b8",
      tabBarIcon: ({ color, size }) => {
        const icons = {
          Inicio: "home",
          Inventario: "archive-outline",
          Carrito: "cart",
          Más: "ellipsis-horizontal",
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Inicio" component={DashboardScreen} />
    <Tab.Screen name="Inventario" component={TiendaScreen} />
    <Tab.Screen name="Carrito" component={CarritoScreen} />
    <Tab.Screen name="Más" component={MasStack} />
  </Tab.Navigator>
);

export default TabsProductor;
