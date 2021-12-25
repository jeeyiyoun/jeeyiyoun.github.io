import * as React from "react";
import { forwardRef } from "react";
import { WithEvents } from "../../../components/hoc/WithEvents.js";
import { DeprecatedFrame } from "./DeprecatedFrame.js";
import { FrameWithMotion } from "./FrameWithMotion.js";
import { useParentSize, deprecatedParentSize } from "../../types/NewConstraints.js";
import { isDeprecatedFrameProps } from "./isDeprecatedFrameProps.js";
export { isDeprecatedFrameProps } from "./isDeprecatedFrameProps.js";
// Re-exports
export { DeprecatedFrame } from "./DeprecatedFrame.js";
export { FrameWithMotion } from "./FrameWithMotion.js";
/** @public */
export const DeprecatedFrameWithEvents = WithEvents(DeprecatedFrame);
// const isPreview = RenderEnvironment.target === RenderTarget.preview
// We need switcher component to useContext without conditions
// THIS SHOULD NOT BE USED DIRECTLY IN LIBRARY NOR IN VEKTER
// Only for backwards compatibility
/** @public */
export const Frame = forwardRef(function Frame(props, ref) {
    const parentSize = useParentSize();
    if (isDeprecatedFrameProps(props)) {
        const currentParentSize = props.parentSize || deprecatedParentSize(parentSize);
        // We use here DeprecatedFrame WithEvents for simplicity
        return React.createElement(DeprecatedFrameWithEvents, { ...props, parentSize: currentParentSize });
    }
    return React.createElement(FrameWithMotion, { ...props, ref: ref });
});
// NOTE: Required for performance tests, see RenderPerformance.test.ts
Frame["displayName"] = "Frame";
//# sourceMappingURL=index.js.map