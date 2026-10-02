import { plugin as shadcn } from "@shadcn/lint";
import tsParser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";

const observationRules = Object.fromEntries([
  "no-restyle",
  "no-raw-colors",
  "no-arbitrary-values",
  "no-inline-styles",
  "no-unknown-classes",
  "require-static-classes",
].map((rule) => [`shadcn/${rule}`, "warn"]));

export default defineConfig([
  { ignores: [".next/**", "node_modules/**", ".codex_tmp/**"] },
  {
    files: ["app/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { shadcn },
    settings: {
      shadcn: {
        ui: "@/app/components/algocore-ui",
        componentImports: ["^@/app/components/algocore-ui(?:/|$)"],
        note: "AlgoCore DS2 is frozen. Use semantic variants and record any exception with an owner and expiry batch.",
      },
    },
    rules: observationRules,
  },
]);
