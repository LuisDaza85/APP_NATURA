import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthContext } from "./context/AuthContext";

// Pantallas de autenticación
import LoginScreen from "./screens/auth/LoginScreen";
import RegisterScreen from "./screens/auth/RegisterScreen";

// Navegación y Layouts
import TabsProductor from "./navigation/TabsProductor";
import TabsConsumidor from "./navigation/TabsConsumidor";
import ProductorLayout from "./navigation/ProductorLayout";
import ConsumidorLayout from "./navigation/ConsumidorLayout";

// Pantallas adicionales
import PerfilScreen from "./screens/productor/PerfilScreen";
import CarritoScreen from "./screens/productor/CarritoScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        <Stack.Screen
          name="TabsProductor"
          children={() => (
            <ProductorLayout>
              <TabsProductor />
            </ProductorLayout>
          )}
        />

        <Stack.Screen
          name="TabsConsumidor"
          children={() => (
            <ConsumidorLayout>
              <TabsConsumidor />
            </ConsumidorLayout>
          )}
        />

        <Stack.Screen name="Perfil" component={PerfilScreen} />
        <Stack.Screen name="Carrito" component={CarritoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
