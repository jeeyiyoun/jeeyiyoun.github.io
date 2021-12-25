import { useConstant } from "../components/utils/useConstant.js";
import * as React from "react";
import { extractPrefixedProps } from "./hocOptions.js";
class SharedIntersectionObserver {
    #sharedIntersectionObserver;
    #callbacks = new WeakMap();
    constructor(options) {
        if (!document)
            return;
        this.#sharedIntersectionObserver = new IntersectionObserver(this.resizeObserverCallback.bind(this), options);
    }
    resizeObserverCallback(entries, observer) {
        for (const entry of entries) {
            const callbackForElement = this.#callbacks.get(entry.target);
            if (callbackForElement)
                callbackForElement([entry], observer);
        }
    }
    observeElementWithCallback(element, callback) {
        if (!this.#sharedIntersectionObserver)
            return;
        this.#sharedIntersectionObserver.observe(element);
        this.#callbacks.set(element, callback);
    }
    unobserve(element) {
        if (!this.#sharedIntersectionObserver)
            return;
        this.#sharedIntersectionObserver.unobserve(element);
        this.#callbacks.delete(element);
    }
    get root() {
        return this.#sharedIntersectionObserver?.root;
    }
}
const SharedIntersectionObserverContext = React.createContext(new Map());
/**
 * @internal
 */
export function useSharedIntersectionObserver(ref, callback, options) {
    const key = useConstant(() => `${options.rootMargin}${options.threshold}`);
    const observers = React.useContext(SharedIntersectionObserverContext);
    React.useEffect(() => {
        if (typeof IntersectionObserver === "undefined")
            return;
        const element = ref.current;
        if (!element)
            return;
        let observer = observers.get(key);
        if (!observer || observer.root !== options.root?.current) {
            const { root, ...rest } = options;
            observer = new SharedIntersectionObserver({ ...rest, root: root?.current });
            observers.set(key, observer);
        }
        observer.observeElementWithCallback(element, callback);
        return () => observer?.unobserve(element);
    }, []);
}
/**
 * @internal
 */
export const ViewportContext = React.createContext(null);
/**
 * @public
 */
export const withVariantAppearEffect = (Component) => React.forwardRef((props, forwardedRef) => {
    const viewport = React.useContext(ViewportContext);
    const fallbackRef = React.useRef(null);
    const ref = forwardedRef ?? fallbackRef;
    const internalState = React.useRef({
        isInView: false,
        hasAnimatedOnce: false,
    });
    const [options, rest] = extractPrefixedProps(props);
    const [variant, setVariant] = React.useState(options.obscuredVariantId || undefined);
    const callback = React.useCallback(([entry]) => {
        const { isInView, hasAnimatedOnce } = internalState.current;
        const { animateOnce, visibleVariantId, obscuredVariantId } = options;
        if (entry.isIntersecting && !isInView) {
            if (animateOnce && hasAnimatedOnce)
                return;
            internalState.current.hasAnimatedOnce = true;
            internalState.current.isInView = true;
            setVariant(visibleVariantId);
            return;
        }
        if (!entry.isIntersecting && isInView) {
            internalState.current.isInView = false;
            if (animateOnce)
                return;
            setVariant(obscuredVariantId);
            return;
        }
    }, []);
    const threshold = options.threshold ?? 0.5;
    useSharedIntersectionObserver(ref, callback, {
        root: viewport,
        threshold,
    });
    return React.createElement(Component, { ...rest, variant: variant, ref: ref });
});
//# sourceMappingURL=withVariantAppearEffect.js.map