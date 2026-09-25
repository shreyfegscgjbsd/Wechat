import next from "eslint-config-next";

export default [
  ...next,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];