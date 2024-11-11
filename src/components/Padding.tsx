import React from "react";
import NoMarginView from "./NoMarginView";

interface PaddingProps {
  size?: number;
  horizontal?: boolean;
  vertical?: boolean;
  children: React.ReactNode;
}

const Padding: React.FC<PaddingProps> = ({
  size = 16,
  horizontal,
  vertical,
  children,
}) => {
  const style = horizontal
    ? { paddingHorizontal: size }
    : vertical
    ? { paddingVertical: size }
    : { padding: size };

  return <NoMarginView style={style}>{children}</NoMarginView>;
};

export default Padding;
