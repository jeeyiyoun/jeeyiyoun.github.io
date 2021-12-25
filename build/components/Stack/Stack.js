import * as React from "react";
import { motion } from "framer-motion";
import { FrameWithMotion } from "../../render/presentation/Frame/FrameWithMotion.js";
import { isFiniteNumber } from "../../render/utils/isFiniteNumber.js";
import { Layer } from "../../render/presentation/Layer.js";
import { ControlType } from "../../render/types/PropertyControls.js";
import { isReactChild, isReactElement } from "../../utils/type-guards.js";
import { paddingFromProps, makePaddingString, hasPaddingPerSide } from "../utils/paddingFromProps.js";
import { useProvideParentSize, ParentSizeState, constraintsEnabled, } from "../../render/types/NewConstraints.js";
import { unwrapFrameProps } from "../../render/presentation/Frame/FrameWithMotion.js";
import { processOverrideForwarding } from "../../render/utils/processOverrideForwarding.js";
import { addPropertyControls } from "../../utils/addPropertyControls.js";
import { useLayoutId } from "../../render/utils/useLayoutId.js";
import { DimensionType } from "../../render/types/Constraints.js";
/**
 * @public
 */
export const Stack = React.memo(React.forwardRef(function Stack(stackProps, ref) {
    const { direction = "vertical", distribution = "start", alignment = "center", gap = 10, children, style: styleProp, className, willChangeTransform, __fromCodeComponentNode, parentSize, __contentWrapperStyle, ...containerProps } = stackProps;
    const flexDirection = toFlexDirection(direction);
    const isReverse = isReverseDirection(flexDirection);
    const justifyContent = toJustifyOrAlignment(distribution);
    const padding = hasPaddingPerSide(containerProps) || containerProps.padding
        ? makePaddingString(paddingFromProps(containerProps))
        : undefined;
    const style = { ...styleProp };
    Layer.applyWillChange({ willChangeTransform }, style, true);
    if (__fromCodeComponentNode && !constraintsEnabled(unwrapFrameProps(containerProps))) {
        containerProps.width = "100%";
        containerProps.height = "100%";
        containerProps._constraints = { enabled: true };
    }
    const layoutId = useLayoutId(stackProps);
    const { children: _children, props } = processOverrideForwarding(containerProps, children);
    const widthType = containerProps.widthType ??
        (containerProps.width === "auto" ? DimensionType.Auto : DimensionType.FixedNumber);
    const heightType = containerProps.heightType ??
        (containerProps.height === "auto" ? DimensionType.Auto : DimensionType.FixedNumber);
    const fractionChildren = handleFraction(_children, direction, widthType, heightType);
    const gapChildren = wrapInGapElement(fractionChildren, gap, flexDirection, justifyContent);
    const content = useProvideParentSize(gapChildren, parentSize ?? ParentSizeState.Disabled);
    const attributes = {
        "data-framer-component-type": "Stack",
    };
    const fromCanvasComponent = containerProps.__fromCanvasComponent;
    if (fromCanvasComponent)
        attributes["data-framer-generated"] = true;
    // When auto-sized, Stacks will use `width/height: min-content`, instead
    // of `width/height: auto`, so text children are sufficiently
    // constrained in width when using "Fill Parent" sizing. WebKit, however
    // (as of March, 2021) has buggy support for `min-content` and will stop
    // respecting `border-box` box-sizing when min-content is applied to an
    // absolutely positioned element (see
    // https://bugs.webkit.org/show_bug.cgi?id=219944). This is a problem,
    // because stacks have padding, so ignoring the correct box-sizing would
    // also lead to unexpected element sizes. To work around this, we wrap
    // the stack's content in a separate element, which will stretch to the
    // full size of the stack and leave the outer element's padding at its
    // default (0).
    //
    // There's an edge case that results from the use of a `min-content`
    // wrapper around an `align-self: stretch` text node. The text node will
    // not be able to shrink beyond the width of its first character, which
    // means that there's an implicit min-width of the entire container
    // that's set by the width of the first character. The real-world
    // implications of this seem relatively small, so we don't do any
    // special handling for that case.
    const contentWrapperStyle = {
        display: "flex",
        flexDirection,
        justifyContent: justifyContent,
        alignItems: toJustifyOrAlignment(alignment),
        padding,
        ...__contentWrapperStyle,
    };
    if (contentWrapperStyle.width === undefined) {
        contentWrapperStyle.width = widthType === DimensionType.Auto ? "min-content" : "100%";
    }
    if (contentWrapperStyle.height === undefined) {
        contentWrapperStyle.height = heightType === DimensionType.Auto ? "min-content" : "100%";
    }
    if (fromCanvasComponent) {
        if (styleProp?.width)
            contentWrapperStyle.width = styleProp?.width;
        if (styleProp?.height)
            contentWrapperStyle.height = styleProp?.height;
    }
    return (React.createElement(FrameWithMotion, { background: fromCanvasComponent ? undefined : "none", ...props, layoutId: layoutId, ref: ref, ...attributes, style: style, className: className, shouldMeasureScroll: true },
        React.createElement(motion.div, { "data-framer-stack-content-wrapper": true, "data-framer-stack-direction-reverse": isReverse, style: contentWrapperStyle }, content)));
}));
Stack.displayName = "Stack";
/**
 * @internal
 */
export function isFractionDimension(dimension) {
    return typeof dimension === "string" && dimension.endsWith("fr");
}
/**
 * @internal
 */
export function fraction(dimension) {
    const value = parseFloat(dimension);
    return isFiniteNumber(value) ? value : 0;
}
function handleFraction(children, direction, widthType, heightType) {
    return React.Children.map(children, child => {
        if (!isReactChild(child) || !isReactElement(child))
            return;
        const isVertical = direction === "vertical";
        const style = {};
        let hasFraction = false;
        const { style: propsStyle, size } = child.props;
        let { width, height } = child.props;
        // convert size to width and height if they are not set already
        if (size !== undefined) {
            if (width === undefined)
                width = size;
            if (height === undefined)
                height = size;
        }
        let newWidth = width;
        let newHeight = height;
        if (isFractionDimension(width)) {
            hasFraction = true;
            hasFraction = true;
            if (isVertical) {
                // "Fill parent" on an auto-sized axis
                if (widthType === DimensionType.Auto) {
                    style.alignSelf = "stretch";
                    newWidth = "auto";
                }
                else {
                    newWidth = `${fraction(width) * 100}%`;
                }
            }
            else {
                newWidth = 1;
                style.flexGrow = fraction(width);
                style.flexBasis = 0;
            }
            style.width = newWidth;
        }
        if (isFractionDimension(height)) {
            hasFraction = true;
            if (isVertical) {
                newHeight = 1;
                style.flexGrow = fraction(height);
                style.flexBasis = 0;
            }
            else {
                // "Fill parent" on an auto-sized axis
                if (heightType === DimensionType.Auto) {
                    style.alignSelf = "stretch";
                    newHeight = "auto";
                }
                else {
                    newHeight = `${fraction(height) * 100}%`;
                }
            }
            style.height = newHeight;
        }
        if (!hasFraction)
            return child;
        const nextStyle = { ...propsStyle, ...style };
        return React.cloneElement(child, {
            width: newWidth,
            height: newHeight,
            style: nextStyle,
        });
    });
}
/**
 * @internal
 */
export function isGapEnabled(gap, justifyContent) {
    if (!gap) {
        return false;
    }
    if (justifyContent && ["space-between", "space-around", "space-evenly", "stretch"].includes(justifyContent)) {
        return false;
    }
    return true;
}
function wrapInGapElement(children, gap, direction, justifyContent) {
    if (!isGapEnabled(gap, justifyContent)) {
        return children;
    }
    const isVertical = isVerticalDirection(direction);
    const gapStyle = {
        display: "contents",
        ["--stack-gap-x"]: `${isVertical ? 0 : gap}px`,
        ["--stack-gap-y"]: `${isVertical ? gap : 0}px`,
    };
    return (React.createElement("div", { "data-framer-stack-gap": true, style: gapStyle }, children));
}
/**
 * @internal
 */
export function toFlexDirection(direction) {
    switch (direction) {
        case "vertical":
            return "column";
        case "horizontal":
            return "row";
        default:
            return direction;
    }
}
function isVerticalDirection(direction) {
    return direction === "column" || direction === "column-reverse";
}
function isReverseDirection(direction) {
    switch (direction) {
        case "column-reverse":
        case "row-reverse":
            return true;
        default:
            return false;
    }
}
/** @internal */
export function toJustifyOrAlignment(distribution) {
    switch (distribution) {
        case "start":
            return "flex-start";
        case "end":
            return "flex-end";
        default:
            return distribution;
    }
}
addPropertyControls(Stack, {
    direction: {
        type: ControlType.SegmentedEnum,
        options: ["horizontal", "vertical"],
        title: "Direction",
        defaultValue: "vertical",
    },
    distribution: {
        type: ControlType.Enum,
        options: ["start", "center", "end", "space-between", "space-around", "space-evenly"],
        optionTitles: ["Start", "Center", "End", "Space Between", "Space Around", "Space Evenly"],
        title: "Distribute",
        defaultValue: "space-around",
    },
    alignment: {
        type: ControlType.SegmentedEnum,
        options: ["start", "center", "end"],
        title: "Align",
        defaultValue: "center",
    },
    gap: {
        type: ControlType.Number,
        min: 0,
        title: "Gap",
        hidden: props => {
            return (props.distribution !== undefined &&
                ["space-between", "space-around", "space-evenly"].includes(props.distribution));
        },
        defaultValue: 10,
    },
    padding: {
        type: ControlType.FusedNumber,
        toggleKey: "paddingPerSide",
        toggleTitles: ["Padding", "Padding per side"],
        valueKeys: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
        valueLabels: ["t", "r", "b", "l"],
        min: 0,
        title: "Padding",
        defaultValue: 0,
    },
});
//# sourceMappingURL=Stack.js.map