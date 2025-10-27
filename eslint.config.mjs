// Minimal flat ESLint config to avoid FlatCompat circular-structure issues
// This intentionally does not extend the Next.js shared config to ensure
// ESLint can load on environments where the @eslint/eslintrc compat layer
// produces a circular reference. We can re-enable the Next.js config later
// if desired.

export default [
  {
    // Keep the same ignore list as before so generated files are skipped.
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "generated/**",
      "prisma/**",
      "public/**",
    ],
  },
];
