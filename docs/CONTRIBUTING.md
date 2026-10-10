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

### Git hooks

`npm install` installs the [Vite Plus Git hooks](https://viteplus.dev/guide/commit-hooks) with `vp config --no-agent`. The committed scripts live in `.vite-hooks/`; Vite Plus generates the ignored dispatcher in `.vite-hooks/_/`.

Before a commit, `vp staged` formats and checks staged files using the `staged` configuration in `vite.config.mts`. It preserves unstaged changes, including partially staged files. Flow definitions use Prettier. Code, snapshot, dependency, and Node version changes run the tests against both Draft.js versions. Tasks run sequentially so tests see the formatted files. The commit-message hook checks Conventional Commits with commitlint.

Run `npx vp hooks status` to inspect hook installation, `npx vp hooks disable` to disable hooks in your clone, or `npx vp hooks enable` to re-enable them. To skip hooks for one commit, use `VP_GIT_HOOKS=0 git commit`. No global Vite Plus installation is required.

## Releases

The `Publish` workflow in `.github/workflows/publish.yml` runs semantic-release after the `CI` workflow completes successfully for a push to `main` in this repository. It checks out the exact commit that passed CI. Pull request runs cannot publish. CI includes the Pages deployment, so a failed deployment also prevents publishing. It uses a fresh dependency install and build, full Git history, and npm Trusted Publishing (OIDC). No `NPM_TOKEN` or `NODE_AUTH_TOKEN` is needed. The Node version in `.node-version` and the npm CLI bundled with `@semantic-release/npm` meet the Trusted Publishing requirements (Node 22.14.0+ and npm 11.5.1+).

The publishing workflow must exist on the default branch to receive `workflow_run` events. Before merging changes to the publishing workflow, configure a GitHub Actions trusted publisher in the [draftjs-conductor package settings](https://www.npmjs.com/package/draftjs-conductor/access):

- Organization or user: `thibaudcolas`
- Repository: `draftjs-conductor`
- Workflow filename: `publish.yml` (without `.github/workflows/`)
- Environment name: leave blank; the release job does not use a GitHub environment.
- Allowed actions: enable direct publishing with `npm publish`.

The release job grants `id-token: write` for npm authentication and write access to repository contents, issues, and pull requests for GitHub releases and comments. Do not add `registry-url` to `actions/setup-node`; semantic-release manages npm authentication. Public npm releases automatically include provenance.

`release.config.js` preserves the changelog, release commit, npm tarball, GitHub release asset, and issue/PR comments. `VP_GIT_HOOKS=0` skips local hooks for the automated release commit. Repository rules must permit that commit using `GITHUB_TOKEN`; if branch protection blocks it, configure GitHub App authentication as described in the semantic-release guide.

After the first successful OIDC release, remove the unused `NPM_TOKEN` GitHub secret and revoke its npm token if nothing else uses it. npm also recommends selecting “Require two-factor authentication and disallow tokens” in the package publishing settings. A local semantic-release dry run cannot verify GitHub OIDC authentication; confirm the first release succeeds and includes provenance on npm.

See the [semantic-release GitHub Actions guide](https://semantic-release.org/recipes/ci-configurations/github-actions/) and [npm Trusted Publishing documentation](https://docs.npmjs.com/trusted-publishers/) for setup and troubleshooting.
