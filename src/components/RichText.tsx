import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import RenderHTML from "react-native-render-html";

const RichTextComponent = ({ htmlContent }: { htmlContent: string }) => {
  const { width } = useWindowDimensions();

  return (
    <ScrollView style={{ paddingHorizontal: 20 }}>
      <RenderHTML
        contentWidth={width}
        source={{ html: htmlContent }}
        tagsStyles={{
          p: {
            color: "#000",
            fontSize: 16,
            lineHeight: 24,
            fontFamily: "OpenSansGymforce",
          },
          h1: {
            fontSize: 24,
            fontWeight: "bold",
            color: "#000",
            fontFamily: "Gymforce",
          },
          h2: {
            fontSize: 20,
            fontWeight: "600",
            color: "#000",
            fontFamily: "Gymforce",
          },
          // Add styles for any other tags as needed
        }}
        systemFonts={["Gymforce", "OpenSansGymforce"]}
      />
    </ScrollView>
  );
};

export default RichTextComponent;
