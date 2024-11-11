// src/hooks/useDynamicIcon.ts
import { useEffect, useState } from "react";

type IconLibrary =
  | "AntDesign"
  | "Entypo"
  | "EvilIcons"
  | "Feather"
  | "FontAwesome"
  | "FontAwesome5"
  | "FontAwesome6"
  | "Fontisto"
  | "Foundation"
  | "Ionicons"
  | "MaterialIcons"
  | "MaterialCommunityIcons"
  | "Octicons"
  | "Zocial"
  | "SimpleLineIcons";

export const useDynamicIcon = (iconLibrary: IconLibrary) => {
  const [IconComponent, setIconComponent] =
    useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    const loadIconComponent = async () => {
      const iconLibraries = {
        AntDesign: () => import("react-native-vector-icons/AntDesign"),
        Entypo: () => import("react-native-vector-icons/Entypo"),
        EvilIcons: () => import("react-native-vector-icons/EvilIcons"),
        Feather: () => import("react-native-vector-icons/Feather"),
        FontAwesome: () => import("react-native-vector-icons/FontAwesome"),
        FontAwesome5: () => import("react-native-vector-icons/FontAwesome5"),
        FontAwesome6: () => import("react-native-vector-icons/FontAwesome6"),
        Fontisto: () => import("react-native-vector-icons/Fontisto"),
        Foundation: () => import("react-native-vector-icons/Foundation"),
        Ionicons: () => import("react-native-vector-icons/Ionicons"),
        MaterialIcons: () => import("react-native-vector-icons/MaterialIcons"),
        MaterialCommunityIcons: () =>
          import("react-native-vector-icons/MaterialCommunityIcons"),
        Octicons: () => import("react-native-vector-icons/Octicons"),
        Zocial: () => import("react-native-vector-icons/Zocial"),
        SimpleLineIcons: () =>
          import("react-native-vector-icons/SimpleLineIcons"),
      };

      const iconImport = iconLibraries[iconLibrary];
      if (iconImport) {
        const importedLibrary = await iconImport();
        setIconComponent(() => importedLibrary.default);
      }
    };

    loadIconComponent();
  }, [iconLibrary]);

  return IconComponent;
};
