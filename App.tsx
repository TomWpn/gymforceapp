// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/context/AuthContext";
import AppContent from "./src/navigation/AppContent";
import "react-native-get-random-values";

const App = () => (
  <AuthProvider>
    <NavigationContainer>
      <AppContent />
    </NavigationContainer>
  </AuthProvider>
);

export default App;
