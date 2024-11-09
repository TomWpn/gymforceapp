// src/components/Accordion.tsx
import React, { useState } from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import NoMarginView from "./NoMarginView";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <NoMarginView style={styles.container}>
      <TouchableOpacity onPress={toggleExpanded} style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.toggleIcon}>{isExpanded ? "-" : "+"}</Text>
      </TouchableOpacity>
      {isExpanded && (
        <NoMarginView style={styles.content}>{children}</NoMarginView>
      )}
    </NoMarginView>
  );
};

export default Accordion;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  toggleIcon: {
    fontSize: 18,
    color: "#333",
  },
  content: {
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
});
