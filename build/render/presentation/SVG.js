import process from "process";
import * as React from "react";
import { safeWindow } from "../../utils/safeWindow.js";
import { Layer } from "./Layer.js";
import { Color } from "../types/Color/Color.js";
import { LinearGradient } from "../types/LinearGradient.js";
import { RadialGradient } from "../types/RadialGradient.js";
import { collectOpacityFromProps } from "../traits/Opacity.js";
import { collectFiltersFromProps } from "../utils/filtersForNode.js";
import { RenderEnvironment, RenderTarget } from "../types/RenderEnvironment.js";
import { useParentSize, ParentSizeState, calculateRect, constraintsEnabled, } from "../types/NewConstraints.js";
import { Animatable } from "../../animation/Animatable/Animatable.js";
import { BackgroundImage } from "../types/BackgroundImage.js";
import { imagePatternPropsForFill } from "../utils/imagePatternPropsForFill.js";
import { isFiniteNumber } from "../utils/isFiniteNumber.js";
import { ImagePatternElement } from "./ImagePatternElement.js";
import { injectComponentCSSRules } from "../utils/injectComponentCSSRules.js";
import { resetSetStyle } from "../utils/useWebkitFixes.js";
import { elementPropertiesForLinearGradient, elementPropertiesForRadialGradient, } from "../utils/elementPropertiesForGradient.js";
import { useLayoutId } from "../utils/useLayoutId.js";
import { motion } from "framer-motion";
import { transformTemplate } from "../utils/transformTemplate.js";
import { useMeasureLayout } from "../utils/useMeasureLayout.js";
import { layoutHintDataPropsForCenter } from "../utils/layoutHintDataPropsForCenter.js";
import { useProvidedWindow } from "../WindowContext.js";
// Before migrating to functional components we need to get parentSize data from context
/**
 * @internal
 */
export function SVG(props) {
    const parentSize = useParentSize();
    const layoutId = useLayoutId(props);
    const layoutRef = React.useRef(null);
    const providedWindow = useProvidedWindow();
    useMeasureLayout(props, layoutRef);
    return (React.createElement(SVGComponent, { ...props, innerRef: layoutRef, parentSize: parentSize, layoutId: layoutId, providedWindow: providedWindow }));
}
function sizeSVG(container, props) {
    const div = container.current;
    if (!div)
        return;
    const { withExternalLayout, parentSize } = props;
    // SVGs rendered on the canvas will already have an explicit size calculated
    // and set by the `collectLayout()` method, so we don't need to resize them
    // again. When in a DOM Layout Stack or a code component parent size will be
    // disabled for the current level, so sizes won't be calculated, and SVGs
    // will be treated as if they have external layout.
    const canUseCalculatedOnCanvasSize = !withExternalLayout &&
        constraintsEnabled(props) &&
        parentSize !== ParentSizeState.Disabled &&
        parentSize !== ParentSizeState.DisabledForCurrentLevel;
    if (canUseCalculatedOnCanvasSize)
        return;
    // The "Sites" experiment allows content to be rendered into an iframe via a
    // react portal. This means that the javascript is executed by react outside
    // of the iframe, but the html elements are mounted inside the iframe. That
    // means that attempting to do checks by reference between dom nodes and dom
    // classes will fail. To work around this, we need to make sure that we use
    // the same reference. We do this by creating a context that captures the
    // value of the iframe's window, we then use that to reference the correct
    // dom node class.
    const localWindow = props.providedWindow ?? window;
    const svg = div.firstElementChild;
    if (!svg || !(svg instanceof localWindow.SVGSVGElement))
        return;
    const { intrinsicWidth, intrinsicHeight, _constraints } = props;
    if (svg.viewBox.baseVal?.width === 0 &&
        svg.viewBox.baseVal?.height === 0 &&
        isFiniteNumber(intrinsicWidth) &&
        isFiniteNumber(intrinsicHeight)) {
        svg.setAttribute("viewBox", `0 0 ${intrinsicWidth} ${intrinsicHeight}`);
    }
    // XXX TODO take the value from _constraints.aspectRatio into account
    if (_constraints && _constraints.aspectRatio) {
        svg.setAttribute("preserveAspectRatio", "");
    }
    else {
        svg.setAttribute("preserveAspectRatio", "none");
    }
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
}
class SVGComponent extends Layer {
    static supportsConstraints = true;
    static defaultSVGProps = {
        left: undefined,
        right: undefined,
        top: undefined,
        bottom: undefined,
        style: undefined,
        _constraints: {
            enabled: true,
            aspectRatio: null,
        },
        parentSize: ParentSizeState.Unknown,
        rotation: 0,
        visible: true,
        svg: "",
        shadows: [],
    };
    static defaultProps = {
        ...Layer.defaultProps,
        ...SVGComponent.defaultSVGProps,
    };
    static frame(props) {
        return calculateRect(props, props.parentSize || ParentSizeState.Unknown);
    }
    container = React.createRef();
    svgElement = null;
    setSVGElement = (element) => {
        this.svgElement = element;
        this.setLayerElement(element);
    };
    previouslyPrefixedSVG;
    previouslyPrefixedSVGResult;
    getPrefixedSVG(svg, id) {
        if (this.previouslyPrefixedSVG &&
            svg === this.previouslyPrefixedSVG.svg &&
            id === this.previouslyPrefixedSVG.id) {
            return this.previouslyPrefixedSVGResult;
        }
        const prefixedSVG = prefixIdsInSVG(svg, id);
        this.previouslyPrefixedSVGResult = prefixedSVG;
        this.previouslyPrefixedSVG = { svg, id };
        return prefixedSVG;
    }
    get frame() {
        return calculateRect(this.props, this.props.parentSize || ParentSizeState.Unknown);
    }
    componentDidMount() {
        if (this.props.noRewrite)
            return;
        sizeSVG(this.container, this.props);
    }
    componentDidUpdate(prevProps) {
        super.componentDidUpdate(prevProps);
        if (this.props.noRewrite)
            return;
        const { fill } = this.props;
        if (BackgroundImage.isImageObject(fill) &&
            BackgroundImage.isImageObject(prevProps.fill) &&
            fill.src !== prevProps.fill.src) {
            resetSetStyle(this.svgElement, "fill", null, false);
        }
        sizeSVG(this.container, this.props);
    }
    collectLayout(style, innerStyle) {
        if (this.props.withExternalLayout) {
            innerStyle.width = innerStyle.height = "inherit";
            return;
        }
        const frame = this.frame;
        const { rotation, intrinsicWidth, intrinsicHeight, width, height } = this.props;
        const rotate = Animatable.getNumber(rotation);
        style.opacity = isFiniteNumber(this.props.opacity) ? this.props.opacity : 1;
        /**
         * The if-statement below switches between positioning the SVG with
         * transforms or (in the else statement) with DOM-layout.
         *
         * On the canvas (when RenderTarget.hasRestrictions()) we want to
         * position with transforms for performance reasons. When dragging an
         * SVG around, if we can reposition an SVG using transforms, it won't
         * trigger a browser layout.
         *
         * In the preview we always position with DOM-layout, to not interfere
         * with Magic Motion that uses the transforms for animating.
         *
         * However, there might be cases where we do not have a frame to use for
         * positioning the SVG using transforms. For example when rendering
         * inside a Scroll component (that uses DOM-layout for it's children,
         * also on the canvas), we cannot always calculate a frame. In these
         * cases we do use DOM-layout to position the SVG, even on the canvas.
         */
        if (RenderTarget.hasRestrictions() && frame) {
            Object.assign(style, {
                transform: `translate(${frame.x}px, ${frame.y}px) rotate(${rotate.toFixed(4)}deg)`,
                width: `${frame.width}px`,
                height: `${frame.height}px`,
            });
            if (constraintsEnabled(this.props)) {
                style.position = "absolute";
            }
            const xFactor = frame.width / (intrinsicWidth || 1);
            const yFactor = frame.height / (intrinsicHeight || 1);
            innerStyle.transformOrigin = "top left";
            const { zoom, target } = RenderEnvironment;
            if (target === RenderTarget.export) {
                const zoomFactor = zoom > 1 ? zoom : 1;
                innerStyle.transform = `scale(${xFactor * zoomFactor}, ${yFactor * zoomFactor})`;
                innerStyle.zoom = 1 / zoomFactor;
            }
            else {
                innerStyle.transform = `scale(${xFactor}, ${yFactor})`;
            }
            if (intrinsicWidth && intrinsicHeight) {
                innerStyle.width = intrinsicWidth;
                innerStyle.height = intrinsicHeight;
            }
        }
        else {
            const { left, right, top, bottom } = this.props;
            Object.assign(style, {
                left,
                right,
                top,
                bottom,
                width,
                height,
                rotate,
            });
            Object.assign(innerStyle, {
                left: 0,
                top: 0,
                bottom: 0,
                right: 0,
                position: "absolute",
            });
        }
    }
    render() {
        if (process.env.NODE_ENV !== "production" && safeWindow["perf"])
            safeWindow["perf"].nodeRender();
        const { id, visible, style, fill, svg, intrinsicHeight, intrinsicWidth, layoutId, className, variants, transition, withExternalLayout, innerRef, noRewrite, } = this.props;
        if (!withExternalLayout && (!visible || !id))
            return null;
        const identifier = id ?? layoutId ?? "svg";
        injectComponentCSSRules();
        const frame = this.frame;
        // XXX find another way to not need these defaults
        const size = frame || { width: intrinsicWidth || 100, height: intrinsicHeight || 100 };
        const outerStyle = { ...style, imageRendering: "pixelated" };
        const innerStyle = {};
        this.collectLayout(outerStyle, innerStyle);
        collectOpacityFromProps(this.props, outerStyle);
        collectFiltersFromProps(this.props, outerStyle);
        Layer.applyWillChange(this.props, outerStyle, false);
        let fillElement = null;
        if (typeof fill === "string" || Color.isColorObject(fill)) {
            const fillColor = Color.isColorObject(fill) ? fill.initialValue || Color.toRgbString(fill) : fill;
            outerStyle.fill = fillColor;
            outerStyle.color = fillColor;
        }
        else if (LinearGradient.isLinearGradient(fill)) {
            const gradient = fill;
            // We need encodeURI() here to handle our old id's that contained special characters like ';'
            // Creating an url() entry for those id's unescapes them, so we need to use the URI encoded version
            const gradientId = `${encodeURI(id || "")}g${LinearGradient.hash(gradient)}`;
            outerStyle.fill = `url(#${gradientId})`;
            const elementProperties = elementPropertiesForLinearGradient(gradient, identifier);
            fillElement = (React.createElement("svg", { ref: this.setSVGElement, xmlns: "http://www.w3.org/2000/svg", width: "100%", height: "100%", style: { position: "absolute" } },
                React.createElement("linearGradient", { id: gradientId, gradientTransform: `rotate(${elementProperties.angle}, 0.5, 0.5)` }, elementProperties.stops.map((stop, idx) => {
                    return (React.createElement("stop", { key: idx, offset: stop.position, stopColor: stop.color, stopOpacity: stop.alpha }));
                }))));
        }
        else if (RadialGradient.isRadialGradient(fill)) {
            const gradient = fill;
            // We need encodeURI() here to handle our old id's that contained special characters like ';'
            // Creating an url() entry for those id's unescapes them, so we need to use the URI encoded version
            const gradientId = `${encodeURI(id || "")}g${RadialGradient.hash(gradient)}`;
            outerStyle.fill = `url(#${gradientId})`;
            const elementProperties = elementPropertiesForRadialGradient(gradient, identifier);
            fillElement = (React.createElement("svg", { ref: this.setSVGElement, xmlns: "http://www.w3.org/2000/svg", width: "100%", height: "100%", style: { position: "absolute" } },
                React.createElement("radialGradient", { id: gradientId, cy: gradient.centerAnchorY, cx: gradient.centerAnchorX, r: gradient.widthFactor }, elementProperties.stops.map((stop, idx) => {
                    return (React.createElement("stop", { key: idx, offset: stop.position, stopColor: stop.color, stopOpacity: stop.alpha }));
                }))));
        }
        else if (BackgroundImage.isImageObject(fill)) {
            const imagePattern = imagePatternPropsForFill(fill, size, identifier);
            if (imagePattern) {
                outerStyle.fill = `url(#${imagePattern.id})`;
                fillElement = (React.createElement("svg", { ref: this.setSVGElement, xmlns: "http://www.w3.org/2000/svg", xmlnsXlink: "http://www.w3.org/1999/xlink", width: "100%", height: "100%", style: { position: "absolute" } },
                    React.createElement("defs", null,
                        React.createElement(ImagePatternElement, { ...imagePattern }))));
            }
        }
        const dataProps = {
            "data-framer-component-type": "SVG",
        };
        const hasTransformTemplate = !frame;
        if (hasTransformTemplate) {
            Object.assign(dataProps, layoutHintDataPropsForCenter(this.props.center));
        }
        const __html = noRewrite ? svg : this.getPrefixedSVG(svg, identifier);
        const content = (React.createElement(React.Fragment, null,
            fillElement,
            React.createElement("div", { key: BackgroundImage.isImageObject(fill) ? fill.src : "", className: "svgContainer" // Style for this class is added by `injectComponentCSSRules`
                , style: innerStyle, ref: this.container, dangerouslySetInnerHTML: { __html } })));
        return (React.createElement(motion.div, { ...dataProps, layoutId: layoutId, transformTemplate: hasTransformTemplate ? transformTemplate(this.props.center) : undefined, id: id, ref: innerRef, style: outerStyle, className: className, variants: variants, transition: transition }, content));
    }
}
/* Takes an SVG string and prefix all the ids and their occurrence with the given string */
export function prefixIdsInSVG(svg, prefix) {
    if (typeof DOMParser === "undefined")
        return svg;
    const domParser = new DOMParser();
    try {
        const doc = domParser.parseFromString(svg, "image/svg+xml");
        const el = doc.getElementsByTagName("svg")[0];
        if (!el)
            return svg;
        const sanitizedPrefix = sanitizeString(prefix);
        recursivelyPrefixId(el, sanitizedPrefix);
        return el.outerHTML;
    }
    catch (error) {
        throw Error(`Failed to parse SVG: ${error}`);
    }
}
// Valid SVG IDs only include designated characters (letters, digits, and a few punctuation marks),
// and do not start with a digit, a full stop (.) character, or a hyphen-minus (-) character.
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/id
function sanitizeString(str) {
    return str.replace(/[^a-z0-9\-_:.]|^[^a-z]+/gi, ""); // source: https://stackoverflow.com/a/9635731/9300219
}
function recursivelyPrefixId(el, prefix) {
    // element itself
    prefixId(el, prefix);
    // handle children
    const childNodes = Array.from(el.children);
    childNodes.forEach(node => {
        recursivelyPrefixId(node, prefix);
    });
}
function prefixId(el, prefix) {
    const attributes = el.getAttributeNames();
    attributes.forEach(attr => {
        const value = el.getAttribute(attr);
        if (!value)
            return;
        // prefix the id
        if (attr === "id") {
            el.setAttribute(attr, `${prefix}_${value}`);
        }
        // prefix occurrence in href (SVG2) or xlink:href
        if (attr === "href" || attr === "xlink:href") {
            const [base, fragmentIdentifier] = value.split("#");
            // The value might have a base URL in two cases:
            // 1. It's a hyperlink
            // 2. It's referencing the fragment from another document
            // In both cases we don't want to touch the value
            if (base)
                return;
            el.setAttribute(attr, `#${prefix}_${fragmentIdentifier}`);
            return;
        }
        // prefix occurrence in url()
        const URL_REF = "url(#";
        if (value.includes(URL_REF)) {
            const prefixedValue = value.replace(URL_REF, `${URL_REF}${prefix}_`);
            el.setAttribute(attr, prefixedValue);
        }
    });
}
//# sourceMappingURL=SVG.js.map