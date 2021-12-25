import * as React from "react";
import { NavigationTransition, FadeTransitionOptions, PushTransitionOptions, ModalTransitionOptions, OverlayTransitionOptions, FlipTransitionOptions, NavigationTransitionAnimation } from "./NavigationTransitions.js";
import { NavigationState } from "./reduceNavigationStateForAction.js";
import type { RouteInfo } from "../modules/useNavigate.js";
/**
 * The navigator allows control over the built-in navigation component in Framer.
 * @public
 */
export interface NavigationInterface {
    /**
     * Go back to the previous screen. If a stack of overlays is presented, all overlays are dismissed.
     * @public
     * */
    goBack: () => void;
    /**
     * Show new screen instantly.
     * @param component - The incoming component
     * @public
     */
    instant: (component: React.ReactNode, route?: RouteInfo) => void;
    /**
     * Fade in new screen.
     * @param component - The incoming component
     * @param options - {@link FadeTransitionOptions}
     * @public
     */
    fade: (component: React.ReactNode, options?: FadeTransitionOptions, route?: RouteInfo) => void;
    /**
     * Push new screen. Defaults from right to left, the direction can be changed using the {@link NavigationTransitionOptions}.
     * @param component - The incoming component
     * @param options - {@link PushTransitionOptions}
     * @public
     */
    push: (component: React.ReactNode, options?: PushTransitionOptions, route?: RouteInfo) => void;
    /**
     * Present modal overlay in the center.
     * @param component - The incoming component
     * @param options - {@link ModalTransitionOptions}
     * @public
     */
    modal: (component: React.ReactNode, options?: ModalTransitionOptions) => void;
    /**
     * Present overlay from one of four edges. The direction can be changed using the {@link NavigationTransitionOptions}.
     * @param component - The incoming component
     * @param options - {@link OverlayTransitionOptions}
     * @public
     */
    overlay: (component: React.ReactNode, options?: OverlayTransitionOptions) => void;
    /**
     * Flip incoming and outgoing screen in 3D. The flip direction can be changed using the {@link NavigationTransitionOptions}.
     * @param component - The incoming component
     * @param options - {@link FlipTransitionOptions}
     * @public
     */
    flip: (component: React.ReactNode, options?: FlipTransitionOptions, route?: RouteInfo) => void;
    /**
     * Present a screen using a custom {@link NavigationTransition}.
     * @param component - The incoming component
     * @param transition - {@link NavigationTransition}
     * @public
     */
    customTransition: (component: React.ReactNode, transition: NavigationTransition) => void;
    /**
     * Animate layers with matching magicIds between screens. Layers are assigned matching IDs if they share a name, or were copied from one another.
     * The transition can be changed using a custom {@link NavigationTransition}.
     * @param component - The incoming component
     * @param transition - {@link NavigationTransition}
     * @public
     */
    magicMotion: (component: React.ReactNode, transition: NavigationTransition, route?: RouteInfo) => void;
}
/**
 * Provides {@link NavigationInterface} that can be used to start transitions in Framer.
 * @public
 */
export declare const NavigationConsumer: React.Consumer<NavigationInterface>;
declare type NavigationCallback = (key: string) => void;
declare const NavigationCallbackContext: React.Context<NavigationCallback | undefined>;
/**
 * @internal
 */
export declare const NavigationCallbackProvider: React.Provider<NavigationCallback | undefined>;
/**
 * @internal
 */
export declare const IsInitialNavigationContext: React.Context<boolean | undefined>;
/**
 * @internal
 */
export interface NavigationProps {
    /** @deprecated - still used by the old library */
    width?: number;
    /** @deprecated - still used by the old library */
    height?: number;
    style?: React.CSSProperties;
    /** @internal */
    enabled?: boolean;
    withOverflowScrolling?: boolean;
    __asExperimentalRouter?: boolean;
}
interface LayoutProjectionHelpers {
    resetProjection?: () => void;
    skipLayoutAnimation?: (cb?: () => void) => void;
}
/**
 * @internal export for testing only
 */
declare class Navigation extends React.Component<NavigationProps & LayoutProjectionHelpers, NavigationState> implements NavigationInterface {
    private lastEventTimeStamp;
    state: NavigationState;
    static defaultProps: NavigationProps;
    static contextType: React.Context<NavigationCallback | undefined>;
    context: React.ContextType<typeof NavigationCallbackContext>;
    constructor(props: NavigationProps & LayoutProjectionHelpers);
    componentDidMount(): void;
    handlePopState(event: PopStateEvent): void;
    UNSAFE_componentWillReceiveProps(props: NavigationProps): void;
    componentWillUnmount(): void;
    private getStackState;
    /**
     * To prevent bubbling events from triggering multiple transitions,
     * we ensure that the current event has a different timestamp then the event that triggered the last transition.
     * We use Window.event to ensure that even transitions invoked by code components - and may not pass a reference to the event - are caught.
     * This works better than measuring the time of transition calls with performance.now()
     * because the time between calls can get longer and longer as more screens are added to the stack,
     * preventing a deterministic time between transitions to be used to determine if they were triggered at the same time or not.
     */
    private isSameEventTransition;
    private navigationAction;
    private transition;
    goBack: () => void;
    popState: (direction: "forward" | "back") => void;
    instant(component: React.ReactNode, route?: RouteInfo): void;
    fade(component: React.ReactNode, options?: FadeTransitionOptions, route?: RouteInfo): void;
    push(component: React.ReactNode, options?: PushTransitionOptions, route?: RouteInfo): void;
    modal(component: React.ReactNode, options?: ModalTransitionOptions): void;
    overlay(component: React.ReactNode, options?: OverlayTransitionOptions): void;
    flip(component: React.ReactNode, options?: FlipTransitionOptions, route?: RouteInfo): void;
    magicMotion(component: React.ReactNode, options?: NavigationTransitionAnimation, route?: RouteInfo): void;
    customTransition(component: React.ReactNode, transition: NavigationTransition): void;
    render(): JSX.Element;
}
/**
 * @internal
 */
declare const NavigationWrapper: React.FunctionComponent<NavigationProps>;
export { Navigation as NavigationClass };
export { NavigationWrapper as Navigation };
//# sourceMappingURL=Navigation.d.ts.map