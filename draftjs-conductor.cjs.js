Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let draft_js_lib_getContentStateFragment = require("draft-js/lib/getContentStateFragment");
draft_js_lib_getContentStateFragment = __toESM(draft_js_lib_getContentStateFragment);
let draft_js_lib_getDraftEditorSelection = require("draft-js/lib/getDraftEditorSelection");
draft_js_lib_getDraftEditorSelection = __toESM(draft_js_lib_getDraftEditorSelection);
let draft_js_lib_editOnCopy = require("draft-js/lib/editOnCopy");
draft_js_lib_editOnCopy = __toESM(draft_js_lib_editOnCopy);
let draft_js_lib_editOnCut = require("draft-js/lib/editOnCut");
draft_js_lib_editOnCut = __toESM(draft_js_lib_editOnCut);
let draft_js = require("draft-js");
//#region src/lib/api/lists.ts
const DRAFT_DEFAULT_MAX_DEPTH = 4;
const DRAFT_DEFAULT_DEPTH_CLASS = "public-DraftStyleDefault-depth";
/**
* Matching the counter styles of Google Docs and Draft.js v0.11.
* See https://github.com/facebook/draft-js/commit/d2a3ae8.
*/
const COUNTER_STYLES = [
	"decimal",
	"lower-alpha",
	"lower-roman"
];
/**
* Generates CSS styles for list items, for a given selector pattern.
* @deprecated Use getListNestingStyles instead, which has the same signature.
* @param {string} selectorPrefix
* @param {number} minDepth
* @param {number} maxDepth
* @param {Array} counterStyles
*/
const generateListNestingStyles = (selectorPrefix, minDepth, maxDepth, counterStyles) => {
	let styles = `
.${selectorPrefix}1.public-DraftStyleDefault-orderedListItem::before { content: counter(ol1, ${counterStyles[1 % counterStyles.length]}) ". "}
.${selectorPrefix}2.public-DraftStyleDefault-orderedListItem::before { content: counter(ol2, ${counterStyles[2 % counterStyles.length]}) ". "}
.${selectorPrefix}4.public-DraftStyleDefault-orderedListItem::before { content: counter(ol4, ${counterStyles[4 % counterStyles.length]}) ". "}
`;
	for (let depth = minDepth; depth <= maxDepth; depth++) {
		const d = String(depth);
		const prefix = `${selectorPrefix}${d}`;
		const counter = `ol${d}`;
		const counterStyle = counterStyles[depth % counterStyles.length];
		const margin = 1.5 * (depth + 1);
		const m = String(margin);
		styles += `
.${prefix}.public-DraftStyleDefault-listLTR { margin-left: ${m}em; }
.${prefix}.public-DraftStyleDefault-listRTL { margin-right: ${m}em; }
.${prefix}.public-DraftStyleDefault-orderedListItem::before { content: counter(${counter}, ${counterStyle}) '. '; counter-increment: ${counter}; }
.${prefix}.public-DraftStyleDefault-reset { counter-reset: ${counter}; }`;
	}
	return styles;
};
/**
* Dynamically generates the right list nesting styles.
* Can be wrapped as a pure component - to re-render only when `max` changes (eg. never).
*/
const getListNestingStyles = (maxDepth, minDepth = 5, selectorPrefix = DRAFT_DEFAULT_DEPTH_CLASS, counterStyles = COUNTER_STYLES) => {
	return generateListNestingStyles(selectorPrefix, minDepth, maxDepth, counterStyles);
};
/**
* Add depth classes that Draft.js doesn't provide.
* See https://github.com/facebook/draft-js/blob/232791a4e92d94a52c869f853f9869367bdabdac/src/component/contents/DraftEditorContents-core.react.js#L58-L62.
* @param {ContentBlock} block
*/
const blockDepthStyleFn = (block) => {
	const depth = block.getDepth();
	return depth > 4 ? `${DRAFT_DEFAULT_DEPTH_CLASS}${String(depth)}` : "";
};
//#endregion
//#region src/lib/api/copypaste.ts
const FRAGMENT_ATTR = "data-draftjs-conductor-fragment";
const DRAFT_DECORATOR = "[data-contents=\"true\"] [contenteditable=\"false\"]";
const isSelectionInDecorator = (selection) => {
	const { anchorNode, focusNode } = selection;
	if (!anchorNode || !focusNode) return false;
	const anchor = anchorNode instanceof Element ? anchorNode : anchorNode.parentElement;
	const focus = focusNode instanceof Element ? focusNode : focusNode.parentElement;
	const anchorDecorator = anchor && anchor.closest(DRAFT_DECORATOR);
	const focusDecorator = focus && focus.closest(DRAFT_DECORATOR);
	return anchorDecorator && focusDecorator && (anchorDecorator.contains(focusDecorator) || focusDecorator.contains(anchorDecorator));
};
const getSelectedContent = (editorState, editorRoot) => {
	const { selectionState } = (0, draft_js_lib_getDraftEditorSelection.default)(editorState, editorRoot);
	const fragment = (0, draft_js_lib_getContentStateFragment.default)(editorState.getCurrentContent(), selectionState);
	return fragment.every((block) => {
		return block.getText().length === 0;
	}) ? null : fragment;
};
const draftEditorCopyCutListener = (ref, e) => {
	const selection = window.getSelection();
	if (!e.clipboardData || selection.rangeCount === 0 || isSelectionInDecorator(selection)) return;
	const fragment = getSelectedContent(ref._latestEditorState, ref.editor);
	if (fragment) {
		const content = draft_js.ContentState.createFromBlockArray(fragment.toArray());
		const serialisedContent = JSON.stringify((0, draft_js.convertToRaw)(content));
		const fragmentElt = document.createElement("div");
		fragmentElt.appendChild(selection.getRangeAt(0).cloneContents());
		fragmentElt.setAttribute(FRAGMENT_ATTR, serialisedContent);
		fragmentElt.setAttribute("style", "white-space: pre-wrap;");
		e.clipboardData.setData("text/plain", selection.toString());
		e.clipboardData.setData("text/html", fragmentElt.outerHTML);
		e.preventDefault();
	}
};
const onDraftEditorCopy = (editor, e) => {
	draftEditorCopyCutListener(editor, e);
	(0, draft_js_lib_editOnCopy.default)(editor, e);
};
const onDraftEditorCut = (editor, e) => {
	draftEditorCopyCutListener(editor, e);
	(0, draft_js_lib_editOnCut.default)(editor, e);
};
/**
* Registers custom copy/cut event listeners on an editor.
*/
const registerCopySource = (ref) => {
	const editorElt = ref.editor;
	const onCopyCut = (event) => draftEditorCopyCutListener(ref, event);
	editorElt.addEventListener("copy", onCopyCut);
	editorElt.addEventListener("cut", onCopyCut);
	return { unregister() {
		editorElt.removeEventListener("copy", onCopyCut);
		editorElt.removeEventListener("cut", onCopyCut);
	} };
};
/**
* Returns pasted content coming from Draft.js editors set up to serialise
* their Draft.js content within the HTML.
*/
const getDraftEditorPastedContent = (html) => {
	if (html === "" || typeof html === "undefined" || html === null) return null;
	const fragmentElt = new DOMParser().parseFromString(html, "text/html").querySelector(`[${FRAGMENT_ATTR}]`);
	if (fragmentElt) {
		const fragmentAttr = fragmentElt.getAttribute(FRAGMENT_ATTR);
		let rawContent;
		try {
			rawContent = JSON.parse(fragmentAttr);
		} catch {
			return null;
		}
		return (0, draft_js.convertFromRaw)(rawContent);
	}
	return null;
};
/**
* Handles pastes coming from Draft.js editors set up to serialise
* their Draft.js content within the HTML.
* This SHOULD NOT be used for stripPastedStyles editor.
*/
const handleDraftEditorPastedText = (html, editorState) => {
	const pastedContent = getDraftEditorPastedContent(html);
	if (pastedContent) {
		const fragment = pastedContent.getBlockMap();
		const content = draft_js.Modifier.replaceWithFragment(editorState.getCurrentContent(), editorState.getSelection(), fragment);
		return draft_js.EditorState.push(editorState, content, "insert-fragment");
	}
	return false;
};
//#endregion
//#region src/lib/api/conversion.ts
const EMPTY_CONTENT_STATE = null;
/**
* Creates a new EditorState from a RawDraftContentState, or an empty editor state by
* passing `null`. Optionally takes a decorator.
*/
const createEditorStateFromRaw = (rawContentState, decorator) => {
	let editorState;
	if (rawContentState) {
		const contentState = (0, draft_js.convertFromRaw)(rawContentState);
		editorState = draft_js.EditorState.createWithContent(contentState, decorator);
	} else editorState = draft_js.EditorState.createEmpty(decorator);
	return editorState;
};
/**
* Serialises the editorState using `convertToRaw`, but returns `null` if
* the editor content is empty (no text, entities, styles).
*/
const serialiseEditorStateToRaw = (editorState) => {
	const contentState = editorState.getCurrentContent();
	const rawContentState = (0, draft_js.convertToRaw)(contentState);
	return rawContentState.blocks.every((block) => {
		return block.text.trim().length === 0 && (!block.entityRanges || block.entityRanges.length === 0) && (!block.inlineStyleRanges || block.inlineStyleRanges.length === 0);
	}) ? EMPTY_CONTENT_STATE : rawContentState;
};
//#endregion
exports.DRAFT_DEFAULT_DEPTH_CLASS = DRAFT_DEFAULT_DEPTH_CLASS;
exports.DRAFT_DEFAULT_MAX_DEPTH = DRAFT_DEFAULT_MAX_DEPTH;
exports.blockDepthStyleFn = blockDepthStyleFn;
exports.createEditorStateFromRaw = createEditorStateFromRaw;
exports.generateListNestingStyles = generateListNestingStyles;
exports.getDraftEditorPastedContent = getDraftEditorPastedContent;
exports.getListNestingStyles = getListNestingStyles;
exports.handleDraftEditorPastedText = handleDraftEditorPastedText;
exports.onDraftEditorCopy = onDraftEditorCopy;
exports.onDraftEditorCut = onDraftEditorCut;
exports.registerCopySource = registerCopySource;
exports.serialiseEditorStateToRaw = serialiseEditorStateToRaw;
