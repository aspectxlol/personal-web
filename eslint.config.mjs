import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import next from "@next/eslint-plugin-next";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  {
    ignores: ["node_modules", ".next", "dist", "build"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": ts,
      react,
      "react-hooks": reactHooks,
      import: importPlugin,
      next,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
      "no-console": ["error", { allow: ["warn", "error", "info"] }],
      "eqeqeq": "warn",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "import/no-extraneous-dependencies": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "next/no-html-link-for-pages": "error",
      "next/no-img-element": "error",
      "next/next/no-before-interactive-script-outside-document": "off",
    },
  },
];
