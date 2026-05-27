import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { mobileConfig } from "./src/config";

const tracks = [
  "Authentication contracts and screens",
  "Shared session state",
  "Stellar wallet connection flows",
  "Hackathon demo polish"
];

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>Chordially Mobile Starter</Text>
        <Text style={styles.title}>Ship the MVP step by step.</Text>
        <Text style={styles.body}>
          The mobile workspace now starts from a clean Expo shell aimed at the same
          authentication-first roadmap as the API and web app.
        </Text>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Local services</Text>
          <Text style={styles.panelBody}>API: {mobileConfig.apiBaseUrl}</Text>
          <Text style={styles.panelBody}>Stellar: {mobileConfig.stellarServiceUrl}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Upcoming tracks</Text>
          {tracks.map((track) => (
            <Text key={track} style={styles.panelBody}>
              - {track}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f0e8"
  },
  container: {
    padding: 24,
    gap: 18
  },
  eyebrow: {
    color: "#9a3f19",
    textTransform: "uppercase",
    letterSpacing: 1.5
  },
  title: {
    fontSize: 36,
    lineHeight: 38,
    fontWeight: "700",
    color: "#1f1a17"
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: "#5e5248"
  },
  panel: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 20,
    padding: 20,
    gap: 8
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f1a17"
  },
  panelBody: {
    fontSize: 15,
    lineHeight: 22,
    color: "#5e5248"
  }
});
