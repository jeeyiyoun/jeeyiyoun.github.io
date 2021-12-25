import * as React from "react";
import { useRef, useEffect, useContext } from "react";
import { FrameWithMotion } from "../render/presentation/Frame/index.js";
import { isFiniteNumber } from "../render/utils/isFiniteNumber.js";
import { useAnimation, PresenceContext } from "framer-motion";
import { NavigationContainerContext } from "./NavigationContainerContext.js";
import { LayoutIdContext } from "./AnimateLayout/LayoutIdContext.js";
import { SharedLayoutTree } from "./AnimateLayout/SharedLayoutTree.js";
import { NavigationTargetWrapper } from "./NavigationTargetContext.js";
import { NavigationRouteContextProvider } from "./NavigationRouteContext.js";
import { ViewportContext } from "../modules/withVariantAppearEffect.js";
export const NavigationContainer = React.memo(function NavigationContainer({ isLayeredContainer, isCurrent, isPrevious, isOverlayed = false, visible, transitionProps, children, backdropColor, onTapBackdrop, backfaceVisible, exitBackfaceVisible, animation, exitAnimation, instant, initialProps, exitProps, position = { top: 0, right: 0, bottom: 0, left: 0 }, withMagicMotion, index, areMagicMotionLayersPresent, id, withOverflowScrolling = false, isInitial, }) {
    const animate = useAnimation();
    const presence = useContext(PresenceContext);
    const { persistLayoutIdCache } = useContext(LayoutIdContext);
    const previousState = useRef({
        wasCurrent: undefined,
        wasPrevious: false,
        wasBeingRemoved: false,
        wasReset: true,
        origins: getOriginProps({}, initialProps, transitionProps),
    });
    const viewportRef = useRef(null);
    const isBeingRemoved = presence !== null && !presence.isPresent;
    // When a container mounts, persist the old layoutId cache.
    if (isCurrent && previousState.current.wasCurrent === undefined)
        persistLayoutIdCache();
    useEffect(() => {
        // Overlays do not use animationControls to animate, don't provide isCurrent or isPrevious,
        // and don't need to update lastStateRef.
        // `animate` is mocked as undefined for tests.
        if (isLayeredContainer || !animate)
            return;
        if (isBeingRemoved) {
            previousState.current = {
                ...previousState.current,
                wasBeingRemoved: isBeingRemoved,
            };
            return;
        }
        const { wasPrevious, wasCurrent } = previousState.current;
        const shouldAnimateIn = (isCurrent && !wasCurrent) ||
            // If the screen was being removed as a result of a "go back" transition, but that removal is interrupted,
            // resulting in this screen being restored to the current screen, we need to trigger an animation.
            (!isBeingRemoved && previousState.current.wasBeingRemoved && isCurrent);
        const shouldAnimateOut = isPrevious && !wasPrevious;
        const origins = getOriginProps(previousState.current.origins, initialProps, transitionProps);
        let wasReset = previousState.current.wasReset;
        if (shouldAnimateIn || shouldAnimateOut) {
            animate.stop();
            animate.start({
                zIndex: index,
                ...origins,
                ...transitionProps,
            });
            wasReset = false;
        }
        else if (wasReset === false) {
            animate.stop();
            // Set an identity transform to reset exit animations on NavigationContainer's that may need to be animated in again later.
            animate.set({ zIndex: index, ...allAnimatableProperties, opacity: 0 });
            wasReset = true;
        }
        previousState.current = {
            wasCurrent: !!isCurrent,
            wasPrevious: !!isPrevious,
            wasBeingRemoved: false,
            wasReset,
            origins,
        };
        // We only need to update when the NavigationContainer's position in the stack changes, or it is removed.
    }, [isCurrent, isPrevious, isBeingRemoved]);
    const transition = instant ? { type: false } : { ...animation, velocity: 0 };
    const exitTransition = instant ? { type: false } : exitAnimation || animation;
    const layout = { ...position };
    if (layout.left === undefined || layout.right === undefined)
        layout.width = "auto";
    if (layout.top === undefined || layout.bottom === undefined)
        layout.height = "auto";
    const needsPerspective = contains3Dprops(transitionProps) || contains3Dprops(initialProps);
    // `perspective: 0` coupled with `backgroundColor: transparent`, combine in Firefox to cause the root element and it's children
    // to not be rendered until the tab is refocused. Unsetting `perspective` all together when it's not required, solves this.
    const perspective = needsPerspective && (isLayeredContainer || isCurrent || isPrevious) ? 1200 : undefined;
    const identity = { ...allAnimatableProperties, ...previousState.current.origins };
    const animations = isLayeredContainer
        ? {
            initial: { ...identity, ...initialProps },
            animate: { ...identity, ...transitionProps, transition },
            exit: { ...identity, ...exitProps, transition: animation }, // Overlay exits are always animated
        }
        : {
            animate,
            exit: { ...identity, ...exitProps, transition: exitTransition },
        };
    const isPresent = isBeingRemoved || areMagicMotionLayersPresent === false ? false : true;
    // Available for descendant components to know if this is the active screen, we check for isPresent because the screen might be unmounted
    const isCurrentTarget = !!isCurrent && isPresent;
    const scrollStyles = withOverflowScrolling ? { overflow: "auto", minHeight: "100%" } : {};
    // The very first item on the navigation stack should always render with
    // opacity 1, for SSR reasons.
    //
    // TODO: We can probably remove this if/when we create a web-specific
    // navigation component.
    const forceOpacity = isCurrent && isInitial;
    return (React.createElement(FrameWithMotion, { width: "100%", height: "100%", style: {
            position: "absolute",
            transformStyle: "flat",
            backgroundColor: "transparent",
            overflow: "hidden",
            // Unlike Overlays, Screens set zIndex via animation controls to ensure it's set in parallel with the animation being played.
            // However, when a screen exits, it needs to preserve it's zIndex, which can't be applied through an `exit` animation,
            // and might be impacted by the layer created by `perspective`.
            zIndex: isLayeredContainer || isBeingRemoved || (isCurrent && withMagicMotion) ? index : undefined,
            pointerEvents: "none",
            visibility: visible ? "visible" : "hidden",
            perspective,
        } },
        isLayeredContainer && (React.createElement(FrameWithMotion, { width: "100%", height: "100%", transition: animation, initial: { opacity: instant && visible ? 1 : 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, backgroundColor: backdropColor ? backdropColor : "transparent", onTap: !isBeingRemoved ? onTapBackdrop : undefined })),
        React.createElement(FrameWithMotion, { ...layout, ...animations, transition: {
                default: transition,
                originX: { type: false },
                originY: { type: false },
                originZ: { type: false },
            }, backgroundColor: "transparent", backfaceVisible: !isBeingRemoved ? backfaceVisible : exitBackfaceVisible, "data-framer-component-type": "NavigationContainer", "data-framer-is-current-navigation-target": !!isCurrent, style: {
                pointerEvents: "initial",
                // When we mount a new screen that is going to be animated in with animation controls,
                // we need to ensure that the screen is hidden until the animation starts.
                opacity: forceOpacity || isLayeredContainer || (isCurrent && withMagicMotion) ? 1 : 0,
                ...scrollStyles,
            }, shouldMeasureScroll: withOverflowScrolling, "data-is-present": isPresent ? undefined : false, ref: viewportRef },
            React.createElement(ViewportContext.Provider, { value: viewportRef },
                React.createElement(NavigationContainerContext.Provider, { value: isCurrentTarget },
                    React.createElement(NavigationTargetWrapper, { isCurrent: isCurrentTarget, isOverlayed: isOverlayed },
                        React.createElement(NavigationRouteContextProvider, { value: id ?? null },
                            React.createElement(SharedLayoutTree, { isLead: isCurrent, animatesLayout: !!withMagicMotion, transition: transition, isExiting: !isPresent, isOverlayed: isOverlayed, id: id }, children))))))));
}, shouldUsePreviousValue);
function shouldUsePreviousValue(prevProps, nextProps) {
    if (nextProps.isCurrent === undefined)
        return false;
    if (prevProps.isCurrent !== nextProps.isCurrent)
        return false;
    if (prevProps.isPrevious !== nextProps.isPrevious)
        return false;
    // Only re-render when isCurrent and isOverlayed changes
    if (nextProps.isCurrent && prevProps.isOverlayed !== nextProps.isOverlayed)
        return false;
    return true;
}
function getOriginProps(currentOriginProps, initialProps, transitionProps) {
    const result = { ...currentOriginProps };
    if (initialProps) {
        if (isFiniteNumber(initialProps.originX))
            result.originX = initialProps.originX;
        if (isFiniteNumber(initialProps.originY))
            result.originY = initialProps.originY;
        if (isFiniteNumber(initialProps.originZ))
            result.originZ = initialProps.originZ;
    }
    if (transitionProps) {
        if (isFiniteNumber(transitionProps.originX))
            result.originX = transitionProps.originX;
        if (isFiniteNumber(transitionProps.originY))
            result.originY = transitionProps.originY;
        if (isFiniteNumber(transitionProps.originZ))
            result.originZ = transitionProps.originZ;
    }
    return result;
}
// TODO: Refactor `any` to support `Partial<FrameProps>` | { [prop]: number | string, transition: { [prop]: { from: number | string } } }
function contains3Dprops(containerProps) {
    if (!containerProps)
        return false;
    const containsProps = "rotateX" in containerProps || "rotateY" in containerProps || "z" in containerProps;
    if (!containsProps)
        return false;
    const toPropsContain3d = containerProps.rotateX !== 0 || containerProps.rotateY !== 0 || containerProps.z !== 0;
    const fromPropsContain3d = containerProps?.transition?.rotateX.from !== 0 ||
        containerProps?.transition?.rotateY.from !== 0 ||
        containerProps?.transition?.z.from !== 0;
    return toPropsContain3d || fromPropsContain3d;
}
export const allAnimatableProperties = {
    x: 0,
    y: 0,
    z: 0,
    rotate: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    scale: 1,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    skew: 0,
    skewX: 0,
    skewY: 0,
    originX: 0.5,
    originY: 0.5,
    originZ: 0,
    opacity: 1,
};
//# sourceMappingURL=NavigationContainer.js.map