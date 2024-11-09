import { View } from "react-native";
import NoMarginView from "./NoMarginView";

interface PaddingProps {
  size?: number;
  children: React.ReactNode;
}

const Padding: React.FC<PaddingProps> = ({ size = 16, children }) => (
  <NoMarginView style={{ padding: size }}>{children}</NoMarginView>
);

export default Padding;
