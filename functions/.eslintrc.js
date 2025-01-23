module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    commonjs: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "**/lib/**", // Ignore built files.
  ],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    "max-len": 0,
    quotes: 0,
    "import/no-unresolved": 0,
    indent: ["error", 2],
    "quote-props": 0, // Ensures consistent quoting of properties
    "object-curly-spacing": 0, // No spaces inside braces
    "@typescript-eslint/no-unused-expressions": [
      "error",
      {
        allowShortCircuit: true,
        allowTernary: true,
      },
    ],
  },
};
