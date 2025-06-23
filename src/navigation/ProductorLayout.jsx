import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const ProductorLayout = ({ children }) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Encabezado */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#94a3b8" style={styles.icon} />
            <TextInput
              placeholder="Buscar..."
              placeholderTextColor="#94a3b8"
              style={styles.input}
            />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
            <Ionicons name="person-circle-outline" size={32} color="#38bdf8" />
          </TouchableOpacity>
        </View>

        {/* Contenido principal */}
        <View style={styles.content}>{children}</View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderRadius: 10,
    alignItems: "center",
    marginRight: 12,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingVertical: 8,
  },
  content: {
    flex: 1,
  },
});

export default ProductorLayout;
