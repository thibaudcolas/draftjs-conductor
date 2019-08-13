import babel from "rollup-plugin-babel";
import pkg from "./package.json";

const BANNER = `// @flow`;

export default [
  {
    input: "src/lib/index.js",
    external: [
      "draft-js/lib/getDraftEditorSelection",
      "draft-js/lib/getContentStateFragment",
    ]
      .concat(Object.keys(pkg.dependencies))
      .concat(Object.keys(pkg.peerDependencies)),
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
