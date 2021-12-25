import * as React from "react";
import { SwitchLayoutGroupContext, } from "framer-motion";
import { TREE_ROOT_ID, SharedLayoutContext } from "./SharedLayoutRoot.js";
/**
 * @internal
 */
export class LayoutTree extends React.Component {
    /**
     * SharedLayoutTrees need to reset the projections styles previously applied
     * on their boxes if they are becoming lead but not animating.
     */
    layoutMaybeMutated;
    /**
     * A list of projection nodes in the tree
     */
    projectionNodes = new Map();
    /**
     * The projection node with the smallest depth in the tree's children.
     */
    rootProjectionNode;
    /**
     * When a tree is tagged as being removed, either by usePresence, or by
     * Navigation, we set it on `this` in shouldComponentUpdate so that it's
     * accessible by SharedLayoutRoot before the LayoutTree has updated.
     */
    isExiting;
    componentDidMount() {
        /**
         * Nodes are automatically promoted in Motion when they mount. We need
         * to let SharedLayoutRoot know about the first lead without scheduling
         * a promotion.
         */
        if (this.props.isLead) {
            this.props.sharedLayoutContext.initLead(this, !!this.props.animatesLayout);
        }
    }
    shouldComponentUpdate(nextProps) {
        const { isLead, isExiting, isOverlayed, animatesLayout, transition, sharedLayoutContext } = nextProps;
        this.isExiting = isExiting;
        /**
         * Since Navigation wraps it's child NavigationContainers in a NavigationContainer,
         * we need to ensure that we don't prevent updates if we are not handling layout animations.
         */
        if (isLead === undefined)
            return true;
        const hasBecomeLead = !this.props.isLead && !!isLead;
        const hasExitBeenCancelled = this.props.isExiting && !isExiting;
        const shouldPromote = hasBecomeLead || hasExitBeenCancelled;
        const shouldDemote = !!this.props.isLead && !isLead;
        const overlayChanged = this.props.isOverlayed !== isOverlayed;
        if (shouldPromote || shouldDemote) {
            this.projectionNodes.forEach(projection => projection?.willUpdate());
        }
        if (shouldPromote) {
            sharedLayoutContext.schedulePromoteTree(this, transition, !!animatesLayout);
        }
        else if (overlayChanged) {
            /**
             * When performing an overlay transition, we block the layout update
             * in Motion, but we don't promote the tree since the lead doesn't
             * change. Therefore, we still need to schedule a didUpdate manually
             * to unblock the layout update for the next layout animation.
             */
            sharedLayoutContext.scheduleProjectionDidUpdate();
        }
        return !!shouldPromote && !!animatesLayout;
    }
    shouldPreserveFollowOpacity = (child) => {
        return child.options.layoutId === TREE_ROOT_ID && !this.props.isExiting;
    };
    switchLayoutGroupContext = {
        register: child => this.addChild(child),
        deregister: child => this.removeChild(child),
        // Configs to use for the initial promotion on mount in Motion
        transition: this.props.isLead !== undefined && this.props.animatesLayout ? this.props.transition : undefined,
        shouldPreserveFollowOpacity: this.shouldPreserveFollowOpacity,
    };
    addChild(child) {
        const layoutId = child.options.layoutId;
        if (layoutId) {
            this.projectionNodes.set(layoutId, child);
            this.setRootChild(child);
        }
    }
    /**
     * As children are added, make sure that `this.rootProjectionNode` is always the
     * child with the smallest depth.
     */
    setRootChild(child) {
        if (!this.rootProjectionNode)
            return (this.rootProjectionNode = child);
        this.rootProjectionNode = this.rootProjectionNode.depth < child.depth ? this.rootProjectionNode : child;
    }
    removeChild(child) {
        const layoutId = child.options.layoutId;
        if (layoutId) {
            this.projectionNodes.delete(layoutId);
        }
    }
    render() {
        return (React.createElement(SwitchLayoutGroupContext.Provider, { value: this.switchLayoutGroupContext }, this.props.children));
    }
}
export const SharedLayoutTree = (props) => {
    const sharedLayoutContext = React.useContext(SharedLayoutContext);
    return React.createElement(LayoutTree, { ...props, sharedLayoutContext: sharedLayoutContext });
};
//# sourceMappingURL=SharedLayoutTree.js.map