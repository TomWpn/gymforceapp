// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/context/AuthContext";
import AppContent from "./src/navigation/AppContent";
import "react-native-get-random-values";
import "react-native-gesture-handler";
import { UserProfileProvider } from "./src/context/UserProfileContext";
import { CheckInProvider } from "./src/context/CheckInContext";
import { ContestProvider } from "./src/context/ContestContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

const App = () => (
  <SafeAreaProvider>
    <AuthProvider>
      <UserProfileProvider>
        <CheckInProvider>
          <ContestProvider>
            <NavigationContainer>
              <AppContent />
            </NavigationContainer>
          </ContestProvider>
        </CheckInProvider>
      </UserProfileProvider>
    </AuthProvider>
  </SafeAreaProvider>
);

export default App;
