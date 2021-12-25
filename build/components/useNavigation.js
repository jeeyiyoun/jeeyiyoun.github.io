import { useContext } from "react";
import { NavigationContext } from "./NavigationContext.js";
/**
 * @returns NavigationInterface {@link NavigationInterface}
 * @public
 */
export function useNavigation() {
    return useContext(NavigationContext);
}
//# sourceMappingURL=useNavigation.js.map