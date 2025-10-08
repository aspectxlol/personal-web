// eslint.config.js
import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
    ],
    rules: {
      // ✅ Basic quality
      eqeqeq: ["error", "always"],
      "no-var": "error",
      "prefer-const": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",

      // ✅ Readability
      curly: ["warn", "all"],
      "no-multi-spaces": "warn",
      "no-trailing-spaces": "warn",
      "prefer-template": "warn",
      "arrow-body-style": ["warn", "as-needed"],

      // ✅ Consistency
      "no-duplicate-imports": "error",
      "no-unneeded-ternary": "warn",
      "prefer-arrow-callback": "warn",
      "no-extra-semi": "warn",
      "no-multiple-empty-lines": ["warn", { max: 1 }],

      // ✅ Safety
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-unused-expressions": "error",
    },
  },
];
