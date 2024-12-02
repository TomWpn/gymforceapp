const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts.push("ttf"); // Ensure .ttf is supported

module.exports = defaultConfig;
