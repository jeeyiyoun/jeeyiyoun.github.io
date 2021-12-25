import type { Spring, Tween } from "framer-motion";
import * as React from "react";
/**
 * @internal
 */
export interface NavigateOptions {
    transition?: "push" | "instant" | "fade" | "modal" | "overlay" | "flip" | "magicMotion";
    appearsFrom?: "left" | "right" | "top" | "bottom";
    backdropColor?: string;
    animation?: Spring & Omit<Tween, "type">;
}
/**
 * @public
 */
export declare type ComponentWithPreload<T extends React.ComponentType> = T & {
    preload: () => Promise<T>;
};
/**
 * @internal
 */
export declare function isLazyComponentType<T extends React.ComponentType>(componentType: string | React.ComponentType | ComponentWithPreload<T>): componentType is ComponentWithPreload<T>;
/**
 * Enhance React.lazy() with a preload function.
 *
 * @internal
 */
export declare function lazy<T extends React.ComponentType>(factory: () => Promise<{
    default: T;
}>): ComponentWithPreload<T>;
interface Options {
    /**
     * useNavigate allows preloading targets of the calling component. These
     * targets can either be strings that are valid keys in the `routes` prop of
     * a wrapping Navigation component, or a React Component type reference.
     *
     * If the entry is a string, useNavigate will attempt to retrieve a
     * reference to a React component from the Navigation context.
     */
    preload?: (string | RouteComponent)[];
}
/**
 * @public
 */
export declare type RouteComponent = React.ReactElement | React.ComponentType | ComponentWithPreload<React.ComponentType>;
declare type RouteId = string;
/**
 * @public
 */
export interface RouteInfo {
    title?: string;
    path?: string;
}
/**
 * @public
 */
export interface Route extends RouteInfo {
    page: RouteComponent;
}
/**
 * @public
 */
export declare type Routes = Record<RouteId, Route>;
/**
 * @internal
 */
export declare function isRoute(route: unknown): route is Route;
/**
 * @public
 */
export declare const NavigationRoutesContext: React.Context<Routes>;
/**
 * A relative duplicate of useNavigate from runtime to support navigation in
 * combined screens. Additionally supports a preload argument that allows target
 * screens that are lazy imported to be requested before they are navigated to.
 *
 * @internal
 */
export declare function useNavigate({ preload }?: Options): (() => void) | ((target: RouteComponent | string | "previous", options?: NavigateOptions) => false | undefined);
export {};
//# sourceMappingURL=useNavigate.d.ts.map