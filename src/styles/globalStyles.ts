// globalStyles.ts
import { StyleSheet, Platform } from "react-native";

const globalStyles = StyleSheet.create({
  noMargin: {
    margin: 0,
    marginTop: Platform.select({ ios: 0, android: 0, web: 0 }),
    marginBottom: Platform.select({ ios: 0, android: 0, web: 0 }),
    marginLeft: Platform.select({ ios: 0, android: 0, web: 0 }),
    marginRight: Platform.select({ ios: 0, android: 0, web: 0 }),
  },
  text: {
    fontFamily: "Gymforce", // Use your font name here
  },
});

export default globalStyles;
