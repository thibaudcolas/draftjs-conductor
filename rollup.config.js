import babel from "rollup-plugin-babel";
import pkg from "./package.json";

const BANNER = `// @flow`;

const config = [
  {
    input: "src/lib/index.js",
    external: [
      "draft-js/lib/getDraftEditorSelection",
      "draft-js/lib/getContentStateFragment",
      "draft-js/lib/editOnCopy",
      "draft-js/lib/editOnCut",
    ].concat(Object.keys(pkg.peerDependencies)),
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es", banner: BANNER },
      // Compile a .flow version of the package used for typings only.
      { file: pkg.flow, format: "es", banner: BANNER },
    ],
    plugins: [
      babel({
        babelrc: false,
        exclude: ["node_modules/**"],
        presets: [
          [
            "@babel/env",
            {
              modules: false,
            },
          ],
          "@babel/react",
        ],
        plugins: ["@babel/transform-flow-comments"],
      }),
    ],
  },
];

export default config;
