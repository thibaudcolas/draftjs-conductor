# [Draft.js conductor](https://thibaudcolas.github.io/draftjs-conductor/) [![npm](https://img.shields.io/npm/v/draftjs-conductor.svg)](https://www.npmjs.com/package/draftjs-conductor) [![Build Status](https://travis-ci.org/thibaudcolas/draftjs-conductor.svg?branch=master)](https://travis-ci.org/thibaudcolas/draftjs-conductor) [![Coverage Status](https://coveralls.io/repos/github/thibaudcolas/draftjs-conductor/badge.svg)](https://coveralls.io/github/thibaudcolas/draftjs-conductor) [<img src="https://cdn.rawgit.com/springload/awesome-wagtail/ac912cc661a7099813f90545adffa6bb3e75216c/logo.svg" width="104" align="right" alt="Wagtail">](https://wagtail.io/)

> 📝✨ Little [Draft.js](https://facebook.github.io/draft-js/) helpers to make rich text editors _just work_. Built for [Draftail](https://github.com/springload/draftail) and [Wagtail](https://github.com/wagtail/wagtail).

[![Humoristic screenshot of Photoshop’s Magic Wand selection tool applied on a WYSIWYG editor interface](https://thibaudcolas.github.io/draftjs-conductor/wysiwyg-magic-wand.png)](https://thibaudcolas.github.io/draftjs-conductor)

Check out the [online demo](https://thibaudcolas.github.io/draftjs-conductor)!

## Features

> This project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html), and measures performance and [code coverage](https://coveralls.io/github/thibaudcolas/draftjs-conductor).
>
> This package ships as an ES module – if you use a recent module bundler (Webpack, Rollup, Parcel), it can be configured to only include the helpers you actually use in your code.

### Infinite list nesting

By default, Draft.js only provides support for [5 list levels](https://github.com/facebook/draft-js/blob/232791a4e92d94a52c869f853f9869367bdabdac/src/component/contents/DraftEditorContents-core.react.js#L58-L62) for bulleted and numbered lists. While this is often more than enough, some editors need to go further.

Instead of manually writing and maintaining the list nesting styles, use this little helper:

```js
import { ListNestingStyles, blockDepthStyleFn } from 'draftjs-conductor';

<Editor blockStyleFn={blockDepthStyleFn} />
<ListNestingStyles max={6} />
```

`ListNestingStyles` will generate the necessary CSS for your editor’s lists. `blockDepthStyleFn` will then apply classes to blocks based on their depth, so the styles take effect. Voilà!

Relevant Draft.js issues:

* [maxDepth param is greater than 4 in RichUtils.onTab – facebook/draft-js#997](https://github.com/facebook/draft-js/issues/997)
* Still problematic: [Nested list styles above 4 levels are not retained when copy-pasting between Draft instances. – facebook/draft-js#1605 (comment)](https://github.com/facebook/draft-js/pull/1605#pullrequestreview-87340460)

## Contributing

See anything you like in here? Anything missing? We welcome all support, whether on bug reports, feature requests, code, design, reviews, tests, documentation, and more. Please have a look at our [contribution guidelines](.github/CONTRIBUTING.md).

## Development

### Install

> Clone the project on your computer, and install [Node](https://nodejs.org). This project also uses [nvm](https://github.com/creationix/nvm).

```sh
nvm install
# Then, install all project dependencies.
npm install
# Install the git hooks.
./.githooks/deploy
```

### Working on the project

> Everything mentioned in the installation process should already be done.

```sh
# Make sure you use the right node version.
nvm use
# Start the server and the development tools.
npm run start
# Runs linting.
npm run lint
# Start a Flow server for type errors.
npm run flow
# Re-formats all of the files in the project (with Prettier).
npm run format
# Run tests in a watcher.
npm run test:watch
# Run test coverage
npm run test:coverage
# Open the coverage report with:
npm run report:coverage
# Open the build report with:
npm run report:build
# View other available commands with:
npm run
```

### Releases

Use `npm run release`, which uses [standard-version](https://github.com/conventional-changelog/standard-version) to generate the CHANGELOG and decide on the version bump based on the commits since the last release.

## Credits

View the full list of [contributors](https://github.com/thibaudcolas/draftjs-conductor/graphs/contributors). [MIT](LICENSE) licensed. Website content available as [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
