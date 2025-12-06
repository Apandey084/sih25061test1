// import { defineConfig, globalIgnores } from "eslint/config";
// import nextVitals from "eslint-config-next/core-web-vitals";

// const eslintConfig = defineConfig([
//   ...nextVitals,
//   // Override default ignores of eslint-config-next.
//   globalIgnores([
//     // Default ignores of eslint-config-next:
//     ".next/**",
//     "out/**",
//     "build/**",
//     "next-env.d.ts",
//   ]),
// ]);

// export default eslintConfig;
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,

  // ⬇️ Add this block to disable the missing rule cleanly
  {
    rules: {
      "@typescript-eslint/no-var-requires": "off",
    },
  },

  // Overrides
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
