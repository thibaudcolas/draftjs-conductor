import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

const require = createRequire(import.meta.url);
const version = process.env.DRAFTJS_VERSION || "0.11";
if (!["0.10", "0.11"].includes(version)) {
  throw new Error(`Unsupported DRAFTJS_VERSION: ${version}. Use 0.10 or 0.11.`);
}
const draftPackage = version === "0.10" ? "draft-js-10" : "draft-js";
const draftRoot = dirname(require.resolve(`${draftPackage}/package.json`));

export default defineConfig({
  plugins: [
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
  ],
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
