import { IsInitialNavigationContext } from "../components/Navigation.js";
import { useConstant } from "../components/utils/useConstant.js";
import { useCallback, useContext, useEffect, useState } from "react";
import { useIsOnFramerCanvas } from "./useIsOnFramerCanvas.js";
import { useIsomorphicLayoutEffect } from "../useIsomorphicLayoutEffect.js";
import { useInstantLayoutTransition } from "framer-motion";
function activeBreakpointFromWidth(breakpoints, width) {
    if (!width)
        return undefined;
    for (const variant in breakpoints) {
        const { min = 0, max } = breakpoints[variant];
        const matchMin = width >= min;
        const matchMax = max === undefined ? true : width <= max;
        if (matchMin && matchMax)
            return variant;
    }
}
function createMediaQueriesFromBreakpoints(breakpoints) {
    const mediaQueries = {};
    for (const variant in breakpoints) {
        const { min = 0, max } = breakpoints[variant];
        const mediaQuery = [];
        if (min)
            mediaQuery.push(`(min-width: ${min}px)`);
        if (max)
            mediaQuery.push(`(max-width: ${max}px)`);
        if (mediaQuery.length)
            mediaQueries[variant] = mediaQuery.join(" and ");
    }
    return mediaQueries;
}
function activeMediaQueryFromWindow(mediaQueries) {
    for (const variant in mediaQueries) {
        const mql = window.matchMedia(mediaQueries[variant]);
        if (mql.matches)
            return variant;
    }
}
/** @internal */
export function useBreakpointVariants(initial, width, breakpoints) {
    const onCanvas = useIsOnFramerCanvas();
    const isInitialNavigation = useContext(IsInitialNavigationContext);
    const mediaQueries = useConstant(() => createMediaQueriesFromBreakpoints(breakpoints));
    const [activeVariant, setActiveVariant] = useState(() => {
        if (onCanvas)
            return activeBreakpointFromWidth(breakpoints, width) ?? initial;
        if (isInitialNavigation === true) {
            // The initial navigation should always start with the initial
            // breakpoint, to play nicely with SSR and hydration.
            return initial;
        }
        else {
            return activeMediaQueryFromWindow(mediaQueries) ?? initial;
        }
    });
    const instantTransition = useInstantLayoutTransition();
    const setActiveVariantInstant = useCallback(variant => {
        // Make sure we're actually changing the variant.
        //
        // If we were to re-render with no variant change, React will bail
        // out of re-rendering, and instantTransition will instead apply to
        // the _next_ transition.
        if (variant !== activeVariant)
            instantTransition(() => setActiveVariant(variant));
    }, [activeVariant, instantTransition, setActiveVariant]);
    // If this is an initial navigation, we started with the initial breakpoint
    // to avoid hydration errors, but then we want to immediately re-render with
    // the correct breakpoint.
    useIsomorphicLayoutEffect(() => {
        if (onCanvas)
            return;
        if (isInitialNavigation !== true)
            return;
        const initialVariantFromWindow = activeMediaQueryFromWindow(mediaQueries) ?? initial;
        setActiveVariantInstant(initialVariantFromWindow);
        // This hook should only ever run once.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // In the preview, after mount, add event listeners to media queries to
    // update the active variant when they match. Finally, cleanup the listeners
    // when the component is unmounted.
    useEffect(() => {
        if (onCanvas)
            return;
        const callbacks = [];
        for (const variant in mediaQueries) {
            const mql = window.matchMedia(mediaQueries[variant]);
            const callback = (event) => {
                if (event.matches)
                    setActiveVariantInstant(variant);
            };
            mql.addEventListener("change", callback);
            callbacks.push([mql, callback]);
        }
        return () => callbacks.forEach(([mql, callback]) => mql.removeEventListener("change", callback));
    }, [onCanvas, mediaQueries, setActiveVariantInstant]);
    // On the canvas, listen to the width prop, and update the initial and
    // active variant based on the defined breakpoints.
    useIsomorphicLayoutEffect(() => {
        if (!onCanvas)
            return;
        const variantFromWidth = activeBreakpointFromWidth(breakpoints, width);
        if (variantFromWidth)
            setActiveVariantInstant(variantFromWidth);
    }, [width, breakpoints, onCanvas, setActiveVariantInstant]);
    return activeVariant;
}
//# sourceMappingURL=useBreakpointVariants.js.map