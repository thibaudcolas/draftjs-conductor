import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { defineConfig, lazyPlugins } from "vite-plus";
import react from "@vitejs/plugin-react-swc";

const require = createRequire(import.meta.url);
const version = process.env.DRAFTJS_VERSION || "0.11";
if (!["0.10", "0.11"].includes(version)) {
  throw new Error(`Unsupported DRAFTJS_VERSION: ${version}. Use 0.10 or 0.11.`);
}
const draftPackage = version === "0.10" ? "draft-js-10" : "draft-js";
const draftRoot = dirname(require.resolve(`${draftPackage}/package.json`));

export default defineConfig({
  staged: {
    "*.{js,mjs,ts,mts,tsx}": [
      "vp check --fix",
      "vp lint --deny-warnings --no-error-on-unmatched-pattern",
    ],
    "*.{md,css,scss,json,json5,yaml,yml,html}": "vp fmt",
    // Oxfmt and Oxlint ignore these Flow definitions.
    "docs/flow-typed/**/*.js": "prettier --write --parser flow",
    // Return a command so staged filenames are not passed as test filters.
    "{*.{js,mjs,ts,mts,tsx,snap},package.json,package-lock.json,.node-version}":
      () => "npm run test:versions -s",
  },
  pack: {
    entry: { "draftjs-conductor": "src/lib/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    // The demo build writes to dist first; keep its assets when packaging.
    clean: false,
    platform: "neutral",
    target: "es2020",
    outExtensions: ({ format }) => ({
      js: format === "cjs" ? ".cjs.js" : ".esm.js",
      dts: ".d.ts",
    }),
    deps: { neverBundle: [/^draft-js(?:\/|$)/] },
  },
  lint: {
    plugins: ["oxc", "typescript", "unicorn"],
    categories: {
      correctness: "warn",
    },
    env: {
      builtin: true,
      node: true,
      browser: true,
    },
    ignorePatterns: [
      "node_modules",
      "coverage",
      "docs",
      "dist",
      "**/*.min.js",
      "**/*.bundle.js",
    ],
    rules: {
      "constructor-super": "error",
      "for-direction": "error",
      "getter-return": "error",
      "no-async-promise-executor": "error",
      "no-case-declarations": "error",
      "no-class-assign": "error",
      "no-compare-neg-zero": "error",
      "no-cond-assign": "error",
      "no-const-assign": "error",
      "no-constant-binary-expression": "error",
      "no-constant-condition": "error",
      "no-control-regex": "error",
      "no-debugger": "error",
      "no-delete-var": "error",
      "no-dupe-class-members": "error",
      "no-dupe-else-if": "error",
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-empty": "error",
      "no-empty-character-class": "error",
      "no-empty-pattern": "error",
      "no-empty-static-block": "error",
      "no-ex-assign": "error",
      "no-extra-boolean-cast": "error",
      "no-fallthrough": "error",
      "no-func-assign": "error",
      "no-global-assign": "error",
      "no-import-assign": "error",
      "no-invalid-regexp": "error",
      "no-irregular-whitespace": "error",
      "no-loss-of-precision": "error",
      "no-misleading-character-class": "error",
      "no-new-native-nonconstructor": "error",
      "no-nonoctal-decimal-escape": "error",
      "no-obj-calls": "error",
      "no-prototype-builtins": "error",
      "no-redeclare": "error",
      "no-regex-spaces": "error",
      "no-self-assign": "error",
      "no-setter-return": "error",
      "no-shadow-restricted-names": "error",
      "no-sparse-arrays": "error",
      "no-this-before-super": "error",
      "no-undef": "error",
      "no-unexpected-multiline": "error",
      "no-unreachable": "error",
      "no-unsafe-finally": "error",
      "no-unsafe-negation": "error",
      "no-unsafe-optional-chaining": "error",
      "no-unused-labels": "error",
      "no-unused-private-class-members": "error",
      "no-unused-vars": "error",
      "no-useless-backreference": "error",
      "no-useless-catch": "error",
      "no-useless-escape": "error",
      "no-with": "error",
      "require-yield": "error",
      "use-isnan": "error",
      "valid-typeof": "error",
      "no-array-constructor": "error",
      "no-unused-expressions": "error",
      "typescript/ban-ts-comment": "error",
      "typescript/no-duplicate-enum-values": "error",
      "typescript/no-empty-object-type": "error",
      "typescript/no-explicit-any": "error",
      "typescript/no-extra-non-null-assertion": "error",
      "typescript/no-misused-new": "error",
      "typescript/no-namespace": "error",
      "typescript/no-non-null-asserted-optional-chain": "error",
      "typescript/no-require-imports": "error",
      "typescript/no-this-alias": "error",
      "typescript/no-unnecessary-type-constraint": "error",
      "typescript/no-unsafe-declaration-merging": "error",
      "typescript/no-unsafe-function-type": "error",
      "typescript/no-wrapper-object-types": "error",
      "typescript/prefer-as-const": "error",
      "typescript/prefer-namespace-keyword": "error",
      "typescript/triple-slash-reference": "error",
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    overrides: [
      {
        files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
        rules: {
          "constructor-super": "off",
          "getter-return": "off",
          "no-class-assign": "off",
          "no-const-assign": "off",
          "no-dupe-class-members": "off",
          "no-dupe-keys": "off",
          "no-func-assign": "off",
          "no-import-assign": "off",
          "no-new-native-nonconstructor": "off",
          "no-obj-calls": "off",
          "no-redeclare": "off",
          "no-setter-return": "off",
          "no-this-before-super": "off",
          "no-undef": "off",
          "no-unreachable": "off",
          "no-unsafe-negation": "off",
          "no-var": "error",
          "no-with": "off",
          "prefer-const": "error",
          "prefer-rest-params": "error",
          "prefer-spread": "error",
        },
      },
      {
        files: ["*.config.js"],
        rules: {
          "typescript/no-require-imports": "off",
        },
      },
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
  },
  fmt: {
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: false,
    trailingComma: "all",
    bracketSpacing: true,
    arrowParens: "always",
    proseWrap: "preserve",
    sortPackageJson: false,
    ignorePatterns: [
      "docs/flow-typed/**",
      "node_modules",
      "*.min.js",
      "coverage/",
      "dist/",
      "*.bundle.js",
      "public/source-map-explorer.html",
      "build/",
    ],
  },
  plugins: lazyPlugins(() => [
    react(),
    {
      name: "production-error-reporting",
      transformIndexHtml: {
        order: "post",
        handler(html, ctx) {
          return ctx.bundle
            ? html.replace(
                "</head>",
                `<script src="https://cdn.ravenjs.com/3.21.0/raven.min.js" crossorigin="anonymous"></script><script>Raven.config('https://503a58b2e7e74093aee94bee33c9f974@sentry.io/293460').install()</script></head>`,
              )
            : html;
        },
      },
    },
  ]),
  base: "/draftjs-conductor/",
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.js"],
    // Resolve both the public API and internal imports to the selected version.
    alias: [
      { find: /^draft-js$/, replacement: join(draftRoot, "lib/Draft.js") },
      { find: /^draft-js\/(.*)$/, replacement: `${draftRoot}/$1` },
    ],
    coverage: {
      provider: "v8",
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
      include: ["src/lib/**/*.ts"],
      exclude: ["**/*.test.ts"],
      reporter: ["text", "html", "lcov"],
      reportsDirectory: `coverage/${version}`,
    },
  },
});
