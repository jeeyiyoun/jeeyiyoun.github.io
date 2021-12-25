import * as React from "react";
import { Prefixed } from "./hocOptions.js";
interface IntersectionObserverOptions {
    root?: React.RefObject<Element | Document> | null;
    rootMargin?: string;
    threshold?: number | number[];
}
/**
 * @internal
 */
export declare function useSharedIntersectionObserver(ref: React.RefObject<HTMLElement>, callback: IntersectionObserverCallback, options: IntersectionObserverOptions): void;
/**
 * @internal
 */
export declare const ViewportContext: React.Context<React.RefObject<HTMLElement> | null>;
interface VariantAppearEffectOptions {
    visibleVariantId: string | undefined;
    obscuredVariantId: string | undefined;
    threshold: number | undefined;
    animateOnce: boolean;
}
export declare type PrefixedVariantAppearEffectOptions = Prefixed<VariantAppearEffectOptions>;
/**
 * @public
 */
export declare const withVariantAppearEffect: <T extends {
    variant?: string | undefined;
} & object>(Component: React.ComponentType<T>) => React.ForwardRefExoticComponent<React.PropsWithoutRef<Prefixed<VariantAppearEffectOptions> & T> & React.RefAttributes<HTMLElement>>;
export {};
//# sourceMappingURL=withVariantAppearEffect.d.ts.map