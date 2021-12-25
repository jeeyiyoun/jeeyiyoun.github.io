import { allAnimatableProperties } from "./NavigationContainer.js";
import { isObject, isString } from "../utils/utils.js";
export const defaultState = () => ({
    current: -1,
    previous: -1,
    currentOverlay: -1,
    previousOverlay: -1,
    visualIndex: 0,
    overlayItemId: 0,
    historyItemId: 0,
    history: [],
    overlayStack: [],
    containers: {},
    containerIndex: {},
    containerVisualIndex: {},
    containerIsRemoved: {},
    transitionForContainer: {},
    previousTransition: null,
});
/**
 * @internal
 */
export function isPartialHistoryItem(item) {
    return !!item && isObject(item) && isString(item.key);
}
/**
 * @internal
 */
export function reduceNavigationStateForAction(state, action) {
    switch (action.type) {
        case "addOverlay":
            return addOverlay(state, action.transition, action.component);
        case "removeOverlay":
            return removeOverlay(state);
        case "add":
            return add(state, action.key, action.transition, action.component, action.route);
        case "remove":
            return remove(state);
        case "update":
            return updateComponent(state, action.key, action.component);
        case "back":
            return back(state);
        case "forward":
            return forward(state);
        default:
            return;
    }
}
function updateComponent(currentState, key, component) {
    return {
        ...currentState,
        containers: {
            ...currentState.containers,
            [key]: component,
        },
    };
}
/**
 * Add a new navigation target as an overlay.
 */
function addOverlay(currentState, transition, component) {
    const currentOverlay = currentState.overlayStack[currentState.currentOverlay];
    if (currentOverlay && currentOverlay.component === component)
        return;
    const overlayItemId = currentState.overlayItemId + 1;
    const overlayStack = [
        ...currentState.overlayStack,
        {
            key: `stack-${overlayItemId}`,
            component,
            transition,
        },
    ];
    return {
        ...currentState,
        overlayStack,
        overlayItemId,
        currentOverlay: Math.max(0, Math.min(currentState.currentOverlay + 1, overlayStack.length - 1)),
        previousOverlay: currentState.currentOverlay,
    };
}
/**
 * Dismiss all overlays.
 */
function removeOverlay(currentState) {
    return {
        ...currentState,
        overlayStack: [],
        currentOverlay: -1,
        previousOverlay: currentState.currentOverlay,
    };
}
/** Navigate to a new or existing navigation target with an animated transition. */
function add(currentState, key, transition, component, route) {
    if (!currentState.containers[key])
        currentState.containers[key] = component;
    // Restart history from current, erasing navigations that we have "gone back" from.
    // It's ok to mutate currentState because we always return a copy so there is no risk of mutations between actions.
    currentState.history = currentState.history.slice(0, currentState.current + 1);
    currentState.visualIndex = Math.max(currentState.history.length, 0);
    const currentItem = currentState.history[currentState.history.length - 1];
    const isCurrentScreen = currentItem && currentItem.key === key;
    // In the rare case where a navigation from an overlay, to the screen under the overlay is triggered,
    // just dismiss the overlay.
    currentState.overlayStack = [];
    if (isCurrentScreen && currentState.currentOverlay > -1) {
        return {
            ...currentState,
            currentOverlay: -1,
            previousOverlay: currentState.currentOverlay,
        };
    }
    // Don't push the same screen twice.
    if (isCurrentScreen)
        return;
    // Calculate whether magic motion transitions should appear as if they are navigating backwards.
    const shouldMoveForward = currentItem?.key && transition.withMagicMotion
        ? isNextTargetForward(key, currentState.containerVisualIndex[key], currentState.containerIsRemoved[key], currentState.history)
        : true;
    currentState.history.push({
        key,
        transition,
        visualIndex: shouldMoveForward ? Math.max(currentState.visualIndex, 0) : currentState.containerVisualIndex[key],
        ...route,
    });
    const current = currentState.current + 1;
    const previous = currentState.current;
    // If we've gone backwards through history, but are now navigating forwards again,
    // we need to ensure that there are no clashing indexes from previous forward navigations
    // stored in the `containerIndex` record by setting clashes to their most recent history index.
    for (const containerKey in currentState.containerIndex) {
        if (currentState.containerIndex[containerKey] === current) {
            currentState.containerIndex[containerKey] = findLatestHistoryIndex(containerKey, currentState.history);
        }
    }
    currentState.containerIndex[key] = current;
    const { containerVisualIndex, containerIsRemoved } = magicMotionPropsForAdd(currentState, key, currentItem?.key, shouldMoveForward);
    const transitionForContainer = updateTransitions(current, previous, currentState.history, currentState.containerIndex, currentState.transitionForContainer);
    return {
        ...currentState,
        current,
        previous,
        containerVisualIndex,
        containerIsRemoved,
        transitionForContainer,
        previousTransition: null,
        currentOverlay: -1,
        historyItemId: currentState.historyItemId + 1,
        previousOverlay: currentState.currentOverlay,
    };
}
/**
 * @FIXME -- This simple function supports browser back by not removing pages.
 * This allows subsequent forward actions to navigate to an already mounted
 * component. This may have unintended effects when interacting with magic
 * motion however. Since magic motion between framer web pages will have dubious
 * value, this hasn't been implemented.
 */
function back(currentState) {
    const containers = { ...currentState.containers };
    const nextState = remove(currentState);
    if (!nextState)
        return;
    nextState.containers = containers;
    return nextState;
}
function forward(currentState) {
    const { key, transition, component, visualIndex, ...route } = currentState.history[currentState.current + 1];
    const history = [...currentState.history];
    const nextState = add(currentState, key, transition, component, route);
    if (!nextState)
        return;
    nextState.history = history;
    return nextState;
}
/**
 * Navigate away from the screen that was most recently navigated to, to the previous screen.
 * Animations will play in reverse.
 */
function remove(currentState) {
    const history = [...currentState.history.slice(0, currentState.current + 1)];
    // Don't remove the last component.
    if (history.length === 1)
        return;
    const currentItem = history.pop();
    if (!currentItem)
        return;
    const target = history[history.length - 1];
    // Ensure the target container is updated to be layered under the current container.
    // If it has been previously navigated away from, it will need to be updated.
    // It's ok to mutate currentState because we always return a copy so there is no risk of mutations between actions.
    currentState.containerIndex[target.key] = history.length - 1;
    const shouldRemoveContainer = history.every(item => item.key !== currentItem.key);
    if (shouldRemoveContainer) {
        // Remove the container from the cache, triggering it's removal from the DOM.
        delete currentState.containers[currentItem.key];
    }
    const current = currentState.current - 1;
    const previous = currentState.current;
    const { containerIsRemoved, containerVisualIndex, previousTransition, visualIndex } = magicMotionPropsForRemove(currentState, target, currentItem);
    const transitionForContainer = updateTransitions(current, previous, currentState.history, currentState.containerIndex, currentState.transitionForContainer);
    return {
        ...currentState,
        current,
        previous,
        containerIsRemoved,
        containerVisualIndex,
        previousTransition,
        visualIndex,
        transitionForContainer,
    };
}
/**
 * When transitioning forwards to an existing container, update navigation state to optimize magic motion sequences.
 * In cases where we are about to navigate to a screen we have already navigated to with a magic motion transition,
 * we optimize the animation experience by simulating a back transition to solve layering issues.
 */
function magicMotionPropsForAdd(currentState, nextKey, currentKey, shouldMoveForward) {
    const update = {
        containerVisualIndex: { ...currentState.containerVisualIndex },
        containerIsRemoved: { ...currentState.containerIsRemoved },
    };
    if (shouldMoveForward) {
        // If we have calculated that the transition should appear to move forward, the default behavior,
        // we update properties on the current and target component to animate it in.
        // Ensuring it's a valid target for measurements, and that it is not removed.
        update.containerVisualIndex[nextKey] = currentState.history.length - 1;
        update.containerIsRemoved[nextKey] = false;
    }
    else {
        // If we have calculated that the transition should appear to move backwards, to optimize for magic motion layering,
        // we need to set all components visited since visiting the target as removed,
        // and also ensure that components visited since visiting the target, that are not the outgoing screen,
        // can not provide bounding boxes when calculating the magic motion transition.
        const nextVisualIndex = currentState.containerVisualIndex[nextKey];
        for (const key in currentState.containerVisualIndex) {
            if (currentState.containerVisualIndex[key] > nextVisualIndex) {
                update.containerIsRemoved[key] = true;
            }
        }
    }
    return update;
}
/**
 * When transitioning back to a previous container, update navigation state to optimize magic motion sequences.
 * In cases where we have navigated forward via magic motion transitions that appear to add and remove screens,
 * while continuing to add to the history, we need to replicate the opposite navigations when transitioning back.
 */
function magicMotionPropsForRemove(currentState, target, currentItem) {
    // Ensure the current and next components are valid magic motion targets.
    const validTargets = [target.key, currentItem.key];
    const nextValidTarget = currentState.history[currentState.history.length - 2];
    const previousTransition = currentState.previousTransition === null ? null : { ...currentState.previousTransition };
    const update = {
        containerIsRemoved: { ...currentState.containerIsRemoved },
        containerVisualIndex: { ...currentState.containerVisualIndex },
        previousTransition,
        visualIndex: currentState.visualIndex,
    };
    // Optionally prepare the next potential screen to as a valid magic motion target,
    // to ensure successive magic motion back transitions are already measured.
    if (nextValidTarget)
        validTargets.push(nextValidTarget.key);
    // Decide if we should appear to remove or add the next component by detecting if it was previously simulated as a backwards transition,
    // based on the differences between it's visual index, and what it's visual index should be if it hadn't been simulated as a backwards transition.
    const shouldRemoveLastKey = currentState.containerVisualIndex[target.key] <= currentState.containerVisualIndex[currentItem.key] ||
        (target.visualIndex !== undefined && target.visualIndex < currentState.history.length - 1);
    const nextIndex = target.visualIndex;
    if (shouldRemoveLastKey) {
        // Set the last key to be removed, and set the next keys visualIndex to what it was set to last time we were at this point in history.
        // This is the normal behaviour when transitioning backwards.
        update.containerIsRemoved[currentItem.key] = true;
        update.containerVisualIndex[target.key] = nextIndex !== undefined ? nextIndex : currentState.history.length - 1;
    }
    else {
        // If we shouldn't remove the last key, we need to simulate a forward transition.
        // We do this by incrementing the visualIndex counter, and update the next items visual index to trigger an animation.
        update.visualIndex = currentState.visualIndex + 1;
        update.containerVisualIndex[target.key] = currentState.visualIndex + 1;
    }
    // If a transition is with magic motion, we save the transition properties to pass to AnimateSharedLayout.
    if (currentItem.transition.withMagicMotion)
        update.previousTransition = currentItem.transition || null;
    // The new current component should never appear to be removed.
    currentState.containerIsRemoved[target.key] = false;
    return update;
}
function findLatestHistoryIndex(key, history) {
    for (let index = history.length; index > history.length; index--) {
        if (history[index].key === key)
            return index;
    }
    return -1;
}
function updateTransitions(current, previous, history, containerIndex, transitionForContainer) {
    // Set or update the transition for a container if it becomes the current or previous screen.
    // We don't update if the container is not the current or previous Screen, to allow running animations to play out.
    const transitions = { ...transitionForContainer };
    Object.keys(containerIndex).forEach(key => {
        const transition = transitionForScreen(containerIndex[key], { current, previous, history });
        if (transition) {
            transitions[key] = transition;
        }
    });
    return transitions;
}
function isNextTargetForward(key, index, removed, history) {
    // If the target layer is currently removed, we always move forward to it.
    if (removed)
        return true;
    // A target layer that is visually 0 indexed will always be the first in the stack.
    if (index === 0)
        return false;
    // Go forward if the next instance of the target is forward from the current visual index.
    const forwardHistory = history.slice(index, history.length);
    if (forwardHistory.findIndex(item => item.key === key) > -1)
        return true;
    // Bo backwards if the next instance is backwards from the current visual index.
    const backwardsHistory = history.slice(0, index - 1);
    if (backwardsHistory.findIndex(item => item.key === key) > -1)
        return false;
    // By default transitions appear to transition forwards.
    return true;
}
function transitionForScreen(screenIndex, stackState) {
    const { current, previous, history } = stackState;
    // If a screen has already exited, or entered and is underneath the stack,
    // don't update it's animation, allowing any current animations to play out.
    if (screenIndex !== current && screenIndex !== previous)
        return undefined;
    // Entering going forward
    if (screenIndex === current && current > previous) {
        const item = history[screenIndex];
        return sequence("enter", item.transition.enter, item.transition.animation);
    }
    // Exiting going forward
    if (screenIndex === previous && current > previous) {
        const item = history[screenIndex + 1];
        return sequence("exit", item.transition.exit, item.transition.animation);
    }
    // Entering going backwards
    if (screenIndex === current && current < previous) {
        const item = history[screenIndex + 1];
        return sequence("enter", item.transition.exit, item.transition.animation);
    }
    // Exiting going backwards
    if (screenIndex === previous && current < previous) {
        const item = history[screenIndex];
        return sequence("exit", item.transition.enter, item.transition.animation);
    }
}
const allAnimatableKeys = Object.keys(allAnimatableProperties);
function sequence(direction, transition, animation) {
    const value = {};
    const from = {};
    // Create an identity animation.
    allAnimatableKeys.forEach(property => {
        value[property] = allAnimatableProperties[property];
        from[property] = {
            ...animation,
            from: allAnimatableProperties[property],
        };
    });
    // If a transition is provided, add the desired transition properties to the identity animation.
    if (transition) {
        Object.keys(transition).forEach(property => {
            if (transition[property] === undefined)
                return;
            const transitionTo = transition[property];
            const transitionFrom = typeof transition[property] === "string"
                ? `${allAnimatableProperties[property]}%`
                : allAnimatableProperties[property];
            value[property] = direction === "enter" ? transitionFrom : transitionTo;
            from[property] = {
                ...animation,
                from: direction === "enter" ? transitionTo : transitionFrom,
                velocity: 0,
            };
        });
    }
    // Always return at least the identity animation.
    return {
        ...value,
        transition: {
            ...from,
        },
    };
}
//# sourceMappingURL=reduceNavigationStateForAction.js.map