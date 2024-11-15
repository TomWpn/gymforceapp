import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  TextStyle,
} from "react-native";
import GymForceText from "./GymForceText"; // Adjust the import path as needed
import RichText from "./RichText"; // Renamed RichText component

interface ExpandableTextProps {
  content?: string; // Plain text content
  htmlContent?: string; // HTML content as a string
  style?: StyleProp<TextStyle>; // Customizable style for plain text
}

const charLimit = 225;

const ExpandableText: React.FC<ExpandableTextProps> = ({
  content,
  htmlContent,
  style,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine if "View More" should be shown based on content length
  const textLength = content ? content.length : 0;
  const shouldShowExpand =
    textLength > charLimit || (htmlContent && htmlContent.length > charLimit);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      {htmlContent ? (
        <View style={styles.contentContainer}>
          <RichText
            htmlContent={
              isExpanded ? htmlContent : `${htmlContent.slice(0, charLimit)}...`
            }
          />
        </View>
      ) : (
        <GymForceText style={[styles.content, style]}>
          {isExpanded || !shouldShowExpand
            ? content
            : `${content?.substring(0, charLimit)}...`}
        </GymForceText>
      )}

      {shouldShowExpand && (
        <TouchableOpacity onPress={toggleExpand}>
          <GymForceText style={styles.link}>
            {isExpanded ? "View Less" : "View More"}
          </GymForceText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },
  contentContainer: {
    // Style for the container wrapping RichText (no TextStyle properties here)
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  link: {
    color: "#007bff",
    marginTop: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ExpandableText;
