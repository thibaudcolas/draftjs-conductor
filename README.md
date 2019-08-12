# [Draft.js conductor](https://thibaudcolas.github.io/draftjs-conductor/) [![npm](https://img.shields.io/npm/v/draftjs-conductor.svg)](https://www.npmjs.com/package/draftjs-conductor) [![Build Status](https://travis-ci.org/thibaudcolas/draftjs-conductor.svg?branch=master)](https://travis-ci.org/thibaudcolas/draftjs-conductor) [![Coverage Status](https://coveralls.io/repos/github/thibaudcolas/draftjs-conductor/badge.svg)](https://coveralls.io/github/thibaudcolas/draftjs-conductor) [<img src="https://cdn.rawgit.com/springload/awesome-wagtail/ac912cc661a7099813f90545adffa6bb3e75216c/logo.svg" width="104" align="right" alt="Wagtail">](https://wagtail.io/)

> 📝✨ Little [Draft.js](https://facebook.github.io/draft-js/) helpers to make rich text editors _just work_. Built for [Draftail](https://www.draftail.org/) and [Wagtail](https://github.com/wagtail/wagtail).

[![Photoshop’s Magic Wand selection tool applied on a WYSIWYG editor interface](https://thibaudcolas.github.io/draftjs-conductor/wysiwyg-magic-wand.png)](https://thibaudcolas.github.io/draftjs-conductor)

Check out the [online demo](https://thibaudcolas.github.io/draftjs-conductor)!

## Features

- [Infinite list nesting](#infinite-list-nesting)
- [Idempotent copy-paste between editors](#idempotent-copy-paste-between-editors)
- [Editor state data conversion helpers](#editor-state-data-conversion-helpers)

---

### Infinite list nesting

By default, Draft.js only provides support for [5 list levels](https://github.com/facebook/draft-js/blob/232791a4e92d94a52c869f853f9869367bdabdac/src/component/contents/DraftEditorContents-core.react.js#L58-L62) for bulleted and numbered lists. While this is often more than enough, some editors need to go further.

Instead of manually writing and maintaining the list nesting styles, use this little helper:

```js
import { ListNestingStyles, blockDepthStyleFn } from "draftjs-conductor";

<Editor blockStyleFn={blockDepthStyleFn} />
<ListNestingStyles max={6} />
```

`ListNestingStyles` will generate the necessary CSS for your editor’s lists. `blockDepthStyleFn` will then apply classes to blocks based on their depth, so the styles take effect. Voilà!

With React v16.6 and up, you can also leverage [`React.memo`](https://reactjs.org/docs/react-api.html#reactmemo) to speed up re-renders:

```js
const NestingStyles = React.memo(ListNestingStyles);

<NestingStyles max={6} />;
```

Should you need more flexibility, import `generateListNestingStyles` which will allow you to further specify how the styles are generated.

Relevant Draft.js issues:

- [maxDepth param is greater than 4 in RichUtils.onTab – facebook/draft-js#997](https://github.com/facebook/draft-js/issues/997)
- Still problematic: [Nested list styles above 4 levels are not retained when copy-pasting between Draft instances. – facebook/draft-js#1605 (comment)](https://github.com/facebook/draft-js/pull/1605#pullrequestreview-87340460)

---

### Idempotent copy-paste between editors

The default Draft.js copy-paste handlers lose a lot of the formatting when copy-pasting between Draft.js editors. While this might be ok for some use cases, sites with multiple editors on the same page need them to reliably support copy-paste.

Relevant Draft.js issues:

- [Ability to retain pasted custom entities - facebook/draft-js#380](https://github.com/facebook/draft-js/issues/380)
- [Copy/paste between editors – facebook/draft-js#787](https://github.com/facebook/draft-js/issues/787)
- [Extra newlines added to text pasted between two Draft editors – facebook/draft-js#1389](https://github.com/facebook/draft-js/issues/1389)
- [Copy/paste between editors strips soft returns – facebook/draft-js#1154](https://github.com/facebook/draft-js/issues/1154)
- [Sequential unstyled blocks are merged into the same block on paste – facebook/draft-js#738](https://github.com/facebook/draft-js/issues/738)
- [Nested list styles are not retained when copy-pasting between Draft instances. – facebook/draft-js#1163](https://github.com/facebook/draft-js/issues/1163)
- [Nested list styles above 4 levels are not retained when copy-pasting between Draft instances. – facebook/draft-js#1605 (comment)](https://github.com/facebook/draft-js/pull/1605#pullrequestreview-87340460)
- [Merged `<p>` tags on paste – facebook/draft-js#523 (comment)](https://github.com/facebook/draft-js/issues/523#issuecomment-371098488)

All of those problems can be fixed with this library, which overrides the `copy` event to transfer more of the editor’s content, and introduces a function to use with the Draft.js [`handlePastedText`](https://draftjs.org/docs/api-reference-editor#handlepastedtext) to retrieve the pasted content.

**This will paste all copied content, even if the target editor might not support it.** To ensure only supported content is retained, use filters like [draftjs-filters](https://github.com/thibaudcolas/draftjs-filters).

Here’s how to use the copy override, and the paste handler:

```js
import {
  registerCopySource,
  handleDraftEditorPastedText,
} from "draftjs-conductor";

class MyEditor extends Component {
  constructor(props: Props) {
    super(props);

    this.state = {
      editorState: EditorState.createEmpty(),
    };

    this.onChange = this.onChange.bind(this);
    this.handlePastedText = this.handlePastedText.bind(this);
  }

  componentDidMount() {
    this.copySource = registerCopySource(this.editorRef);
  }

  onChange(nextState: EditorState) {
    this.setState({ editorState: nextState });
  }

  handlePastedText(text: string, html: ?string, editorState: EditorState) {
    let newState = handleDraftEditorPastedText(html, editorState);

    if (newState) {
      this.onChange(newState);
      return true;
    }

    return false;
  }

  componentWillUnmount() {
    if (this.copySource) {
      this.copySource.unregister();
    }
  }

  render() {
    const { editorState } = this.state;

    return (
      <Editor
        ref={(ref) => {
          this.editorRef = ref;
        }}
        editorState={editorState}
        onChange={this.onChange}
        handlePastedText={this.handlePastedText}
      />
    );
  }
}
```

`registerCopySource` will ensure the clipboard contains a full representation of the Draft.js content state on copy, while `handleDraftEditorPastedText` retrieves Draft.js content state from the clipboard. Voilà! This also changes the HTML clipboard content to be more semantic, with less styles copied to other word processors/editors.

Note: IE11 isn’t supported, as it doesn't support storing HTML in the clipboard, and we also use the [`Element.closest`](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest) API.

### Editor state data conversion helpers

Draft.js has its own data conversion helpers, [`convertFromRaw`](https://draftjs.org/docs/api-reference-data-conversion#convertfromraw) and [`convertToRaw`](https://draftjs.org/docs/api-reference-data-conversion#converttoraw), which work really well, but aren’t providing that good of an API when initialising or persisting the content of an editor.

We provide two helper methods to simplify the initialisation and serialisation of content. **`createEditorStateFromRaw`** combines [`EditorState.createWithContent`](https://draftjs.org/docs/api-reference-editor-state#createwithcontent), [`EditorState.createEmpty`](https://draftjs.org/docs/api-reference-editor-state#createempty) and [`convertFromRaw`](https://draftjs.org/docs/api-reference-data-conversion#convertfromraw) as a single method:

```js
import { createEditorStateFromRaw } from "draftjs-conductor";

// Initialise with `null` if there’s no preexisting state.
const editorState = createEditorStateFromRaw(null);
// Initialise with the raw content state otherwise
const editorState = createEditorStateFromRaw({ entityMap: {}, blocks: [] });
// Optionally use a decorator, like with Draft.js APIs.
const editorState = createEditorStateFromRaw(null, decorator);
```

To save content, **`serialiseEditorStateToRaw`** combines [`convertToRaw`](https://draftjs.org/docs/api-reference-data-conversion#converttoraw) with checks for empty content – so empty content is saved as `null`, rather than a single text block with empty text as would be the case otherwise.

```js
import { serialiseEditorStateToRaw } from "draftjs-conductor";

// Content will be `null` if there’s no textual content, or RawDraftContentState otherwise.
const content = serialiseEditorStateToRaw(editorState);
```

## Contributing

See anything you like in here? Anything missing? We welcome all support, whether on bug reports, feature requests, code, design, reviews, tests, documentation, and more. Please have a look at our [contribution guidelines](.github/CONTRIBUTING.md).

## Credits

View the full list of [contributors](https://github.com/thibaudcolas/draftjs-conductor/graphs/contributors). [MIT](LICENSE) licensed. Website content available as [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
