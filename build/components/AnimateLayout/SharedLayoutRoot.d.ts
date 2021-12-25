import * as React from "react";
import type { Transition } from "framer-motion";
import type { LayoutTree } from "./SharedLayoutTree.js";
/**
 * @internal
 */
export declare const TREE_ROOT_ID = "__LAYOUT_TREE_ROOT";
/**
 * @internal
 */
export interface SharedLayoutContextProps {
    schedulePromoteTree: (tree: LayoutTree, transition: Transition, shouldAnimate: boolean) => void;
    scheduleProjectionDidUpdate: () => void;
    initLead: (tree: LayoutTree, shouldAnimate: boolean) => void;
}
/**
 * @internal
 */
export declare const SharedLayoutContext: React.Context<SharedLayoutContextProps>;
/**
 * @internal
 * Orchestrates the promotion of the descendent SharedLayoutTrees:
 * 1. When a LayoutTree mounts as a lead, it will call `initLead` to set itself
 * as the current lead without scheduling a promotion (nodes are promoted on
 * mount automatically in Motion).
 *
 * 2. When a LayoutTree becomes the lead tree, it schedules a promotion in its
 * shouldComponentUpdate lifecycle method. SharedLayoutRoot will kickoff the
 * promotion in its getSnapshotBeforeUpdate lifecycle method, when all of its
 * descendent SharedLayoutTrees finish taking snapshots.
 *
 * 3. When a LayoutTree becomes the lead tree using an non-magic-motion
 * transition, we block its React render. SharedLayoutRoot will also schedule a
 * manual projection tree update to run later in its componentDidUpdate method
 * so that we could perform cleanups correctly.
 */
export declare class SharedLayoutRoot extends React.Component {
    private shouldAnimate;
    private transition;
    private lead;
    private follow;
    private scheduledPromotion;
    private scheduledDidUpdate;
    getSnapshotBeforeUpdate(): null;
    componentDidUpdate(): null | undefined;
    scheduleProjectionDidUpdate: () => void;
    schedulePromoteTree: (tree: LayoutTree, transition: Transition, shouldAnimate: boolean) => void;
    initLead: (tree: LayoutTree, shouldAnimate: boolean) => void;
    sharedLayoutContext: {
        schedulePromoteTree: (tree: LayoutTree, transition: Transition, shouldAnimate: boolean) => void;
        scheduleProjectionDidUpdate: () => void;
        initLead: (tree: LayoutTree, shouldAnimate: boolean) => void;
    };
    render(): JSX.Element;
}
//# sourceMappingURL=SharedLayoutRoot.d.ts.map