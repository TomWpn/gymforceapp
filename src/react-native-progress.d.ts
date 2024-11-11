declare module "react-native-progress/Bar" {
  import { Component } from "react";
  import { ViewStyle } from "react-native";

  export interface ProgressBarProps {
    progress?: number;
    indeterminate?: boolean;
    width?: number | null;
    height?: number;
    color?: string;
    unfilledColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    style?: ViewStyle;
  }

  export default class ProgressBar extends Component<ProgressBarProps> {}
}
