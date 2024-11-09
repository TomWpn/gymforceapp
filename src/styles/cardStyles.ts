// src/styles/cardStyles.ts
import { StyleSheet } from "react-native";

export const cardStyles = StyleSheet.create({
  card: {
    padding: 20,
    marginVertical: 10,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    margin: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
});
