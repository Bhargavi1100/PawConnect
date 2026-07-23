import { StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🐾</Text>
      <Text style={styles.title}>Your PawConnect account</Text>
      <Text style={styles.body}>
        Sign in, saved places, and pet profiles are coming soon. The API already
        supports email/password accounts — see docs/ROADMAP.md Phase 2.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emoji: { fontSize: 48 },
  title: { marginTop: 12, fontSize: 20, fontWeight: "700" },
  body: { marginTop: 8, textAlign: "center", color: "#555", lineHeight: 20 },
});
