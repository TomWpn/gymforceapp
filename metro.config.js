const { getDefaultConfig } = require("expo/metro-config");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

// Extend the default Expo Metro configuration
const defaultConfig = getDefaultConfig(__dirname);

// Ensure custom asset types (e.g., .ttf) are supported
defaultConfig.resolver.assetExts.push("ttf");

// https://docs.expo.dev/guides/using-firebase/
defaultConfig.resolver.sourceExts.push("cjs");

// Wrap with Reanimated Metro Config
const customConfig = wrapWithReanimatedMetroConfig(defaultConfig);

module.exports = customConfig;
