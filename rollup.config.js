import pkg from "./package.json";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

const config = [
  {
    input: "./src/lib/index.ts",
    external: [
      "draft-js/lib/getDraftEditorSelection",
      "draft-js/lib/getContentStateFragment",
      "draft-js/lib/editOnCopy",
      "draft-js/lib/editOnCut",
    ].concat(Object.keys(pkg.peerDependencies)),
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" },
    ],
    plugins: [typescript()],
  },
  {
    input: "./src/lib/index.ts",
    output: [{ file: pkg.types, format: "es" }],
    plugins: [dts()],
  },
];

export default config;
