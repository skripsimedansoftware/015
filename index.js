import React from "react";
import { registerRootComponent } from "expo";
import { Platform } from "react-native";
import { createRoot } from "react-dom/client";
import { SafeAreaView } from "react-native-safe-area-context";
import App from "./App";

function MobileApp() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <App />
    </SafeAreaView>
  );
}

if (Platform.OS === "web") {
  const root = createRoot(
    document.getElementById("root") ?? document.getElementById("main")
  );
  root.render(<App />);
} else {
  registerRootComponent(MobileApp);
}
