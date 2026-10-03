# Contribution Guidelines

Thank you for considering to help this project.

We welcome all support, whether on bug reports, feature requests, code, design, reviews, tests, documentation, and more.

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## Development

### Install

> Clone the project on your computer. You will also need [Node](https://nodejs.org) and [nvm](https://github.com/creationix/nvm).

```sh
nvm install "$(cat .node-version)"
# Then, install all project dependencies.
npm install
```

### Working on the project

> Everything mentioned in the installation process should already be done.

```sh
# Make sure you use the right node version.
nvm use "$(cat .node-version)"
# Start the server and the development tools.
npm run start
# Runs linting.
npm run lint
# Re-format the project (Oxfmt, with Prettier for Flow definitions).
npm run format
# Run tests in a watcher.
npm run test:watch
# Open the coverage report with:
npm run report:coverage
# Test both supported Draft.js versions (also run by CI and Git hooks).
npm run test:versions
# Run one version explicitly.
DRAFTJS_VERSION=0.10 npm test
DRAFTJS_VERSION=0.11 npm test
# Build the demo and library.
npm run build
# Preview the production demo.
npm run preview
# View other available commands with:
npm run
```

The Vite Plus demo is served at `/draftjs-conductor/`. Production files and library bundles are written to `dist/`. Tests use Vitest via Vite Plus and React Testing Library. `DRAFTJS_VERSION` selects Draft.js 0.10.5 or 0.11.7, including internal module imports. Coverage reports are kept separately in `coverage/0.10/` and `coverage/0.11/`. `npm run test:ci` runs linting, builds, and both test suites.

### Code style

This project uses [Vite Plus](https://viteplus.dev/) for builds, tests, formatting, linting, and type checks. Configuration lives in `vite.config.mts`. `npm run lint` runs `vp check`, enforces zero lint warnings, and checks the Flow definitions with [Prettier](https://prettier.io/), which is also retained for the CSS snapshot test and release formatting.

`npm run build` checks types, builds the demo with `vp build`, and produces CJS, ESM, and declaration bundles with `vp pack`. Both builds share `dist/`, so packaging preserves the demo files. No global Vite Plus installation is needed; npm scripts use the pinned local toolchain.

Keep `vite-plus`, its `vite` alias, and the bundled `vitest` and coverage-provider versions aligned when upgrading. After dependency changes, run `npm run test:ci` to validate both supported Draft.js versions.
