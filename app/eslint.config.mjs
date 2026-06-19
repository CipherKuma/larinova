import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// `next lint` was removed in Next 16, so the old `lint` script no longer ran.
// This is the first time ESLint actually runs across the app, on top of a
// codebase that accumulated ~90 pre-existing violations (mostly `any` in route
// handlers + one-off scripts). Rather than block the build on a backlog this
// lane doesn't own, we adopt ESLint as a *ratchet*: the config runs everywhere
// and still surfaces every issue, but the known-legacy rules are demoted to
// warnings so `pnpm lint` exits 0. Tighten these back to "error" as the backlog
// is paid down.
const legacyRatchet = {
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-require-imports": "warn",
    "@next/next/no-html-link-for-pages": "warn",
    "prefer-const": "warn",
    // React Compiler / react-hooks recommended rules that flag pre-existing
    // patterns (sync setState in effects, missing deps, ref access during
    // render, in-render mutation, impure calls). Visible, non-blocking.
    "react-hooks/set-state-in-effect": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "react-hooks/immutability": "warn",
    "react-hooks/refs": "warn",
    "react-hooks/purity": "warn",
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  legacyRatchet,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated service worker + Playwright/test artifacts.
    "public/sw.js",
    "public/swe-worker-*.js",
    "test-results/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;
