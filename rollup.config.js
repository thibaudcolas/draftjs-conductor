import babel from "rollup-plugin-babel";
import pkg from "./package.json";

// const BANNER = `// @flow`;
const BANNER = ``;

export default [
  {
    input: "src/lib/index.js",
    external: ["draft-js/lib/getFragmentFromSelection"]
      .concat(Object.keys(pkg.dependencies))
      .concat(Object.keys(pkg.peerDependencies)),
    output: [
      { file: pkg.main, format: "cjs", banner: BANNER },
      { file: pkg.module, format: "es", banner: BANNER },
    ],
    plugins: [
      babel({
        babelrc: false,
        exclude: ["node_modules/**"],
        presets: [
          [
            "env",
            {
              modules: false,
            },
          ],
          "react",
        ],
        plugins: ["transform-flow-comments"],
      }),
    ],
  },
];
