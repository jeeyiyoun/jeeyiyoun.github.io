import * as React from "react";
import { isObject, isString } from "../utils/utils.js";
import { useNavigation } from "../components/useNavigation.js";
import { useIsOnFramerCanvas } from "./useIsOnFramerCanvas.js";
/**
 * @internal
 */
export function isLazyComponentType(componentType) {
    return typeof componentType === "object" && "preload" in componentType;
}
/**
 * Enhance React.lazy() with a preload function.
 *
 * @internal
 */
export function lazy(factory) {
    const LazyComponent = React.lazy(factory);
    let factoryPromise;
    let LoadedComponent;
    const Component = React.forwardRef(function LazyWithPreload(props, ref) {
        return React.createElement(LoadedComponent ?? LazyComponent, Object.assign(ref ? { ref } : {}, props));
    });
    Component.preload = () => {
        if (!factoryPromise) {
            factoryPromise = factory().then(module => {
                LoadedComponent = module.default;
                return LoadedComponent;
            });
        }
        return factoryPromise;
    };
    return Component;
}
const key = "page";
/**
 * @internal
 */
export function isRoute(route) {
    return isObject(route) && key in route && route.page !== undefined;
}
/**
 * @public
 */
export const NavigationRoutesContext = React.createContext({});
/**
 * useNavigate supports transitioning to a route by id, or directly to a
 * provided React component. If we are transitioning to a route by id, retrieve
 * the React component from the routes context, and ensure that it is a valid
 * React Element. If it is a lazy import, we need to call React.createElement to
 * ensure it is mountable. The value returned from the router can either be a
 * valid React element, for instance if created with React.createElement or
 * written in JSX, or it can be a React.ComponentType, in which case we have to
 * explicitly call React.CreateElement before returning.
 */
function componentForTarget(target, routerContext) {
    if (isString(target)) {
        const route = routerContext[target];
        if (!isRoute(route))
            return [];
        const { page: routeComponent, ...routeInfo } = route;
        if (!routeComponent)
            return [];
        if (React.isValidElement(routeComponent))
            return [routeComponent, routeInfo];
        return [React.createElement(routeComponent, { key: target }), routeInfo];
    }
    if (!target || !React.isValidElement(target))
        return [];
    return [target];
}
const preloadKey = "preload";
function withPreload(component) {
    return !!component && isObject(component) && preloadKey in component;
}
/**
 * A relative duplicate of useNavigate from runtime to support navigation in
 * combined screens. Additionally supports a preload argument that allows target
 * screens that are lazy imported to be requested before they are navigated to.
 *
 * @internal
 */
export function useNavigate({ preload } = {}) {
    const routerContext = React.useContext(NavigationRoutesContext);
    const navigation = useNavigation();
    const onCanvas = useIsOnFramerCanvas();
    // On mount, attempt to preload future navigation targets. If the target is
    // a route string, first retrieve the component for that route from the
    // routes context.
    React.useEffect(() => {
        if (!navigation || onCanvas)
            return;
        preload?.forEach(componentOrRoute => {
            const component = isString(componentOrRoute)
                ? isRoute(routerContext[componentOrRoute])
                    ? routerContext[componentOrRoute].page
                    : undefined
                : componentOrRoute;
            if (component && withPreload(component))
                component.preload();
        });
    }, []);
    if (!navigation)
        return () => { };
    return (target, options = {}) => {
        if (onCanvas)
            return;
        if (target === "previous") {
            navigation.goBack();
            return false;
        }
        // If we are navigating to a route by an id, retrieve the React
        // component from the routes context, and ensure it is a React element.
        const [Component, routeInfo] = componentForTarget(target, routerContext);
        if (!Component)
            return;
        const { appearsFrom, backdropColor, animation } = options;
        const transitionType = options.transition || "instant";
        switch (transitionType) {
            case "instant":
                navigation.instant(Component, routeInfo);
                break;
            case "fade":
                navigation.fade(Component, { animation }, routeInfo);
                break;
            case "push":
                navigation.push(Component, { appearsFrom, animation }, routeInfo);
                break;
            case "flip":
                navigation.flip(Component, { appearsFrom, animation }, routeInfo);
                break;
            case "magicMotion":
                navigation.magicMotion(Component, { animation }, routeInfo);
                break;
            // Overlay stack navigation doesn't support updating the browser's
            // path.
            case "modal":
                navigation.modal(Component, { backdropColor, animation });
                break;
            case "overlay":
                navigation.overlay(Component, { appearsFrom, backdropColor, animation });
                break;
        }
        // Return false to prevent smart components from proceeding with their event execution.
        return false;
    };
}
//# sourceMappingURL=useNavigate.js.map