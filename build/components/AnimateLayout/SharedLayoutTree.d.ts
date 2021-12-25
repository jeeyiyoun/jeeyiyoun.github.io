import * as React from "react";
import { SwitchLayoutGroupContext as SwitchLayoutGroupContextType, IProjectionNode } from "framer-motion";
import { SharedLayoutContextProps } from "./SharedLayoutRoot.js";
/**
 * @internal
 */
export interface LayoutTreeProps {
    /**
     * Mark the tree as being the lead tree. The lead tree in the NavigationStack will perform a
     * shared layout animation if `animatesLayout` is true.
     */
    isLead?: boolean;
    /**
     * Mark the tree as being removed.
     * For example if the parent NavigationContainer is being removed, or is simulating removal.
     */
    isExiting?: boolean;
    /**
     * If there is an overlay visible.
     */
    isOverlayed?: boolean;
    /**
     * If performing a layout animation, use this transition.
     */
    transition?: any;
    /**
     * Should updating `isLead` to `true` trigger a shared layout animation.
     */
    animatesLayout?: boolean;
    children?: React.ReactNode;
    id?: string;
}
interface ContextLayoutTreeProps extends LayoutTreeProps {
    sharedLayoutContext: SharedLayoutContextProps;
}
/**
 * @internal
 */
export declare class LayoutTree extends React.Component<ContextLayoutTreeProps> {
    /**
     * SharedLayoutTrees need to reset the projections styles previously applied
     * on their boxes if they are becoming lead but not animating.
     */
    layoutMaybeMutated: boolean;
    /**
     * A list of projection nodes in the tree
     */
    projectionNodes: Map<string, IProjectionNode<unknown>>;
    /**
     * The projection node with the smallest depth in the tree's children.
     */
    rootProjectionNode?: IProjectionNode;
    /**
     * When a tree is tagged as being removed, either by usePresence, or by
     * Navigation, we set it on `this` in shouldComponentUpdate so that it's
     * accessible by SharedLayoutRoot before the LayoutTree has updated.
     */
    isExiting?: boolean;
    componentDidMount(): void;
    shouldComponentUpdate(nextProps: ContextLayoutTreeProps): boolean;
    shouldPreserveFollowOpacity: (child: IProjectionNode) => boolean;
    switchLayoutGroupContext: SwitchLayoutGroupContextType;
    addChild(child: IProjectionNode): void;
    /**
     * As children are added, make sure that `this.rootProjectionNode` is always the
     * child with the smallest depth.
     */
    setRootChild(child: IProjectionNode): IProjectionNode<unknown> | undefined;
    removeChild(child: IProjectionNode): void;
    render(): JSX.Element;
}
export declare const SharedLayoutTree: (props: LayoutTreeProps) => JSX.Element;
export {};
//# sourceMappingURL=SharedLayoutTree.d.ts.map