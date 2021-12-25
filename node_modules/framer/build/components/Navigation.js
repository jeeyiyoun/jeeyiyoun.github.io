import * as React from "react";
import { AnimatePresence, useInstantLayoutTransition, useResetProjection } from "framer-motion";
import { FrameWithMotion } from "../render/presentation/Frame/FrameWithMotion.js";
import { TransitionDefaults, pushTransition, overlayTransition, flipTransition, } from "./NavigationTransitions.js";
import { NavigationContainer } from "./NavigationContainer.js";
import { isReactChild, isReactElement } from "../utils/type-guards.js";
import { injectComponentCSSRules } from "../render/utils/injectComponentCSSRules.js";
import { LayoutIdProvider } from "./AnimateLayout/LayoutIdContext.js";
import { defaultState, reduceNavigationStateForAction, isPartialHistoryItem, } from "./reduceNavigationStateForAction.js";
import { isObject } from "../utils/utils.js";
import { SharedLayoutRoot } from "./AnimateLayout/SharedLayoutRoot.js";
import { MagicMotionCrossfadeRoot } from "./MagicMotionCrossfadeRoot.js";
import { isLazyComponentType } from "../modules/useNavigate.js";
import { NavigationContext } from "./NavigationContext.js";
/**
 * Provides {@link NavigationInterface} that can be used to start transitions in Framer.
 * @public
 */
export const NavigationConsumer = NavigationContext.Consumer;
const NavigationCallbackContext = React.createContext(undefined);
/**
 * @internal
 */
export const NavigationCallbackProvider = NavigationCallbackContext.Provider;
/**
 * @internal
 */
export const IsInitialNavigationContext = React.createContext(undefined);
const OptionalAnimatePresence = ({ enabled, children }) => {
    if (enabled)
        return React.createElement(AnimatePresence, { presenceAffectsLayout: false }, children);
    return React.createElement(React.Fragment, null, children);
};
/**
 * @internal export for testing only
 */
class Navigation extends React.Component {
    lastEventTimeStamp = null;
    state = defaultState();
    static defaultProps = {
        enabled: true,
        withOverflowScrolling: false,
    };
    static contextType = NavigationCallbackContext;
    constructor(props) {
        super(props);
        const component = this.props.children;
        if (!component || !isReactChild(component) || !isReactElement(component))
            return;
        const transition = { ...TransitionDefaults.Instant };
        const key = component.key?.toString() || `stack-${this.state.historyItemId + 1}`;
        const action = { type: "add", key, transition, component };
        const newState = reduceNavigationStateForAction(this.state, action);
        if (!newState)
            return;
        this.state = newState;
    }
    componentDidMount() {
        injectComponentCSSRules();
        const historyItem = this.state.history[this.state.current];
        this.context?.(historyItem.key);
        if (historyItem.title)
            document.title = historyItem.title;
        window.addEventListener("popstate", this.handlePopState.bind(this));
    }
    handlePopState(event) {
        if (this.state.history.length <= 1)
            return;
        if (!isPartialHistoryItem(event.state))
            return;
        const { key } = event.state;
        // If the target screen exists as an already mounted screen, allow
        // navigating forwards or backwards to it. Otherwise allow the browser
        // to execute it's normal pop state behavior.
        if (key && this.state.containers[key]) {
            const previousHistoryItem = this.state.history[this.state.current - 1];
            const nextHistoryItem = this.state.history[this.state.current + 1];
            if (previousHistoryItem?.key === key) {
                this.popState("back");
            }
            else if (nextHistoryItem?.key === key) {
                this.popState("forward");
            }
            event.preventDefault();
        }
    }
    UNSAFE_componentWillReceiveProps(props) {
        const component = props["children"];
        if (!isReactChild(component) || !isReactElement(component))
            return;
        const key = component.key?.toString();
        if (!key)
            return;
        if (this.state.history.length === 0) {
            this.transition(component, TransitionDefaults.Instant);
        }
        else {
            this.navigationAction({ type: "update", key, component });
        }
    }
    componentWillUnmount() {
        this.props.resetProjection?.();
        window.removeEventListener("popstate", this.handlePopState.bind(this));
    }
    getStackState(options) {
        const { current, previous, currentOverlay, previousOverlay } = this.state;
        if (options.overCurrentContext) {
            return {
                current: currentOverlay,
                previous: previousOverlay,
                history: this.state.overlayStack,
            };
        }
        return {
            current,
            previous,
            history: this.state.history,
        };
    }
    /**
     * To prevent bubbling events from triggering multiple transitions,
     * we ensure that the current event has a different timestamp then the event that triggered the last transition.
     * We use Window.event to ensure that even transitions invoked by code components - and may not pass a reference to the event - are caught.
     * This works better than measuring the time of transition calls with performance.now()
     * because the time between calls can get longer and longer as more screens are added to the stack,
     * preventing a deterministic time between transitions to be used to determine if they were triggered at the same time or not.
     */
    isSameEventTransition() {
        // If for some reason window.event is undefined, don't block transitions.
        if (!globalThis.event)
            return false;
        return this.lastEventTimeStamp === globalThis.event.timeStamp;
    }
    navigationAction = (action) => {
        // If Navigation is disabled and this is not the first navigation event, ignore the action
        if (!this.props.enabled && this.state.history.length > 0)
            return;
        const newState = reduceNavigationStateForAction(this.state, action);
        if (!newState)
            return;
        // Block layout animation in motion when using non-magic-motion transitions.
        // We trigger the transition as a callback to ensure the blocking happens first.
        const { skipLayoutAnimation } = this.props;
        const historyItem = newState.history[newState.current];
        // Since the "lead" always determines which layers can animate,
        // and when a "transition back" is performed the "lead" is the new current container,
        // we need to ensure that calculations are performed by the new current container
        // as if it was being transitioned to with magic motion.
        // Since this.state.previousTransition is null unless we are animating a magic motion removal,
        // this is a safe way to infer this case.
        const withMagicMotion = (action.type === "add" && action.transition.withMagicMotion) ||
            (action.type === "forward" && historyItem.transition.withMagicMotion) ||
            (action.type === "remove" && !!newState.previousTransition);
        const updateState = () => {
            this.setState(newState);
            this.context?.(historyItem.key);
            // Don't push state when going back or adding overlays.
            if (historyItem.path && action.type === "add") {
                try {
                    window.history.pushState({ key: historyItem.key }, historyItem.title ?? "Framer", historyItem.path);
                }
                catch {
                    // pushState can throw on null origins, e.g., when browsing
                    // an exported prototype on file://, or in sandboxed iframes
                }
            }
            if (historyItem.title)
                document.title = historyItem.title;
        };
        if (skipLayoutAnimation && !withMagicMotion) {
            skipLayoutAnimation(updateState);
        }
        else {
            updateState();
        }
    };
    transition(component, transitionTraits, transitionOptions, route) {
        if (this.isSameEventTransition())
            return;
        this.lastEventTimeStamp = globalThis.event?.timeStamp || null;
        if (!component || !isReactChild(component) || !isReactElement(component))
            return;
        const transition = { ...transitionTraits, ...transitionOptions };
        const overCurrentContext = !!transition.overCurrentContext;
        if (overCurrentContext)
            return this.navigationAction({ type: "addOverlay", transition, component });
        // If for some reason Navigation is being used in code, and a component instance isn't supplied,
        // generate a unique key to ensure the screen is added.
        const key = component.key?.toString() || `stack-${this.state.historyItemId + 1}`;
        this.navigationAction({ type: "add", key, transition, component, route });
    }
    goBack = () => {
        if (this.isSameEventTransition())
            return;
        this.lastEventTimeStamp = globalThis.event?.timeStamp || null;
        if (this.state.currentOverlay !== -1)
            return this.navigationAction({ type: "removeOverlay" });
        return this.navigationAction({ type: "remove" });
    };
    popState = (direction) => {
        if (this.isSameEventTransition())
            return;
        this.lastEventTimeStamp = globalThis.event?.timeStamp || null;
        if (this.state.currentOverlay !== -1)
            return this.navigationAction({ type: "removeOverlay" });
        return this.navigationAction({ type: direction });
    };
    instant(component, route) {
        this.transition(component, TransitionDefaults.Instant, undefined, route);
    }
    fade(component, options, route) {
        this.transition(component, TransitionDefaults.Fade, options, route);
    }
    push(component, options, route) {
        this.transition(component, pushTransition(options), options, route);
    }
    modal(component, options) {
        this.transition(component, TransitionDefaults.Modal, options);
    }
    overlay(component, options) {
        this.transition(component, overlayTransition(options), options);
    }
    flip(component, options, route) {
        this.transition(component, flipTransition(options), options, route);
    }
    magicMotion(component, options, route) {
        this.transition(component, TransitionDefaults.MagicMotion, options, route);
    }
    customTransition(component, transition) {
        this.transition(component, transition);
    }
    render() {
        const stackState = this.getStackState({ overCurrentContext: false });
        const overlayStackState = this.getStackState({ overCurrentContext: true });
        const activeOverlay = activeOverlayItem(overlayStackState);
        const isOverlayVisible = overlayStackState.current > -1;
        // Describes whether this is the first render of Navigation and its
        // initial content. Mostly useful for dealing with SSR and hydration,
        // which is why it's also accessible via IsInitialNavigationContext.
        //
        // We implement this as a history.length check, as it should only ever
        // be 1 right after mount, since back transitions don't pop the history
        // stack.
        //
        // It is expected to only ever change once, from `true` to `false`, on
        // the first transition after mount. This is important to make sure that
        // anything using the IsInitialNavigationContext doesn't unnecessarily
        // re-render.
        const isInitial = this.state.history.length === 1;
        const contentContainers = Object.keys(this.state.containers).map(key => {
            const component = this.state.containers[key];
            const index = this.state.containerIndex[key];
            const visualIndex = this.state.containerVisualIndex[key];
            const removed = this.state.containerIsRemoved[key];
            const historyItem = this.state.history[index];
            const transitionProps = this.state.transitionForContainer[key];
            const isCurrent = index === this.state.current;
            // This prevents screens that aren't the current target from
            // rendering. This allows navigation to work more like a website or
            // react router, where only the current page is ever rendered.
            // However, this breaks many assumptions made elsewhere in
            // Navigation, the navigation state reducer, and
            // NavigationContainer, and likely will result all transition types
            // other than instant not performing as expected.
            //
            // Rather than try to refactor Navigation to support both use cases,
            // we should write a new Router component to support web-focused
            // navigation, and leave behind the complexity of the this
            // prototype-specific Navigation.
            //
            // In the meantime, this allows us to validate the product without
            // committing to writing a new router before we know what we need to
            // support.
            if (this.props.__asExperimentalRouter && !isCurrent) {
                return null;
            }
            const isPrevious = index === this.state.previous;
            const areMagicMotionLayersPresent = isCurrent ? false : removed;
            // Since the "lead" always determines which layers can animate, and
            // when a "transition back" is performed the "lead" is the new
            // current container, we need to ensure that calculations are
            // performed by the new current container as if it was being
            // transitioned to with magic motion.
            //
            // Since this.state.previousTransition is null unless we are
            // animating a magic motion removal, this is a safe way to infer
            // this case.
            const withMagicMotion = historyItem?.transition?.withMagicMotion || (isCurrent && !!this.state.previousTransition);
            return (React.createElement(NavigationContainer, { key: key, id: key, index: visualIndex, isInitial: isInitial, isCurrent: isCurrent, isPrevious: isPrevious, isOverlayed: isOverlayVisible, visible: isCurrent || isPrevious, position: historyItem?.transition?.position, instant: this.props.__asExperimentalRouter ? true : isInstantContainerTransition(index, stackState), transitionProps: transitionProps, animation: animationPropsForContainer(index, stackState), backfaceVisible: getBackfaceVisibleForScreen(index, stackState), exitAnimation: historyItem?.transition?.animation, exitBackfaceVisible: historyItem?.transition?.backfaceVisible, exitProps: historyItem?.transition?.enter, withMagicMotion: withMagicMotion, areMagicMotionLayersPresent: areMagicMotionLayersPresent ? false : undefined, withOverflowScrolling: this.props.withOverflowScrolling },
                React.createElement(MagicMotionCrossfadeRoot, null, containerContent({
                    component,
                    transition: historyItem?.transition,
                    withOverflowScrolling: this.props.withOverflowScrolling,
                }))));
        });
        const overlayContainers = this.state.overlayStack.map((item, stackIndex) => {
            return (React.createElement(NavigationContainer, { isLayeredContainer: true, key: item.key, isCurrent: stackIndex === this.state.currentOverlay, position: item.transition.position, initialProps: initialPropsForOverlay(stackIndex, overlayStackState), transitionProps: transitionPropsForOverlay(stackIndex, overlayStackState), instant: isInstantContainerTransition(stackIndex, overlayStackState, true), animation: animationPropsForContainer(stackIndex, overlayStackState), exitProps: item.transition.enter, visible: containerIsVisible(stackIndex, overlayStackState), backdropColor: backdropColorForTransition(item.transition), backfaceVisible: getBackfaceVisibleForOverlay(stackIndex, overlayStackState), onTapBackdrop: backdropTapAction(item.transition, this.goBack), index: this.state.current + 1 + stackIndex, withOverflowScrolling: this.props.withOverflowScrolling }, containerContent({
                component: item.component,
                transition: item.transition,
                withOverflowScrolling: this.props.withOverflowScrolling,
            })));
        });
        return (React.createElement(FrameWithMotion, { top: 0, left: 0, width: "100%", height: "100%", position: "relative", style: { overflow: "hidden", backgroundColor: "unset", ...this.props.style } },
            React.createElement(NavigationContext.Provider, { value: this },
                React.createElement(IsInitialNavigationContext.Provider, { value: isInitial },
                    React.createElement(NavigationContainer, { isLayeredContainer: true, position: undefined, initialProps: {}, instant: false, transitionProps: transitionPropsForStackWrapper(activeOverlay), animation: animationForStackWrapper(activeOverlay), backfaceVisible: backfaceVisibleForStackWrapper(activeOverlay), visible: true, backdropColor: undefined, onTapBackdrop: undefined, index: 0 },
                        React.createElement(LayoutIdProvider, null,
                            React.createElement(SharedLayoutRoot, null,
                                React.createElement(OptionalAnimatePresence, { enabled: !this.props.__asExperimentalRouter }, contentContainers)))),
                    React.createElement(AnimatePresence, null, overlayContainers)))));
    }
}
const animationDefault = {
    stiffness: 500,
    damping: 50,
    restDelta: 1,
    type: "spring",
};
function activeOverlayItem(overlayStack) {
    let currentOverlayItem;
    let previousOverlayItem;
    if (overlayStack.current !== -1) {
        currentOverlayItem = overlayStack.history[overlayStack.current];
    }
    else {
        previousOverlayItem = overlayStack.history[overlayStack.previous];
    }
    return { currentOverlayItem, previousOverlayItem };
}
function transitionPropsForStackWrapper({ currentOverlayItem }) {
    return currentOverlayItem && currentOverlayItem.transition.exit;
}
function animationForStackWrapper({ currentOverlayItem, previousOverlayItem }) {
    if (currentOverlayItem && currentOverlayItem.transition.animation) {
        return currentOverlayItem.transition.animation;
    }
    if (previousOverlayItem && previousOverlayItem.transition.animation) {
        return previousOverlayItem.transition.animation;
    }
    return animationDefault;
}
function backfaceVisibleForStackWrapper({ currentOverlayItem, previousOverlayItem }) {
    if (currentOverlayItem)
        return currentOverlayItem.transition.backfaceVisible;
    return previousOverlayItem && previousOverlayItem.transition.backfaceVisible;
}
function backdropColorForTransition(transition) {
    if (transition.backdropColor)
        return transition.backdropColor;
    if (transition.overCurrentContext)
        return "rgba(4,4,15,.4)"; // iOS dim color
    return undefined;
}
function getBackfaceVisibleForOverlay(containerIndex, stackState) {
    const { current, history } = stackState;
    if (containerIndex === current) {
        // current
        const navigationItem = history[containerIndex];
        if (navigationItem && navigationItem.transition) {
            return navigationItem.transition.backfaceVisible;
        }
        return true;
    }
    else if (containerIndex < current) {
        // old
        const navigationItem = history[containerIndex + 1];
        if (navigationItem && navigationItem.transition) {
            return navigationItem.transition.backfaceVisible;
        }
        return true;
    }
    else {
        // future
        const navigationItem = history[containerIndex];
        if (navigationItem && navigationItem.transition) {
            return navigationItem.transition.backfaceVisible;
        }
        return true;
    }
}
function initialPropsForOverlay(containerIndex, stackState) {
    const navigationItem = stackState.history[containerIndex];
    if (navigationItem)
        return navigationItem.transition.enter;
}
function getBackfaceVisibleForScreen(screenIndex, stackState) {
    const { current, previous, history } = stackState;
    // Entering going backwards || exiting going forward
    if ((screenIndex === previous && current > previous) || (screenIndex === current && current < previous)) {
        return history[screenIndex + 1]?.transition?.backfaceVisible;
    }
    // Entering going forward, exiting going backwards, or all other screens.
    return history[screenIndex]?.transition?.backfaceVisible;
}
function transitionPropsForOverlay(overlayIndex, stackState) {
    const { current, history } = stackState;
    if (overlayIndex === current) {
        // current
        return;
    }
    else if (overlayIndex < current) {
        // old
        const navigationItem = history[overlayIndex + 1];
        if (navigationItem && navigationItem.transition) {
            return navigationItem.transition.exit;
        }
    }
    else {
        // future
        const navigationItem = history[overlayIndex];
        if (navigationItem && navigationItem.transition) {
            return navigationItem.transition.enter;
        }
    }
}
function animationPropsForContainer(containerIndex, stackState) {
    const { current, previous, history } = stackState;
    const containerCurrent = previous > current ? previous : current;
    if (containerIndex < containerCurrent) {
        // old
        const navigationItem = history[containerIndex + 1];
        if (navigationItem && navigationItem.transition.animation) {
            return navigationItem.transition.animation;
        }
    }
    else if (containerIndex !== containerCurrent) {
        // future
        const navigationItem = history[containerIndex];
        if (navigationItem && navigationItem.transition.animation) {
            return navigationItem.transition.animation;
        }
    }
    else {
        // current
        const navigationItem = history[containerIndex];
        if (navigationItem.transition.animation) {
            return navigationItem.transition.animation;
        }
    }
    return animationDefault;
}
function isInstantContainerTransition(containerIndex, stackState, overCurrentContext) {
    const { current, previous, history } = stackState;
    if (overCurrentContext && history.length > 1)
        return true;
    if (containerIndex !== previous && containerIndex !== current)
        return true;
    if (current === previous)
        return true;
    return false;
}
function containerIsVisible(containerIndex, stackState) {
    const { current, previous } = stackState;
    if (containerIndex > current && containerIndex > previous)
        return false;
    if (containerIndex === current)
        return true;
    return false;
}
function containerContent(item) {
    const content = React.Children.map(item.component, (child) => {
        if (!isReactChild(child) || !isReactElement(child) || !child.props) {
            return child;
        }
        const props = {
            style: child.props.style ?? {},
        };
        const position = item?.transition?.position;
        const shouldStretchWidth = !position || (position.left !== undefined && position.right !== undefined);
        const shouldStretchHeight = !position || (position.top !== undefined && position.bottom !== undefined);
        const canStretchStyle = "style" in child.props ? isObject(child.props.style) : true;
        if (shouldStretchWidth) {
            const canStretchWidth = "width" in child.props;
            if (canStretchWidth)
                props.width = "100%";
            if (canStretchStyle)
                props.style.width = "100%";
        }
        if (shouldStretchHeight) {
            const canStretchHeight = "height" in child.props;
            // To support the overflow scrolling experiment, we force height to be
            // minHeight, instead of height. This ensure that the content is at least the
            // height of the viewport, but will scroll vertically if the content is larger
            // than the viewport.
            if (item.withOverflowScrolling) {
                if (canStretchHeight)
                    props.minHeight = "100%";
                if (canStretchStyle)
                    props.style.minHeight = "100%";
            }
            else {
                if (canStretchHeight)
                    props.height = "100%";
                if (canStretchStyle)
                    props.style.height = "100%";
            }
        }
        return React.cloneElement(child, props);
    });
    // Try not to use Suspense if we don't need to, to be SSR friendly.
    if (content && content.some(element => isLazyComponentType(element.type))) {
        return React.createElement(React.Suspense, { fallback: null }, content);
    }
    else {
        return content;
    }
}
function backdropTapAction(transition, goBackAction) {
    if (transition.goBackOnTapOutside !== false)
        return goBackAction;
}
/**
 * @internal
 */
const NavigationWrapper = props => {
    const resetProjection = useResetProjection();
    const skipLayoutAnimation = useInstantLayoutTransition();
    return (React.createElement(Navigation, { ...props, resetProjection: resetProjection, skipLayoutAnimation: skipLayoutAnimation }, props.children));
};
export { Navigation as NavigationClass };
export { NavigationWrapper as Navigation };
//# sourceMappingURL=Navigation.js.map