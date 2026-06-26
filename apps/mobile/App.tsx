import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { mobileSyncPushSchema } from "@panol/shared";

export default function App() {
  const sample = mobileSyncPushSchema.safeParse({
    device_id: "demo-device",
    base_revision: 0,
    mutations: [
      {
        client_mutation_id: "mutation-1",
        entity: "transfer",
        operation: "insert",
        payload: {},
      },
    ],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.kicker}>PanolApp Mobile</Text>
          <Text style={styles.title}>Offline-first para terreno</Text>
          <Text style={styles.body}>
            Esta app guardara cambios localmente cuando no haya senal y los
            sincronizara despues con el backend.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Estado base</Text>
          <Text style={styles.body}>
            Contrato compartido cargado: {sample.success ? "si" : "no"}.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Siguiente paso</Text>
          <Text style={styles.body}>
            Conectar login, almacenamiento local y cola de sincronizacion.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4efe7",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    gap: 16,
  },
  card: {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    padding: 20,
    shadowColor: "#1f2937",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 3,
  },
  kicker: {
    color: "#7a5c2e",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    color: "#0f172a",
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38,
  },
  sectionTitle: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  body: {
    color: "#334155",
    fontSize: 16,
    lineHeight: 24,
  },
});
