// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import AppContent from "./src/navigation/AppContent";

const App = () => (
  <AuthProvider>
    <NavigationContainer>
      <AppContent />
    </NavigationContainer>
  </AuthProvider>
);

export default App;
