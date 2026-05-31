import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import {
  defaultBiometricReentrySettings,
  shouldPromptBiometricReentry,
} from "./src/auth/biometric-reentry";

export default function App() {
  const [restoringSession, setRestoringSession] = useState(true);
  const [biometricSettings, setBiometricSettings] = useState(
    defaultBiometricReentrySettings,
  );
  const boundary = shouldPromptBiometricReentry(
    biometricSettings,
    restoringSession,
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chordially Mobile</Text>
      <Text style={styles.subtitle}>
        Drop a chord and support artists in real time.
      </Text>
      <Text style={styles.subtitle}>
        Biometric available: {String(biometricSettings.available)} · opted-in:{" "}
        {String(biometricSettings.optedIn)}
      </Text>
      <Text style={styles.subtitle}>
        Re-entry boundary active: {String(boundary)}
      </Text>
      <Pressable
        style={styles.button}
        onPress={() =>
          setBiometricSettings((s) => ({ ...s, available: !s.available }))
        }
      >
        <Text style={styles.buttonText}>Toggle Availability</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() =>
          setBiometricSettings((s) => ({ ...s, optedIn: !s.optedIn }))
        }
      >
        <Text style={styles.buttonText}>Toggle Opt-in</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => setRestoringSession((v) => !v)}
      >
        <Text style={styles.buttonText}>Toggle Restoring Session</Text>
      </Pressable>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0b0f",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  title: {
    color: "#f4f0ff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12
  },
  subtitle: {
    color: "#c7c1d9",
    fontSize: 16,
    textAlign: "center"
  },
  button: {
    backgroundColor: "#7c3aed",
    borderRadius: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  }
});
