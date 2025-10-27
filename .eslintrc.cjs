module.exports = {
  root: true,
  // Use TypeScript parser explicitly to ensure TS/TSX parsing works even if
  // shared configs don't configure it in this environment.
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
    ecmaVersion: 2024,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "next/core-web-vitals",
    // Keep next/typescript so Next's recommended rules are applied
    "next/typescript"
  ],
  ignorePatterns: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "generated/**",
    "prisma/**",
    "public/**"
  ],
};
