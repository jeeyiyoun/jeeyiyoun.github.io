import { createContext, useContext } from "react";
import { isFramerPageLink, parseFramerPageLink } from "../modules/framerPageLink.js";
const NavigationRouteContext = createContext(null);
/**
 * @internal
 */
export const NavigationRouteContextProvider = NavigationRouteContext.Provider;
/**
 * @internal
 */
export function useLinkMatchesRoute(link) {
    const currentRouteId = useContext(NavigationRouteContext);
    if (!currentRouteId)
        return false;
    return isFramerPageLink(link) && parseFramerPageLink(link)?.target === currentRouteId;
}
//# sourceMappingURL=NavigationRouteContext.js.map