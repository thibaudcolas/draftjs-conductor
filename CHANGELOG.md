# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html), enforced with [semantic-release](https://github.com/semantic-release/semantic-release).

# [1.0.0](https://github.com/thibaudcolas/draftjs-conductor/compare/v0.5.2...v1.0.0) (2019-08-14)

> This release is functionally identical to `v0.5.2`.

The project has reached a high-enough level of stability to be used in production, and breaking changes will now be reflected via major version changes.

## [0.5.2](https://github.com/thibaudcolas/draftjs-conductor/compare/v0.5.1...v0.5.2) (2019-08-13)

### Bug Fixes

- **release:** prevent tarballs from being published in npm tarball ([96d0765](https://github.com/thibaudcolas/draftjs-conductor/commit/96d0765))

## [0.5.1](https://github.com/thibaudcolas/draftjs-conductor/compare/v0.5.0...v0.5.1) (2019-08-13)

### Bug Fixes

- **api:** add .flow typing file to restore type checks on CJS imports ([cb73a81](https://github.com/thibaudcolas/draftjs-conductor/commit/cb73a81))

# [0.5.0](https://github.com/thibaudcolas/draftjs-conductor/compare/v0.4.5...v0.5.0) (2019-08-13)

### Features

- **api:** add new data conversion helper methods ([355c88e](https://github.com/thibaudcolas/draftjs-conductor/commit/355c88e))

## [0.4.5](https://github.com/thibaudcolas/draftjs-conductor/compare/v0.4.4...v0.4.5) (2019-07-04)

### Bug Fixes

- **api:** disable Flow types in CommonJS build ([023f6b0](https://github.com/thibaudcolas/draftjs-conductor/commit/023f6b0))
- **package:** use ES6 import instead of require for draft-js/lib deps ([9bcea6b](https://github.com/thibaudcolas/draftjs-conductor/commit/9bcea6b))

## [0.4.4](https://github.com/thibaudcolas/draftjs-conductor/compare/v0.4.3...v0.4.4) (2019-05-28)

### Bug Fixes

- **copy-paste:** fix partial copy from decorator text. Fix [#12](https://github.com/thibaudcolas/draftjs-conductor/issues/12) ([e043b74](https://github.com/thibaudcolas/draftjs-conductor/commit/e043b74))
- **copy-paste:** support copy from decorators. Fix [#12](https://github.com/thibaudcolas/draftjs-conductor/issues/12) ([d90bbbc](https://github.com/thibaudcolas/draftjs-conductor/commit/d90bbbc))
- **release:** remove unneeded react-dom peerDependency ([3e59f05](https://github.com/thibaudcolas/draftjs-conductor/commit/3e59f05))

### Performance Improvements

- **copy-paste:** completely skip event handling operations in IE11 ([9521758](https://github.com/thibaudcolas/draftjs-conductor/commit/9521758))

## [0.4.3](https://github.com/thibaudcolas/draftjs-conductor/compare/v0.4.2...v0.4.3) (2019-04-21)

### Bug Fixes

- **selection:** use getContentStateFragment for readonly copy. Fix [#14](https://github.com/thibaudcolas/draftjs-conductor/issues/14) ([0483d82](https://github.com/thibaudcolas/draftjs-conductor/commit/0483d82))

## [0.4.2](https://github.com/thibaudcolas/draftjs-conductor/compare/v0.4.1...v0.4.2) (2019-04-21)

### Bug Fixes

- **api:** update typing so compiled code still validates with Flow ([d065ce7](https://github.com/thibaudcolas/draftjs-conductor/commit/d065ce7))

## [0.4.1](https://github.com/thibaudcolas/draftjs-conductor/compare/v0.4.0...v0.4.1) (2019-01-25)

### Bug Fixes

- **copy-paste:** use explicit check for plain text pastes ([02bdc94](https://github.com/thibaudcolas/draftjs-conductor/commit/02bdc94))

# [0.4.0](https://github.com/thibaudcolas/draftjs-conductor/compare/v0.3.0...v0.4.0) (2019-01-25)

### Features

- **api:** add WIP publication of flow types ([fb7fa29](https://github.com/thibaudcolas/draftjs-conductor/commit/fb7fa29))
- **api:** convert ListNestingStyles from PureComponent to function ([44f9a5f](https://github.com/thibaudcolas/draftjs-conductor/commit/44f9a5f))
- **api:** publish package with Flow annotations built in ([d7e190f](https://github.com/thibaudcolas/draftjs-conductor/commit/d7e190f))
- **api:** remove (undocumented) prefix prop on ListNestingStyles ([774fe8a](https://github.com/thibaudcolas/draftjs-conductor/commit/774fe8a))

# [0.3.0](https://github.com/thibaudcolas/draftjs-conductor/compare/v0.2.1...v0.3.0) (2018-10-27)

### Features

- **release:** mark package as side-effects-free for Webpack ([#11](https://github.com/thibaudcolas/draftjs-conductor/issues/11)) ([5923318](https://github.com/thibaudcolas/draftjs-conductor/commit/5923318))

## [0.2.1](https://github.com/thibaudcolas/draftjs-conductor/compare/v0.2.0...v0.2.1) (2018-06-04)

### Bug Fixes

- **copy-paste:** preserve line breaks for pasting into word processors ([8a09efa](https://github.com/thibaudcolas/draftjs-conductor/commit/8a09efa))

# [0.2.0](https://github.com/thibaudcolas/draftjs-conductor/compare/v0.1.0...v0.2.0) (2018-06-03)

### Features

- **copy-paste:** override Draft.js copy-paste to preserve full editor content ([#2](https://github.com/thibaudcolas/draftjs-conductor/pull/2))

# 0.1.0 (2018-02-24)

### Features

- **api:** add react and react-dom as peerDependencies ([63acfb3](https://github.com/thibaudcolas/draftjs-conductor/commit/63acfb3))
- **lists:** add list nesting styles api to package ([8fb7073](https://github.com/thibaudcolas/draftjs-conductor/commit/8fb7073))
- **lists:** remove whitespace filtering from list styles ([2e29541](https://github.com/thibaudcolas/draftjs-conductor/commit/2e29541))
