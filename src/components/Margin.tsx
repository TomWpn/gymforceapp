import { View } from "react-native";

import NoMarginView from "./NoMarginView";
interface MarginProps {
  size?: number;
  children: React.ReactNode;
}

const Margin: React.FC<MarginProps> = ({ size = 16, children }) => (
  <NoMarginView style={{ margin: size }}>{children}</NoMarginView>
);

export default Margin;
