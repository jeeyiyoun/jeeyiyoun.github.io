import * as React from "react";
import { motion } from "framer-motion";
import { TREE_ROOT_ID } from "./AnimateLayout/SharedLayoutRoot.js";
const rootStyles = {
    width: "100%",
    height: "100%",
    backgroundColor: "none",
    pointerEvents: "none",
};
/**
 * @internal
 * When performing a magic motion transition, if the two ground frames don't
 * have matching layoutId, we still want the roots to cross-fade into each other.
 * To implement this, we wrap the content of a navigation screen in a root
 * component that's using a constant layoutId.
 */
export const MagicMotionCrossfadeRoot = props => {
    return (React.createElement(motion.div, { layoutId: TREE_ROOT_ID, style: rootStyles }, props.children));
};
//# sourceMappingURL=MagicMotionCrossfadeRoot.js.map