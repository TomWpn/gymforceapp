import { StyleSheet } from "react-native";

const buttonStyles = StyleSheet.create({
  btn: {
    fontFamily: "Gymforce",
    paddingVertical: 12,
    paddingHorizontal: 20,
    color: "#ffffff",
    borderRadius: 4,
    fontSize: 14,
    textAlign: "center",
    maxWidth: 200,
  },
  btnPrimary: {
    backgroundColor: "#1a265a",
  },
  btnSecondary: {
    backgroundColor: "#f1600d",
  },
  btnTertiary: {
    backgroundColor: "transparent",
    color: "black",
    borderWidth: 1,
    borderColor: "black",
  },
  btnSmall: {
    paddingVertical: 10,
    fontSize: 14,
  },
  btnLarge: {
    paddingVertical: 14,
    fontSize: 24,
    lineHeight: 34,
  },
  btnFocus: {
    borderColor: "#1a265a",
    borderWidth: 2,
  },
  btnHover: {
    opacity: 0.8,
  },
});

export default buttonStyles;
