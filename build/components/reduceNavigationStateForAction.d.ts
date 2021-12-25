import type * as React from "react";
import type { NavigationTransition } from "./NavigationTransitions.js";
import type { RouteInfo } from "../modules/useNavigate.js";
/**
 * @internal
 */
export interface NavigationState {
    /** The index of the currently visible container. */
    current: number;
    /** The index of the last visible container. */
    previous: number;
    /** The index of the currently visible overlay. */
    currentOverlay: number;
    /** The index of the last visible overlay. */
    previousOverlay: number;
    /** An array of HistoryItems who's components are rendered as overlays. */
    overlayStack: HistoryItem[];
    /**
     * A reference to the last transition used when adding screens with magic motion.
     * Used to ensure the correct transition is used when navigating back.
     */
    previousTransition: NavigationTransition | null;
    /**
     * An array of HistoryItems that records the order containers are navigated to,
     * the transitions used for each navigation, and the visual index the container was rendered at.
     * Used to enable navigating backwards through the history.
     */
    history: HistoryItem[];
    /**
     * A record mapping a container's `key` to the component rendered by a container.
     * Used to stably render a single instance of each component.
     * The visual order is determined by `containerIndex` and `containerVisualIndex`.
     * Whether or not a container is the visible screen is determined by whether or not
     * the value of the container's `containerIndex` matches the value of `current`.
     */
    containers: Record<ContainerKey, React.ReactNode>;
    /**
     * A record mapping a container's `key` to the current index of the container in the history.
     * Used to associated a single component with multiple transitions or positions in the stack.
     */
    containerIndex: Record<ContainerKey, number>;
    /**
     * A record mapping a container's `key` to the current visual index of the container in the history.
     * This can sometimes differ from `containerIndex` when we navigate to an existing navigation target with a magic motion transition,
     * when it will be lower than the `containerIndex`. This enables smarter layering during magic motion transitions.
     */
    containerVisualIndex: Record<ContainerKey, number>;
    /**
     * A record mapping a container's `key` to whether the container should appear to be removed by a magic motion transition.
     * Usually this is only true for containers that have been navigated away from by removing them.
     * Sometimes this is true when a container has been navigated away from by navigating forward to an existing container with magic motion.
     * This ensures that an animation plays in both these scenarios.
     */
    containerIsRemoved: Record<ContainerKey, boolean>;
    /**
     * A record mapping a container's `key` to the most recent sequenced animation it should appear to animate in or out with.
     * This record is not updated unless the container is the `current` or `previous` screen, to ensure running animations play out.
     */
    transitionForContainer: Record<ContainerKey, Record<string, any>>;
    /**
     * When we navigate away from a container by removing it with magic motion, sometimes we cannot mark a container as removed to trigger an animation, as it was already removed.
     * In that scenario we need to increment it's visual index to trigger an animation, even though we are navigating backwards through history. For that we need to track a
     * visual index that is incremented while traveling backwards.
     */
    visualIndex: number;
    /** Used to generate unique overlay ids. */
    overlayItemId: number;
    /** Used to generate unique history ids in the scenario where a React component is not provided, for example via code. */
    historyItemId: number;
}
export declare const defaultState: () => NavigationState;
/**
 * @internal
 */
export interface StackState {
    current: number;
    previous: number;
    history: HistoryItem[];
}
/**
 * @internal
 */
declare type ContainerKey = string;
/**
 * @internal
 */
export interface HistoryItem extends RouteInfo {
    key: ContainerKey;
    transition: NavigationTransition;
    component?: React.ReactNode;
    visualIndex?: number;
}
/**
 * @internal
 */
export declare function isPartialHistoryItem(item: unknown): item is Omit<HistoryItem, "component">;
/**
 * @internal
 */
export declare type NavigationAction = {
    type: "add";
    key: ContainerKey;
    transition: NavigationTransition;
    component: React.ReactNode;
    route?: RouteInfo;
} | {
    type: "addOverlay";
    transition: NavigationTransition;
    component: React.ReactNode;
} | {
    type: "remove";
} | {
    type: "removeOverlay";
} | {
    type: "update";
    key: ContainerKey;
    component: React.ReactNode;
} | {
    type: "back";
} | {
    type: "forward";
};
/**
 * @internal
 */
export declare function reduceNavigationStateForAction(state: NavigationState, action: NavigationAction): NavigationState | undefined;
export {};
//# sourceMappingURL=reduceNavigationStateForAction.d.ts.map