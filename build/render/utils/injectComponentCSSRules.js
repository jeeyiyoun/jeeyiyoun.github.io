import * as CSS from "./setDocumentStyles.js";
import { RenderTarget } from "../../render/types/RenderEnvironment.js";
const componentCSSRules = [`[data-framer-component-type] { position: absolute; }`];
const textAlignmentRule = `
[data-framer-component-type="Text"] div {
    text-align: var(--framer-text-alignment, start);
}`;
const renderTextStylesRule = `
[data-framer-component-type="Text"] span,
[data-framer-component-type="Text"] a {
    font-family: var(--font-family);
    font-style: var(--font-style);
    font-weight: min(calc(var(--framer-font-weight-increase, 0) + var(--font-weight, 400)), 900);
    color: var(--text-color);
    letter-spacing: var(--letter-spacing);
    font-size: var(--font-size);
    text-transform: var(--text-transform);
    text-decoration: var(--text-decoration);
    line-height: var(--line-height);
}`;
const textStylesRule = `
[data-framer-component-type="Text"] span,
[data-framer-component-type="Text"] a {
    --font-family: var(--framer-font-family);
    --font-style: var(--framer-font-style);
    --font-weight: var(--framer-font-weight);
    --text-color: var(--framer-text-color);
    --letter-spacing: var(--framer-letter-spacing);
    --font-size: var(--framer-font-size);
    --text-transform: var(--framer-text-transform);
    --text-decoration: var(--framer-text-decoration);
    --line-height: var(--framer-line-height);
}`;
const linkStylesRule = `
[data-framer-component-type="Text"] a,
[data-framer-component-type="Text"] a span {
    --font-family: var(--framer-link-font-family, var(--framer-font-family));
    --font-style: var(--framer-link-font-style, var(--framer-font-style));
    --font-weight: var(--framer-link-font-weight, var(--framer-font-weight));
    --text-color: var(--framer-link-text-color, var(--framer-text-color));
    --font-size: var(--framer-link-font-size, var(--framer-font-size));
    --text-transform: var(--framer-link-text-transform, var(--framer-text-transform));
    --text-decoration: var(--framer-link-text-decoration, var(--framer-text-decoration));
}`;
const linkHoverStylesRule = `
[data-framer-component-type="Text"] a:hover,
[data-framer-component-type="Text"] a span:hover {
    --font-family: var(--framer-link-hover-font-family, var(--framer-link-font-family, var(--framer-font-family)));
    --font-style: var(--framer-link-hover-font-style, var(--framer-link-font-style, var(--framer-font-style)));
    --font-weight: var(--framer-link-hover-font-weight, var(--framer-link-font-weight, var(--framer-font-weight)));
    --text-color: var(--framer-link-hover-text-color, var(--framer-link-text-color, var(--framer-text-color)));
    --font-size: var(--framer-link-hover-font-size, var(--framer-link-font-size, var(--framer-font-size)));
    --text-transform: var(--framer-link-hover-text-transform, var(--framer-link-text-transform, var(--framer-text-transform)));
    --text-decoration: var(--framer-link-hover-text-decoration, var(--framer-link-text-decoration, var(--framer-text-decoration)));
}`;
const linkCurrentStylesRule = `
[data-framer-component-type="Text"].isCurrent a,
[data-framer-component-type="Text"].isCurrent a span {
    --font-family: var(--framer-link-current-font-family, var(--framer-link-font-family, var(--framer-font-family)));
    --font-style: var(--framer-link-current-font-style, var(--framer-link-font-style, var(--framer-font-style)));
    --font-weight: var(--framer-link-current-font-weight, var(--framer-link-font-weight, var(--framer-font-weight)));
    --text-color: var(--framer-link-current-text-color, var(--framer-link-text-color, var(--framer-text-color)));
    --font-size: var(--framer-link-current-font-size, var(--framer-link-font-size, var(--framer-font-size)));
    --text-transform: var(--framer-link-current-text-transform, var(--framer-link-text-transform, var(--framer-text-transform)));
    --text-decoration: var(--framer-link-current-text-decoration, var(--framer-link-text-decoration, var(--framer-text-decoration)));
}`;
// [data-framer-component-text-autosized] is no longer used, but still supported
// included to maintain backwards compatibility for smart components that were
// generated before it was removed:
// https://github.com/framer/FramerStudio/pull/8270.
const textCSSRules = [
    `[data-framer-component-type="Text"] { cursor: inherit; }`,
    `[data-framer-component-text-autosized] * { white-space: pre; }`,
    textAlignmentRule,
    renderTextStylesRule,
    textStylesRule,
    linkStylesRule,
    linkHoverStylesRule,
    linkCurrentStylesRule,
];
const stackPositionRule = `
:not([data-framer-generated]) > [data-framer-stack-content-wrapper] > *,
:not([data-framer-generated]) > [data-framer-stack-content-wrapper] > [data-framer-component-type],
:not([data-framer-generated]) > [data-framer-stack-content-wrapper] > [data-framer-stack-gap] > *,
:not([data-framer-generated]) > [data-framer-stack-content-wrapper] > [data-framer-stack-gap] > [data-framer-component-type] {
    position: relative;
}`;
const stackGapRule = `
[data-framer-stack-gap] > * {
    margin-top: calc(var(--stack-gap-y) / 2);
    margin-bottom: calc(var(--stack-gap-y) / 2);
    margin-right: calc(var(--stack-gap-x) / 2);
    margin-left: calc(var(--stack-gap-x) / 2);
}`;
/* This should take the language direction into account */
const stackDirectionRuleVertical = `
[data-framer-stack-direction-reverse="false"]
[data-framer-stack-gap]
> *:first-child,
[data-framer-stack-direction-reverse="true"]
[data-framer-stack-gap]
> *:last-child {
    margin-top: 0;
    margin-left: 0;
}`;
/* This should take the language direction into account */
const stackDirectionRuleHorizontal = `
[data-framer-stack-direction-reverse="false"]
[data-framer-stack-gap]
> *:last-child,
[data-framer-stack-direction-reverse="true"]
[data-framer-stack-gap]
> *:first-child {
    margin-right: 0;
    margin-bottom: 0;
}`;
const stackCSSRules = [
    stackPositionRule,
    stackGapRule,
    stackDirectionRuleVertical,
    stackDirectionRuleHorizontal,
];
const navigationCSSRules = [
    `
NavigationContainer
[data-framer-component-type="NavigationContainer"] > *,
[data-framer-component-type="NavigationContainer"] > [data-framer-component-type] {
    position: relative;
}`,
];
const scrollCSSRules = [
    `[data-framer-component-type="Scroll"]::-webkit-scrollbar { display: none; }`,
    `[data-framer-component-type="ScrollContentWrapper"] > * { position: relative; }`,
];
const nativeScrollCSSRules = [
    `[data-framer-component-type="NativeScroll"] { -webkit-overflow-scrolling: touch; }`,
    `[data-framer-component-type="NativeScroll"] > * { position: relative; }`,
    `[data-framer-component-type="NativeScroll"].direction-both { overflow-x: scroll; overflow-y: scroll; }`,
    `[data-framer-component-type="NativeScroll"].direction-vertical { overflow-x: hidden; overflow-y: scroll; }`,
    `[data-framer-component-type="NativeScroll"].direction-horizontal { overflow-x: scroll; overflow-y: hidden; }`,
    `[data-framer-component-type="NativeScroll"].direction-vertical > * { width: 100% !important; }`,
    `[data-framer-component-type="NativeScroll"].direction-horizontal > * { height: 100% !important; }`,
    `[data-framer-component-type="NativeScroll"].scrollbar-hidden::-webkit-scrollbar { display: none; }`,
];
const pageContentWrapperWrapperCSSRules = [
    `[data-framer-component-type="PageContentWrapper"] > *, [data-framer-component-type="PageContentWrapper"] > [data-framer-component-type] { position: relative; }`,
];
const presenceCSS = [
    `[data-is-present="false"], [data-is-present="false"] * { pointer-events: none !important; }`,
];
const cursorCSS = [
    `[data-framer-cursor="pointer"] { cursor: pointer; }`,
    `[data-framer-cursor="grab"] { cursor: grab; }`,
    `[data-framer-cursor="grab"]:active { cursor: grabbing; }`,
];
/**
 * Add propagation-blocking if we're not on the canvas. If we add this while on the canvas,
 * strange behaviour can appear in the Component panel, with the drag event being blocked.
 */
const frameCSSRules = (isPreview) => {
    return isPreview
        ? [`[data-framer-component-type="Frame"] *, [data-framer-component-type="Stack"] * { pointer-events: auto; }`]
        : [];
};
const svgCSSRules = [`.svgContainer svg { display: block; }`];
const combineCSSRules = (isPreview) => [
    ...componentCSSRules,
    ...textCSSRules,
    ...stackCSSRules,
    ...navigationCSSRules,
    ...scrollCSSRules,
    ...nativeScrollCSSRules,
    ...pageContentWrapperWrapperCSSRules,
    ...presenceCSS,
    ...cursorCSS,
    ...frameCSSRules(isPreview),
    ...svgCSSRules,
];
// Only generate preview and non preview styles once
/** @internal */
export const combinedCSSRules = combineCSSRules(false);
const combinedCSSRulesForPreview = combineCSSRules(true);
/** @internal */
export const injectComponentCSSRules = (sheet, cache) => {
    const styles = RenderTarget.current() === RenderTarget.preview ? combinedCSSRulesForPreview : combinedCSSRules;
    for (const rule of styles)
        CSS.injectCSSRule(rule.trim(), sheet, cache);
};
//# sourceMappingURL=injectComponentCSSRules.js.map