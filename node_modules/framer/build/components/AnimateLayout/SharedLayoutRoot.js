import * as React from "react";
/**
 * @internal
 */
export const TREE_ROOT_ID = "__LAYOUT_TREE_ROOT";
/**
 * @internal
 */
export const SharedLayoutContext = React.createContext({
    schedulePromoteTree: () => { },
    scheduleProjectionDidUpdate: () => { },
    initLead: () => { },
});
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
export class SharedLayoutRoot extends React.Component {
    shouldAnimate = false;
    transition;
    lead;
    follow;
    scheduledPromotion = false;
    scheduledDidUpdate = false;
    // Runs after all descendent SharedLayoutTree finish taking snapshots in
    // their getSnapshotBeforeUpdate lifecycle method.
    getSnapshotBeforeUpdate() {
        if (!this.scheduledPromotion || !this.lead || !this.follow)
            return null;
        const needsReset = !!this.lead?.layoutMaybeMutated && !this.shouldAnimate;
        this.lead.projectionNodes.forEach((projectionNode) => {
            projectionNode?.promote({
                needsReset,
                transition: this.shouldAnimate ? this.transition : undefined,
                preserveFollowOpacity: projectionNode.options.layoutId === TREE_ROOT_ID && !this.follow?.isExiting,
            });
        });
        if (this.shouldAnimate) {
            // The follow tree is going to be mutated by Magic Motion. If next
            // time it is promoted with an instant transition, we promote it
            // with needsReset to reset it to its identical layout.
            this.follow.layoutMaybeMutated = true;
        }
        else {
            // When promoting a tree with an instant transition we block the React
            // update in SharedLayoutTree, so here we schedule a didUpdate manually
            // on the projection tree root so we can perform cleanup & unblock the
            // next layout update.
            this.scheduleProjectionDidUpdate();
        }
        this.lead.layoutMaybeMutated = false;
        this.transition = undefined;
        this.scheduledPromotion = false;
        return null;
    }
    componentDidUpdate() {
        if (!this.lead)
            return null;
        if (this.scheduledDidUpdate) {
            // Manually trigger a didUpdate once on the projection tree root
            this.lead.rootProjectionNode?.root?.didUpdate();
            this.scheduledDidUpdate = false;
        }
    }
    scheduleProjectionDidUpdate = () => {
        this.scheduledDidUpdate = true;
    };
    // schedule a promotion to run later in getSnapshotBeforeUpdate
    schedulePromoteTree = (tree, transition, shouldAnimate) => {
        this.follow = this.lead;
        this.shouldAnimate = shouldAnimate;
        this.lead = tree;
        this.transition = transition;
        this.scheduledPromotion = true;
    };
    initLead = (tree, shouldAnimate) => {
        this.follow = this.lead;
        this.lead = tree;
        if (this.follow && shouldAnimate) {
            this.follow.layoutMaybeMutated = true;
        }
    };
    sharedLayoutContext = {
        schedulePromoteTree: this.schedulePromoteTree,
        scheduleProjectionDidUpdate: this.scheduleProjectionDidUpdate,
        initLead: this.initLead,
    };
    render() {
        return (React.createElement(SharedLayoutContext.Provider, { value: this.sharedLayoutContext }, this.props.children));
    }
}
//# sourceMappingURL=SharedLayoutRoot.js.map